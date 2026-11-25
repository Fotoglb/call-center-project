const headers = ['اسم العميل', 'رقم الهاتف', 'الموظف المسؤول', 'نوع المشروع', 'موعد الاتصال القادم', 'آخر تواصل', 'مدة المكالمة', 'الحالة', 'ملاحظات']
const asText = value => value == null ? '' : String(value)

function filterSummary(filters = {}) {
  const parts = []
  if (filters.search) parts.push(`البحث: ${asText(filters.search)}`)
  if (filters.type) parts.push(`نوع المشروع: ${asText(filters.type)}`)
  if (filters.agent) parts.push(`الموظف: ${asText(filters.agent)}`)
  if (filters.status) parts.push(`النتيجة: ${asText(filters.status)}`)
  return parts.length ? parts.join(' | ') : 'الفلاتر: الكل'
}

function exportMeta(options = {}) {
  const date = new Date(options.exportedAt || Date.now())
  return { title: options.title || 'سجل المكالمات', date: Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ar', { calendar: 'gregory', dateStyle: 'medium', timeStyle: 'short' }), filters: options.filterText || filterSummary(options.filters) }
}

export async function exportCallsExcel(rows, options = {}) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const meta = exportMeta(options)
  const sheet = workbook.addWorksheet('سجل المكالمات', { views: [{ rightToLeft: true, state: 'frozen', ySplit: 5 }] })
  const end = String.fromCharCode(64 + headers.length)
  sheet.mergeCells(`A1:${end}1`); sheet.mergeCells(`A2:${end}2`); sheet.mergeCells(`A3:${end}3`)
  sheet.getCell('A1').value = meta.title; sheet.getCell('A2').value = `تاريخ التصدير: ${meta.date}`; sheet.getCell('A3').value = meta.filters
  sheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF111827' } }; sheet.getRow(2).font = { size: 11, color: { argb: 'FF4B5563' } }; sheet.getRow(3).font = { size: 11, color: { argb: 'FF4B5563' } }
  for (const n of [1, 2, 3]) sheet.getRow(n).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true }
  sheet.getRow(4).height = 8; sheet.addRow(headers)
  const headerRow = 5; [24, 19, 23, 20, 24, 24, 16, 18, 60].forEach((width, index) => { sheet.getColumn(index + 1).width = width })
  rows.forEach(row => sheet.addRow(row.map(asText)))
  sheet.getRow(headerRow).font = { bold: true, color: { argb: 'FFFFFFFF' } }; sheet.getRow(headerRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } }
  sheet.eachRow((row, number) => { if (number >= headerRow) row.alignment = { horizontal: 'right', vertical: 'top', wrapText: true } })
  for (let n = headerRow + 1; n <= headerRow + rows.length; n++) { sheet.getCell(`B${n}`).value = asText(sheet.getCell(`B${n}`).value); sheet.getCell(`B${n}`).numFmt = '@' }
  sheet.autoFilter = { from: `A${headerRow}`, to: `${end}${headerRow + rows.length}` }
  if (rows.length) sheet.addTable({
    name: 'CallsExport',
    ref: `A${headerRow}:${end}${headerRow + rows.length}`,
    headerRow: true,
    columns: headers.map(name => ({ name })),
    rows: rows.map(row => row.map(asText)),
    style: { theme: 'TableStyleMedium2', showRowStripes: true }
  })
  return new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function statusStyle(value) {
  const text = asText(value)
  if (text.includes('غير') || text.includes('لا يرد')) return ['#fef2f2', '#dc2626']
  if (text.includes('مهتم')) return ['#ecfdf5', '#047857']
  if (text.includes('إعادة')) return ['#eef2ff', '#4f46e5']
  if (text.includes('زيارة')) return ['#eff6ff', '#2563eb']
  return ['#f3f4f6', '#4b5563']
}

export async function exportCallsPdf(rows, options = {}) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')])
  await document.fonts?.ready
  const meta = exportMeta(options); const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const container = document.createElement('div'); container.dir = 'rtl'; container.style.cssText = 'position:absolute;left:-20000px;top:0;width:1450px;background:#fff;color:#111827;padding:24px;font-family:Tajawal,Arial,sans-serif;'; document.body.appendChild(container)
  const rowsPerPage = 10; const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage))
  try {
    for (let page = 0; page < pageCount; page++) {
      container.replaceChildren()
      const title = document.createElement('h1'); title.textContent = meta.title; title.style.cssText = 'font-size:24px;margin:0 0 8px;text-align:right;'
      const date = document.createElement('div'); date.textContent = `تاريخ التصدير: ${meta.date}`; date.style.cssText = 'font-size:14px;color:#4b5563;margin-bottom:4px;text-align:right;'
      const filters = document.createElement('div'); filters.textContent = meta.filters; filters.style.cssText = 'font-size:13px;color:#6b7280;margin-bottom:16px;text-align:right;'; container.append(title, date, filters)
      const table = document.createElement('table'); table.dir = 'rtl'; table.style.cssText = 'width:100%;border-collapse:collapse;table-layout:fixed;font-size:13px;'
      const colgroup = document.createElement('colgroup'); ['13%','11%','13%','12%','13%','12%','8%','8%','20%'].forEach(width => { const col = document.createElement('col'); col.style.width = width; colgroup.appendChild(col) }); table.appendChild(colgroup)
      const thead = document.createElement('thead'); const heading = document.createElement('tr'); headers.forEach(label => { const cell = document.createElement('th'); cell.textContent = label; cell.style.cssText = 'border:1px solid #d1d5db;padding:9px 6px;background:#374151;color:#fff;text-align:right;vertical-align:middle;'; heading.appendChild(cell) }); thead.appendChild(heading); table.appendChild(thead)
      const tbody = document.createElement('tbody'); rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage).forEach(row => { const tr = document.createElement('tr'); row.forEach((value, index) => { const cell = document.createElement('td'); cell.textContent = asText(value); cell.style.cssText = 'border:1px solid #e5e7eb;padding:8px 6px;vertical-align:top;overflow-wrap:anywhere;white-space:normal;text-align:right;'; if (index === 1 || index === 6) cell.dir = 'ltr'; if (index === 7) { const [background, color] = statusStyle(value); cell.style.background = background; cell.style.color = color; cell.style.fontWeight = '600' }; tr.appendChild(cell) }); tbody.appendChild(tr) }); table.appendChild(tbody); container.appendChild(table)
      const canvas = await html2canvas(container, { scale: 1.5, backgroundColor: '#ffffff', windowWidth: 1500 }); const ratio = Math.min(277 / canvas.width, 177 / canvas.height)
      if (page) pdf.addPage(); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, canvas.width * ratio, canvas.height * ratio); pdf.setFontSize(9); pdf.setTextColor(75, 85, 99); pdf.text(`${page + 1} / ${pageCount}`, 148, 202, { align: 'center' }); canvas.width = canvas.height = 0
    }
    return pdf.output('blob')
  } finally { container.remove() }
}
