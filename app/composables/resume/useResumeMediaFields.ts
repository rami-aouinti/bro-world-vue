export function useResumeMediaFields() {
  const { t } = useI18n()
  const EXPERIENCE_LOGO_MAX_FILE_SIZE = 2 * 1024 * 1024
  const EXPERIENCE_LOGO_ALLOWED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
  ]

  function validateExperienceLogoFile(file: File) {
    if (!EXPERIENCE_LOGO_ALLOWED_TYPES.includes(file.type)) {
      return t('resumeBuilder.create.validation.logoInvalidFormat')
    }
    if (file.size > EXPERIENCE_LOGO_MAX_FILE_SIZE) {
      return t('resumeBuilder.create.validation.logoFileTooLarge')
    }
    return ''
  }

  function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
      reader.onerror = () => reject(new Error(t('resumeBuilder.create.validation.logoReadFailed')))
      reader.readAsDataURL(file)
    })
  }

  async function applyExperienceLogoFromFile(
    file: File,
    target: { onSuccess: (dataUrl: string) => void; onError?: (message: string) => void },
  ) {
    const validationMessage = validateExperienceLogoFile(file)
    if (validationMessage) {
      target.onError?.(validationMessage)
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      target.onSuccess(dataUrl)
      target.onError?.('')
    } catch {
      target.onError?.(t('resumeBuilder.create.validation.logoLoadFailed'))
    }
  }

  return { validateExperienceLogoFile, readFileAsDataUrl, applyExperienceLogoFromFile }
}
