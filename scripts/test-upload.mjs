import { writeFileSync, mkdirSync, unlinkSync, readFileSync, existsSync } from 'fs'
import { randomUUID } from 'crypto'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load .env.local (no npm dep needed) ─────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env.local')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const API = process.env.API_URL || 'https://galerie.auszweiwirdeins.de'
const PASSWORD = process.env.UPLOAD_PASSWORD || ''
const OWNER_ID = process.env.OWNER_ID || randomUUID()
const TMP_DIR = 'scripts/tmp'

// ── Test scenarios ───────────────────────────────────────────────
const SCENARIOS = [
  { label: '1×1 pixel (minimal)',      w: 1,    h: 1,    count: 1, ext: '.jpg',  fmt: 'jpeg', type: 'happy' },
  { label: '100×100 icon',             w: 100,  h: 100,  count: 3, ext: '.jpg',  fmt: 'jpeg', type: 'happy' },
  { label: '800×600 web medium',       w: 800,  h: 600,  count: 3, ext: '.jpg',  fmt: 'jpeg', type: 'happy' },
  { label: '1920×1080 full HD',        w: 1920, h: 1080, count: 2, ext: '.jpg',  fmt: 'jpeg', type: 'happy' },
  { label: '4000×3000 large photo',    w: 4000, h: 3000, count: 1, ext: '.jpg',  fmt: 'jpeg', type: 'happy' },

  // Edge: size limits
  { label: '15 MB (boundary, pass)',   w: 100,  h: 100,  count: 1, ext: '.jpg',  fmt: 'jpeg', type: 'edge-15mb-pass' },
  { label: '15.1 MB (over limit)',     w: 100,  h: 100,  count: 1, ext: '.jpg',  fmt: 'jpeg', type: 'edge-15mb-fail' },

  // Allowed types
  { label: 'PNG type',                 w: 100,  h: 100,  count: 1, ext: '.png',  fmt: 'png',  type: 'type-test' },
  { label: 'WEBP type',                w: 100,  h: 100,  count: 1, ext: '.webp', fmt: 'webp', type: 'type-test' },
  { label: 'HEIC type',                w: 100,  h: 100,  count: 1, ext: '.heic', fmt: 'heif', type: 'type-test' },
]

const ERROR_TESTS = [
  { label: 'Wrong password',           password: 'WRONG',   expect: 401 },
  { label: 'Missing password (empty)',  password: '',        expect: 401 },
  { label: 'No files in request',      password: null,      expect: 400 },
]

