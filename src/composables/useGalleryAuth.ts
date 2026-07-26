import { ref } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
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

  const showCodePrompt = ref(false)
  const codeInput = ref('')
  const codeRecovering = ref(false)

  const showPasswordPrompt = ref(!isPasswordVerified.value)
  const passwordVerifying = ref(false)
  const passwordError = ref('')
  const editingCodeMode = ref<'new' | 'existing' | null>(null)

  async function initAuth(): Promise<void> {
    return new Promise<void>((resolve) => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          unsub()
          resolve()
        } else {
          try {
            await signInAnonymously(auth)
            unsub()
            resolve()
          } catch {
            unsub()
            resolve()
          }
        }
      })
    })
  }

  async function requestNewCodeAction(): Promise<string> {
    const newCode = await requestNewCode(ownerId.value)
    localStorage.setItem(GALLERY_CODE_KEY, newCode)
    galleryCode.value = newCode
    showCodePrompt.value = false
    return newCode
  }

  async function recoverByCodeAction(): Promise<void> {
    if (!codeInput.value || codeInput.value.length !== 8) return
    codeRecovering.value = true
    try {
      const result = await recoverByCode(codeInput.value)
      if (result) {
        ownerId.value = result.ownerId
        localStorage.setItem(OWNER_ID_KEY, result.ownerId)
        localStorage.setItem(GALLERY_CODE_KEY, result.code)
        galleryCode.value = result.code
        showCodePrompt.value = false
      } else {
        throw new Error('Zugangscode nicht gefunden.')
      }
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
    } catch (e) {
      console.error('tryAutoRecover:', e)
    }
  }

  async function verifyPasswordAction(): Promise<boolean> {
    if (!password.value) return false
    passwordVerifying.value = true
    passwordError.value = ''
    try {
      const ok = await verifyPassword(password.value, ownerId.value)
      if (!ok) {
        passwordError.value = 'Falscher Bearbeitungs-Code!'
        password.value = ''
        isPasswordVerified.value = false
        localStorage.removeItem(PASSWORD_KEY)
        return false
      }
      localStorage.setItem(PASSWORD_KEY, password.value)
      isPasswordVerified.value = true
      showPasswordPrompt.value = false
      editingCodeMode.value = null
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

  function handleUnauthorizedUpload(): void {
    password.value = ''
    isPasswordVerified.value = false
    showPasswordPrompt.value = true
    editingCodeMode.value = null
    localStorage.removeItem(PASSWORD_KEY)
  }

  return {
    ownerId,
    galleryCode,
    password,
    isPasswordVerified,
    showCodePrompt,
    codeInput,
    codeRecovering,
    showPasswordPrompt,
    passwordVerifying,
    passwordError,
    editingCodeMode,
    initAuth,
    requestNewCode: requestNewCodeAction,
    recoverByCode: recoverByCodeAction,
    recoverOwnerId,
    verifyPassword: verifyPasswordAction,
    handleUnauthorizedUpload,
  }
}