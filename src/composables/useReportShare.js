import { ref, shallowRef } from 'vue'

import { useNotification } from '@/composables/useNotification'
import { downloadBlob } from '@/utils/downloadFile'

export function useReportShare({ generatePdf, getFileName, reportTitle, shareText } = {}) {
  const notification = useNotification()

  const isPreparing = ref(false)
  const isSharing = ref(false)
  const isFallbackMenuOpen = ref(false)
  const preparedBlob = shallowRef(null)

  async function ensurePrepared() {
    if (preparedBlob.value) {
      return true
    }

    isPreparing.value = true

    try {
      preparedBlob.value = await generatePdf()

      return true
    } catch (err) {
      console.error('Report PDF preparation failed:', err)
      notification.error('تعذّر تجهيز التقرير، يرجى المحاولة مرة أخرى')

      return false
    } finally {
      isPreparing.value = false
    }
  }

  async function shareReport() {
    if (isSharing.value || isPreparing.value) {
      return
    }

    if (!(await ensurePrepared())) {
      return
    }

    isSharing.value = true

    try {
      const file = new File([preparedBlob.value], getFileName(), {
        type: 'application/pdf',
        lastModified: Date.now()
      })

      const canShareFile =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })

      if (!canShareFile) {
        isFallbackMenuOpen.value = true

        return
      }

      await navigator.share({
        title: reportTitle,
        text: shareText,
        files: [file]
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }

      console.error('Native share failed:', err)
      notification.info('تعذّرت المشاركة المباشرة، يمكنك تنزيل التقرير بدلاً من ذلك')
      isFallbackMenuOpen.value = true
    } finally {
      isSharing.value = false
    }
  }

  async function downloadReport() {
    isFallbackMenuOpen.value = false

    if (isPreparing.value) {
      return
    }

    if (!(await ensurePrepared())) {
      return
    }

    downloadBlob(preparedBlob.value, getFileName())
  }

  function invalidatePreparedReport() {
    preparedBlob.value = null
    isFallbackMenuOpen.value = false
  }

  return {
    isPreparing,
    isSharing,
    isFallbackMenuOpen,
    shareReport,
    downloadReport,
    invalidatePreparedReport
  }
}
