export function buildPdfFileName(baseName) {
  const safeBase =
    String(baseName ?? '')
      .trim()
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, '_') || 'تقرير'

  return safeBase.toLowerCase().endsWith('.pdf') ? safeBase : `${safeBase}.pdf`
}
