import { db, auth } from '../firebase'
import { signInAnonymously } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore'

export async function requestNewCode(ownerId: string): Promise<string> {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth)
    } catch (e) {
      throw new Error('Anonyme Anmeldung fehlgeschlagen: ' + (e as Error).message)
    }
  }
  const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
  await addDoc(collection(db, 'gallery_owners'), {
    code: newCode,
    owner_id: ownerId,
    created_at: serverTimestamp(),
  })
  return newCode
}

export async function recoverByCode(code: string): Promise<{ ownerId: string; code: string } | null> {
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
  const snap = await getDocs(
    query(
      collection(db, 'gallery_owners'),
      where('code', '==', code.toUpperCase()),
      limit(1),
    ),
  )
  if (snap.empty) return null
  const data = snap.docs[0]!.data()
  return { ownerId: data.owner_id as string, code: code.toUpperCase() }
}

export async function tryAutoRecover(code: string): Promise<string | null> {
  const snap = await getDocs(
    query(
      collection(db, 'gallery_owners'),
      where('code', '==', code),
      limit(1),
    ),
  )
  if (snap.empty) return null
  return snap.docs[0]!.data().owner_id as string
}