// ── Helpers ──────────────────────────────────────────────────────
function fmtBytes(b) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(2)} MB`
}

function fmtMs(ms) {
  if (ms < 1000) return `${ms.toFixed(0)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function header(label) {
  console.log(`\n  ┌─ ${label} ${'─'.repeat(66 - label.length)}`)
}
function footer() {
  console.log(`  └${'─'.repeat(68)}`)
}

// ── Generate a valid image with sharp ────────────────────────────
async function makeImage(width, height, format, targetBytes) {
  const channels = format === 'jpeg' ? 3 : 4
  const raw = Buffer.alloc(width * height * channels, 0x80)

  let pipeline = sharp(raw, { raw: { width, height, channels } })

  if (format === 'jpeg') pipeline = pipeline.jpeg({ quality: 85 })
  else if (format === 'png') pipeline = pipeline.png()
  else if (format === 'webp') pipeline = pipeline.webp({ quality: 85 })
  else if (format === 'heif') pipeline = pipeline.heif({ quality: 85, compression: 'hevc' })

  let buf = await pipeline.toBuffer()

  if (targetBytes && buf.length < targetBytes) {
    const eoi = Buffer.from([0xFF, 0xD9])
    const pad = Buffer.alloc(targetBytes - buf.length, 0)
    // Append padding then re-terminate with EOI marker
    buf = Buffer.concat([buf.slice(0, -2), pad, eoi])
  }

  return buf
}

// ── Upload a single file ─────────────────────────────────────────
async function upload(filePath, filename, password) {
  const file = readFileSync(filePath)
  const mime = filename.endsWith('.jpg') ? 'image/jpeg'
    : filename.endsWith('.png') ? 'image/png'
    : filename.endsWith('.webp') ? 'image/webp'
    : filename.endsWith('.heic') ? 'image/heic'
    : 'image/jpeg'
  const form = new FormData()
  form.append('photos', new Blob([file], { type: mime }), filename)

  const headers = { 'X-Owner-Id': OWNER_ID }
  if (password) headers['X-Upload-Password'] = password

  const start = performance.now()
  const res = await fetch(`${API}/api/upload`, {
    method: 'POST',
    headers,
    body: form,
  })
  const elapsed = performance.now() - start
  let body = ''
  try { body = await res.text() } catch {}
  return { ok: res.ok, status: res.status, elapsed, body }
}

// ── Upload empty form (no files) ─────────────────────────────────
async function uploadEmpty(password) {
  const form = new FormData()
  const headers = { 'X-Owner-Id': OWNER_ID }
  if (password) headers['X-Upload-Password'] = password

  const res = await fetch(`${API}/api/upload`, {
    method: 'POST',
    headers,
    body: form,
  })
  let body = ''
  try { body = await res.text() } catch {}
  return { ok: res.ok, status: res.status, body }
}

// ── List photos ──────────────────────────────────────────────────
async function listPhotos(limit, offset) {
  const params = new URLSearchParams()
  if (limit != null) params.set('limit', String(limit))
  if (offset != null) params.set('offset', String(offset))
  const url = `${API}/api/photos${params.toString() ? '?' + params.toString() : ''}`
  const start = performance.now()
  const res = await fetch(url)
  const elapsed = performance.now() - start
  let body
  try { body = await res.json() } catch { body = null }
  return { ok: res.ok, status: res.status, elapsed, body }
}

// ── Delete a photo ───────────────────────────────────────────────
async function deletePhoto(id) {
  const res = await fetch(`${API}/api/photos/${id}`, {
    method: 'DELETE',
    headers: { 'X-Owner-Id': OWNER_ID },
  })
  let body
  try { body = await res.json() } catch { body = null }
  return { ok: res.ok, status: res.status, body }
}

// ── Generate and write a test file ───────────────────────────────
async function generateFile(scenario, index) {
  const name = `test_${scenario.w}x${scenario.h}_${index}${scenario.ext}`

  let targetBytes
  if (scenario.type === 'edge-15mb-pass') targetBytes = 15 * 1024 * 1024
  if (scenario.type === 'edge-15mb-fail') targetBytes = Math.ceil(15.1 * 1024 * 1024)

  const buf = await makeImage(scenario.w, scenario.h, scenario.fmt, targetBytes)
  writeFileSync(`${TMP_DIR}/${name}`, buf)
  return { path: `${TMP_DIR}/${name}`, name }
}

// ════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  if (!PASSWORD) {
    console.log('❌  Set UPLOAD_PASSWORD env var')
    process.exit(1)
  }

  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

  console.log()
  console.log(`  ╔══════════════════════════════════════════════════════════════════╗`)
  console.log(`  ║           Hochzeitsgalerie API — Upload-Test                     ║`)
  console.log(`  ╚══════════════════════════════════════════════════════════════════╝`)
  console.log()
  console.log(`  🔐  Owner-ID: ${OWNER_ID}`)
  console.log(`  🌐  API:      ${API}`)
  console.log()

  // ── 1. List before upload ──────────────────────────────────────
  header('1. Gallery state before upload')
  const before = await listPhotos(1, 0)
  if (before.ok) {
    const total = before.body?.total ?? '?'
    console.log(`  📋  ${total} photos in gallery (limit=1 snapshots: ${before.body?.photos?.length ?? 0})`)
  } else {
    console.log(`  ❌  GET /api/photos → ${before.status}`)
  }
  footer()

  // ── 2. Happy path: uploads ─────────────────────────────────────
  header('2. Happy path — valid uploads')
  const happyScenarios = SCENARIOS.filter(s => s.type === 'happy')
  const uploadedIds = []
  let totalUploadedBytes = 0

  for (const scenario of happyScenarios) {
    for (let i = 0; i < scenario.count; i++) {
      const { path, name } = await generateFile(scenario, i)
      const bytes = readFileSync(path).length
      totalUploadedBytes += bytes

      const r = await upload(path, name, PASSWORD)
      const icon = r.ok ? '✅' : '❌'
      const statusInfo = r.ok ? `${r.status}` : `${r.status} ${truncate(r.body, 60)}`
      console.log(`  ${icon} ${name.padEnd(32)} ${fmtBytes(bytes).padStart(9)}  →  ${statusInfo}`)

      if (r.ok) {
        try {
          const parsed = JSON.parse(r.body)
          if (parsed.photos?.[0]?.id) uploadedIds.push(parsed.photos[0].id)
        } catch {}
      }

      unlinkSync(path)
      await sleep(200)
    }
  }
  console.log(`  📦  ${happyScenarios.reduce((a, s) => a + s.count, 0)} files, ${fmtBytes(totalUploadedBytes)} uploaded`)
  footer()

  // ── 3. Type tests ──────────────────────────────────────────────
  header('3. File-type acceptance (PNG / WEBP / HEIC)')
  const typeScenarios = SCENARIOS.filter(s => s.type === 'type-test')
  for (const scenario of typeScenarios) {
    let r, bytes, name
    try {
      const file = await generateFile(scenario, 0)
      name = file.name
      bytes = readFileSync(file.path).length
      r = await upload(file.path, name, PASSWORD)
      unlinkSync(file.path)
    } catch (e) {
      const n = 'test_100x100_0' + scenario.ext
      console.log(`  ⏭️  ${n.padEnd(32)} — skipped (${e.message})`)
      continue
    }
    const icon = r.ok ? '✅' : '❌'
    console.log(`  ${icon} ${name.padEnd(32)} ${fmtBytes(bytes).padStart(9)}  →  ${r.status} ${truncate(r.body, 60)}`)
    if (r.ok) {
      try {
        const parsed = JSON.parse(r.body)
        if (parsed.photos?.[0]?.id) uploadedIds.push(parsed.photos[0].id)
      } catch {}
    }
    await sleep(200)
  }
  footer()

  // ── 4. Edge: 15 MB boundary ────────────────────────────────────
  header('4. Edge — 15 MB file-size boundary')
  for (const scenario of SCENARIOS.filter(s => s.type.startsWith('edge-'))) {
    const { path, name } = await generateFile(scenario, 0)
    const bytes = readFileSync(path).length
    const r = await upload(path, name, PASSWORD)
    const icon = r.ok ? '✅' : '❌'
    console.log(`  ${icon} ${name.padEnd(32)} ${fmtBytes(bytes).padStart(9)}  →  ${r.status} ${truncate(r.body, 60)}`)
    if (r.ok) {
      try {
        const parsed = JSON.parse(r.body)
        if (parsed.photos?.[0]?.id) uploadedIds.push(parsed.photos[0].id)
      } catch {}
    }
    unlinkSync(path)
    await sleep(200)
  }
  footer()

  // ── 5. Error cases ─────────────────────────────────────────────
  header('5. Error-case uploads')
  for (const test of ERROR_TESTS) {
    let r
    if (test.password === null) {
      r = await uploadEmpty(PASSWORD)
    } else {
      const { path, name } = await generateFile({ w: 100, h: 100, fmt: 'jpeg', ext: '.jpg' }, 0)
      r = await upload(path, name, test.password)
      unlinkSync(path)
    }
    const pass = r.status === test.expect
    console.log(`  ${pass ? '✅' : '❌'} ${test.label.padEnd(32)} ${String(r.status).padStart(3)} (expected ${test.expect}) ${truncate(r.body, 50)}`)
    await sleep(200)
  }
  footer()

  // ── 6. Pagination ──────────────────────────────────────────────
  header('6. Pagination — GET /api/photos')
  const page1 = await listPhotos(3, 0)
  if (page1.ok) {
    const count = page1.body?.photos?.length ?? 0
    const total = page1.body?.total ?? '?'
    console.log(`  📋  limit=3 offset=0 → ${count} photos returned, total=${total}`)
    if (count > 0) console.log(`  🆔  First photo ID: ${page1.body.photos[0]?.id ?? '?'}`)
  } else {
    console.log(`  ❌  GET /api/photos → ${page1.status}`)
  }
  const page2 = await listPhotos(3, 3)
  if (page2.ok) {
    const count = page2.body?.photos?.length ?? 0
    console.log(`  📋  limit=3 offset=3 → ${count} photos returned`)
  }
  footer()

  // ── 7. Cleanup ─────────────────────────────────────────────────
  header('7. Cleanup — delete uploaded test photos')
  let deleted = 0
  for (const id of uploadedIds) {
    const r = await deletePhoto(id)
    const icon = r.ok ? '✅' : '❌'
    if (r.ok) deleted++
    const detail = r.ok ? '' : `  ${r.body?.error ?? r.status}`
    console.log(`  ${icon}  ${id.padEnd(28)} → ${r.status}${detail}`)
    await sleep(100)
  }
  console.log(`  🧹  ${deleted}/${uploadedIds.length} cleaned up`)
  footer()

  console.log()
  console.log(`  ╔══════════════════════════════════════════════════════════════════╗`)
  console.log(`  ║  Done.                                                          ║`)
  console.log(`  ╚══════════════════════════════════════════════════════════════════╝`)
  console.log()
}

function truncate(s, max) {
  if (!s) return ''
  const str = typeof s === 'string' ? s : JSON.stringify(s)
  if (str.length <= max) return str
  return str.substring(0, max) + '…'
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

main().catch(e => {
  console.error('Fatal:', e)
  process.exit(1)
})