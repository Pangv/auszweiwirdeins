import type { Photo } from '../types/gallery'

export const API = 'https://galerie.auszweiwirdeins.de'

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

export async function loadPhotos(): Promise<Photo[]> {
  const res = await fetch(`${API}/api/photos?limit=100`)
  if (!res.ok) throw new Error('Laden fehlgeschlagen')
  const data: { photos: Photo[] } = await res.json()
  return data.photos ?? []
}

export async function uploadFiles(
  files: File[],
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

export async function deletePhotos(ids: string[], ownerId: string, password: string): Promise<{
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