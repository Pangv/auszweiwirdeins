import { ref } from 'vue'
import { auth } from '../firebase'
import { signInAnonymously } from 'firebase/auth'
import { requestNewCode, recoverByCode, tryAutoRecover } from '../services/galleryFirestore'
import { verifyPassword } from '../services/galleryApi'

const OWNER_ID_KEY = 'galerie_owner_id'
const GALLERY_CODE_KEY = 'galerie_gallery_code'
const PASSWORD_KEY = 'galerie_password'

let storedOwnerId = localStorage.getItem(OWNER_ID_KEY)
if (!storedOwnerId) {
  storedOwnerId = crypto.randomUUID()
  localStorage.setItem(OWNER_ID_KEY, storedOwnerId)
}

export function useGalleryAuth() {
  const ownerId = ref<string>(storedOwnerId!)
  const galleryCode = ref<string>(localStorage.getItem(GALLERY_CODE_KEY) || '')
  const password = ref<string>(localStorage.getItem(PASSWORD_KEY) || '')
  const isPasswordVerified = ref<boolean>(!!localStorage.getItem(PASSWORD_KEY))

  const passwordVerifying = ref(false)
  const passwordError = ref('')

  const codeCreated = ref('')
  const codeInput = ref('')
  const codeRecovering = ref(false)

  async function initAuth(): Promise<void> {
    if (auth.currentUser) return
    try {
      await signInAnonymously(auth)
    } catch (e) {
      console.error('initAuth: signInAnonymously failed', e)
    }
  }

  async function verifyPasswordAction(pw: string): Promise<boolean> {
    if (!pw) return false
    passwordVerifying.value = true
    passwordError.value = ''
    try {
      const ok = await verifyPassword(pw, ownerId.value)
      if (!ok) {
        passwordError.value = 'Falsches Passwort.'
        password.value = ''
        isPasswordVerified.value = false
        localStorage.removeItem(PASSWORD_KEY)
        return false
      }
      localStorage.setItem(PASSWORD_KEY, pw)
      password.value = pw
      isPasswordVerified.value = true
      return true
    } catch {
      passwordError.value = 'Verbindungsfehler.'
      password.value = ''
      isPasswordVerified.value = false
      localStorage.removeItem(PASSWORD_KEY)
      return false
    } finally {
      passwordVerifying.value = false
    }
  }

  async function requestNewCodeAction(): Promise<string> {
    const newCode = await requestNewCode(ownerId.value)
    localStorage.setItem(GALLERY_CODE_KEY, newCode)
    galleryCode.value = newCode
    codeCreated.value = newCode
    return newCode
  }

  async function recoverByCodeAction(code?: string): Promise<void> {
    const c = code || codeInput.value
    if (!c || c.length !== 8) throw new Error('Bitte einen 8-stelligen Code eingeben.')
    codeRecovering.value = true
    try {
      const result = await recoverByCode(c)
      if (!result) throw new Error('Code nicht gefunden.')
      ownerId.value = result.ownerId
      localStorage.setItem(OWNER_ID_KEY, result.ownerId)
      localStorage.setItem(GALLERY_CODE_KEY, result.code)
      galleryCode.value = result.code
    } finally {
      codeRecovering.value = false
    }
  }

  async function recoverOwnerId(): Promise<void> {
    if (!galleryCode.value) return
    try {
      const recoveredOwnerId = await tryAutoRecover(galleryCode.value)
      if (recoveredOwnerId) {
        ownerId.value = recoveredOwnerId
        localStorage.setItem(OWNER_ID_KEY, recoveredOwnerId)
      }
    } catch {
      // silent
    }
  }

  function clearCodeBanner() {
    setTimeout(() => { codeCreated.value = '' }, 100)
  }

  function handleUnauthorizedUpload(): void {
    password.value = ''
    isPasswordVerified.value = false
    localStorage.removeItem(PASSWORD_KEY)
  }

  return {
    ownerId,
    galleryCode,
    password,
    isPasswordVerified,
    passwordVerifying,
    passwordError,
    codeCreated,
    codeInput,
    codeRecovering,
    initAuth,
    verifyPassword: verifyPasswordAction,
    requestNewCode: requestNewCodeAction,
    recoverByCode: recoverByCodeAction,
    recoverOwnerId,
    clearCodeBanner,
    handleUnauthorizedUpload,
  }
}
