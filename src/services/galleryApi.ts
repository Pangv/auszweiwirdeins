import type { Photo } from '../types/gallery'

export const API = import.meta.env.VITE_API_URL || 'https://galerie.auszweiwirdeins.de'

export async function verifyPassword(password: string, ownerId: string): Promise<boolean> {
  const res = await fetch(`${API}/api/upload`, {
    method: 'POST',
    headers: {
      'X-Upload-Password': password,
      'X-Owner-Id': ownerId,
    },
    body: new FormData(),
  })
  if (res.status === 401) return false
  if (!res.ok) throw new Error('Verbindungsfehler.')
  return true
}

export async function loadPhotos(
  limit = 100,
  offset = 0,
): Promise<{ photos: Photo[]; total: number }> {
  const res = await fetch(`${API}/api/photos?limit=${limit}&offset=${offset}`)
  if (!res.ok) throw new Error('Laden fehlgeschlagen')
  return res.json() as Promise<{ photos: Photo[]; total: number }>
}

export async function uploadFiles(
  files: File[],
  metaDates: Record<string, string>,
  password: string,
  ownerId: string,
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  const BATCH_SIZE = 5
  let uploadedCount = 0

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    const formData = new FormData()
    batch.forEach((file) => formData.append('photos', file))
    const batchMeta = Object.fromEntries(
      batch.map((f) => [f.name, metaDates[f.name]]).filter(([, v]) => v),
    )
    if (Object.keys(batchMeta).length > 0) {
      formData.append('metaDates', JSON.stringify(batchMeta))
    }

    const res = await fetch(`${API}/api/upload`, {
      method: 'POST',
      headers: {
        'X-Upload-Password': password,
        'X-Owner-Id': ownerId,
      },
      body: formData,
    })

    if (res.status === 401) throw new Error('UNAUTHORIZED')
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error ?? 'Upload fehlgeschlagen.')
    }

    uploadedCount += batch.length
    onProgress?.(uploadedCount, files.length)
  }

  return uploadedCount
}

export async function deletePhotos(
  ids: string[],
  ownerId: string,
  password: string,
): Promise<{
  deleted: string[]
  failed: { id: string; reason: string }[]
}> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Owner-Id': ownerId,
  }
  headers['X-Upload-Password'] = password

  const res = await fetch(`${API}/api/photos`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Löschen fehlgeschlagen.')
  return res.json()
}

export async function loadStorage(password: string): Promise<{ used: number; total: number }> {
  try {
    const res = await fetch(`${API}/api/storage`, {
      headers: { 'X-Upload-Password': password },
    })
    const data = await res.json()
    return { used: data.used ?? 0, total: data.total ?? 0 }
  } catch {
    return { used: 0, total: 0 }
  }
}

// Neue Funktion an bestehende anlehnen:
export async function deletePhotosAsAdmin(
  ids: string[],
  adminPassword: string, // ← bleibt Pflicht, dein Server will das
): Promise<{
  success: boolean
  deleted: string[]
  failed: Array<{ id: string; reason: 'not_found' }>
  deletedCount: number
  failedCount: number
}> {
  if (!adminPassword) {
    throw new Error('UNAUTHORIZED')
  }

  const res = await fetch('/api/admin/photos', {
    method: 'DELETE',
    headers: {
      'X-Admin-Password': adminPassword,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  })

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export async function downloadSingle(
  photoId: string,
  fileName: string,
  ownerId: string,
): Promise<void> {
  const response = await fetch(`${API}/api/photos/${photoId}/download`, {
    headers: { 'x-owner-id': ownerId },
  })

  if (!response.ok) {
    if (response.status === 404) throw new Error('Foto nicht gefunden.')
    throw new Error(`Download fehlgeschlagen: ${response.status}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

export async function downloadBulk(ids: string[], ownerId: string): Promise<void> {
  const response = await fetch(`${API}/api/photos/download`, {
    method: 'POST',
    headers: {
      'x-owner-id': ownerId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  })

  if (!response.ok) {
    if (response.status === 400) throw new Error('Ungültige Anfrage.')
    if (response.status === 404) throw new Error('Keine Fotos gefunden.')
    throw new Error(`Bulk-Download fehlgeschlagen: ${response.status}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `galerie-${ids.length}-fotos.zip`
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
