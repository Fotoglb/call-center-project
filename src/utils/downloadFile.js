export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  /*
   * الإلغاء الفوري لـ Object URL قد يمنع بعض المتصفحات من بدء التنزيل،
   * فبنستنى دورة تنفيذ قبل تحرير الذاكرة.
   */
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
