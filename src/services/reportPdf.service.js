import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

/*
 * حجم الصفحة ثابت A4 دايمًا (210×297مم)، فلو المحتوى أطول من
 * صفحة واحدة بنقسمه على أكتر من صفحة بدل ما نكبّر/نصغّر الصفحة
 * نفسها حسب طول المحتوى.
 */
const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const MARGIN_MM = 10

function waitForNextPaint() {
  return new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })
}

async function waitForRenderReady() {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready
  }

  /*
   * Chart.js ما بيوفرش Promise عام لـ "كل الرسوم خلصت الرسم"،
   * فبنستنى paint frame كامل (بدل setTimeout عشوائي) قبل التقاط الصورة.
   */
  await waitForNextPaint()
}

export async function generateReportPdfBlob(element, { backgroundColor = '#FFFFFF', scale = 1.5 } = {}) {
  if (!element) {
    throw new Error('Report element is not available for PDF generation')
  }

  await waitForRenderReady()

  const usableWidthMm = PAGE_WIDTH_MM - MARGIN_MM * 2
  const usableHeightMm = PAGE_HEIGHT_MM - MARGIN_MM * 2

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    useCORS: true
  })

  const pxToMm = usableWidthMm / canvas.width
  const pageHeightPx = Math.floor(usableHeightMm / pxToMm)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  let renderedPx = 0
  let pageIndex = 0

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx)

    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = canvas.width
    sliceCanvas.height = sliceHeightPx

    const ctx = sliceCanvas.getContext('2d')
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
    ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx)

    if (pageIndex > 0) {
      pdf.addPage()
    }

    pdf.setFillColor(backgroundColor)
    pdf.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F')

    pdf.addImage(
      sliceCanvas.toDataURL('image/jpeg', 0.85),
      'JPEG',
      MARGIN_MM,
      MARGIN_MM,
      usableWidthMm,
      sliceHeightPx * pxToMm
    )

    renderedPx += sliceHeightPx
    pageIndex++
  }

  return pdf.output('blob')
}
