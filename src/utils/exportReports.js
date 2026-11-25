import ExcelJS from 'exceljs'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

const text = value => value == null ? '' : String(value)
const dateText = value => value ? text(value) : ''

function styleHeader(row) {
  row.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
    cell.alignment = { vertical: 'middle', horizontal: 'right', readingOrder: 'rtl', wrapText: true }
  })
  row.height = 24
}

function finishSheet(sheet, headerRow = 1) {
  sheet.views = [{ rightToLeft: true, state: 'frozen', ySplit: headerRow }]
  const end = sheet.getColumn(sheet.columnCount).letter
  if (sheet.columnCount) sheet.autoFilter = { from: `A${headerRow}`, to: `${end}${Math.max(headerRow, sheet.rowCount)}` }
  sheet.columns.forEach(column => {
    let width = 12
    column.eachCell({ includeEmpty: true }, cell => { width = Math.max(width, Math.min(55, text(cell.value).length + 3)) })
    column.width = width
  })
  for (let row = headerRow + 1; row <= sheet.rowCount; row++) sheet.getRow(row).alignment = { vertical: 'top', horizontal: 'right', readingOrder: 'rtl', wrapText: true }
  styleHeader(sheet.getRow(headerRow))
}

function addRowsSheet(workbook, name, headers, rows, formats = {}) {
  const sheet = workbook.addWorksheet(name, { views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }] })
  sheet.columns = headers.map(item => ({ header: item.label, key: item.key }))
  rows.forEach(row => sheet.addRow(row))
  Object.entries(formats).forEach(([key, format]) => { sheet.getColumn(key).numFmt = format })
  finishSheet(sheet)
  return sheet
}

function addChartImage(workbook, sheet, image, title, dataLength = 0, aspectRatio = 0.48, fixedWidth = null) {
  if (!image || !sheet) return
  const startRow = sheet.rowCount + 3
  sheet.getCell(`A${startRow}`).value = title
  sheet.getCell(`A${startRow}`).font = { bold: true, size: 14, color: { argb: 'FF111827' } }
  sheet.getCell(`A${startRow}`).alignment = { horizontal: 'right', readingOrder: 'rtl' }
  const imageId = workbook.addImage({ base64: image, extension: 'png' })
  const width = fixedWidth ?? Math.min(760, Math.max(480, 480 + Math.min(10, dataLength) * 28))
  const height = Math.round(width * aspectRatio)
  sheet.addImage(imageId, { tl: { col: 0, row: startRow }, ext: { width, height } })
  for (let row = startRow + 1; row <= startRow + Math.ceil(height / 20) + 2; row++) sheet.getRow(row).height = 20
}

export async function exportReportsExcel(report) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'نظام مركز الاتصالات'; workbook.created = new Date()
  const meta = report.meta
  const summaryRows = [...report.cards.map(card => ({ label: card.label, value: card.unit === '%' && card.value !== '' ? Number(card.value) / 100 : card.value ?? '' })), { label: 'الفترة الزمنية', value: `${meta.from} إلى ${meta.to}` }, { label: 'الفلاتر المطبقة', value: meta.filters }]
  const summarySheet = addRowsSheet(workbook, 'ملخص الإحصائيات', [{ label: 'المؤشر', key: 'label' }, { label: 'القيمة', key: 'value' }], summaryRows)
  report.cards.forEach((card, index) => { if (card.unit === '%') summarySheet.getCell(`B${index + 2}`).numFmt = '0%' })
  addRowsSheet(workbook, 'الاتجاه الزمني', [{ label: 'التاريخ', key: 'date' }, { label: 'عملاء جدد', key: 'leads' }, { label: 'التحويلات', key: 'converted' }, { label: 'المكالمات', key: 'calls' }, { label: 'الزيارات', key: 'visits' }], report.trend.map(row => ({ date: dateText(row.date), leads: row.leads ?? '', converted: row.converted ?? '', calls: row.calls ?? '', visits: row.visits ?? '' })))
  addRowsSheet(workbook, 'مصادر العملاء', [{ label: 'المصدر', key: 'name' }, { label: 'النسبة', key: 'percent' }, { label: 'العدد', key: 'count' }, { label: 'اللون', key: 'color' }], report.sources.map(row => ({ name: row.name, percent: row.percent == null ? '' : Number(row.percent) / 100, count: row.count ?? '', color: row.color ?? '' })), { percent: '0%' })
  addRowsSheet(workbook, 'أداء الموظفين', [{ label: 'الموظف', key: 'name' }, { label: 'المكالمات', key: 'calls' }, { label: 'عملاء جدد', key: 'newCustomers' }, { label: 'التحويلات', key: 'conversions' }], report.employees.map(row => ({ name: row.name, calls: row.calls ?? '', newCustomers: row.newCustomers ?? '', conversions: row.conversions ?? '' })))
  addRowsSheet(workbook, 'نجاح الزيارات', [{ label: 'التاريخ', key: 'date' }, { label: 'الزيارات', key: 'visits' }], report.visitTrend.map(row => ({ date: dateText(row.date), visits: row.visits ?? '' })))
  const tableHeaders = [{ label: 'الموظف', key: 'name' }, { label: 'عدد المكالمات', key: 'calls' }, { label: 'عملاء جدد', key: 'newCustomers' }, { label: 'التحويلات', key: 'conversions' }, { label: 'معدل التحويل', key: 'conversionRate' }, { label: 'مهتم', key: 'interested' }, { label: 'لا يرد', key: 'noAnswer' }, { label: 'متوسط مدة المكالمة (ثانية)', key: 'avgDurationSec' }, { label: 'الزيارات', key: 'visits' }, { label: 'نجاح الزيارات', key: 'visitSuccessRate' }, { label: 'نقاط الأداء', key: 'score' }, { label: 'الأداء', key: 'performance' }]
  addRowsSheet(workbook, 'تقرير الأداء الوظيفي', tableHeaders, report.employeeTable, { conversionRate: '0%', visitSuccessRate: '0%' })
  addChartImage(workbook, workbook.worksheets[1], report.charts.conversion, 'معدل التحويل — الاتجاه الزمني', report.trend.length, 0.48, 760)
  addChartImage(workbook, workbook.worksheets[2], report.charts.sources, 'توزيع مصادر العملاء', report.sources.length, 0.84, 500)
  addChartImage(workbook, workbook.worksheets[3], report.charts.employees, 'أداء الموظفين', report.employees.length, 0.84, 500)
  addChartImage(workbook, workbook.worksheets[4], report.charts.visits, 'معدل نجاح الزيارات', report.visitTrend.length, 0.48, 560)
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function node(tag, content, style = {}) {
  const item = document.createElement(tag); item.textContent = content == null ? '' : content; Object.assign(item.style, style); return item
}

export async function exportReportsPdf(report) {
  await document.fonts?.ready
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const container = document.createElement('div'); container.dir = 'rtl'; container.style.cssText = 'position:absolute;left:-20000px;top:0;width:1450px;background:#fff;color:#111827;padding:30px;font-family:Tajawal,Arial,sans-serif;'
  document.body.appendChild(container)
  const pages = []
  const addPage = (title, body) => pages.push({ title, body })
  if (report.cards.length) addPage('ملخص الإحصائيات', () => {
    const wrap = document.createElement('div'); wrap.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:18px;'
    report.cards.forEach(card => { const box = document.createElement('div'); box.style.cssText = 'border:1px solid #e5e7eb;border-radius:12px;padding:22px;text-align:center;'; box.append(node('div', card.label, { fontSize: '18px', color: '#4b5563' }), node('strong', (card.value ?? '') + (card.unit || ''), { display: 'block', fontSize: '28px', marginTop: '12px' })); wrap.appendChild(box) }); return wrap
  })
  const chartPage = (title, image, period = '') => () => { const wrap = document.createElement('div'); if (period) wrap.appendChild(node('div', period, { color: '#6b7280', marginBottom: '12px' })); if (image) { const img = document.createElement('img'); img.src = image; img.style.cssText = 'display:block;width:100%;height:420px;object-fit:contain;'; wrap.appendChild(img) } else wrap.appendChild(node('div', 'لا توجد بيانات', { padding: '80px', textAlign: 'center', color: '#9ca3af' })); return wrap }
  if (report.trend.length || report.charts.conversion) addPage('معدل التحويل — الاتجاه الزمني', chartPage('', report.charts.conversion, `${report.meta.from} إلى ${report.meta.to}`))
  if (report.sources.length || report.charts.sources) addPage('توزيع مصادر العملاء', chartPage('', report.charts.sources))
  if (report.employees.length || report.charts.employees) addPage('أداء الموظفين', chartPage('', report.charts.employees))
  if (report.visitTrend.length || report.charts.visits) addPage('معدل نجاح الزيارات', chartPage('', report.charts.visits))
  const tableRows = report.employeeTable; for (let offset = 0; offset < tableRows.length; offset += 10) addPage(`تقرير الأداء الوظيفي (${Math.floor(offset / 10) + 1})`, () => {
    const table = document.createElement('table'); table.style.cssText = 'width:100%;border-collapse:collapse;table-layout:fixed;font-size:12px;'; const headers = ['الموظف','المكالمات','عملاء جدد','التحويلات','معدل التحويل','مهتم','لا يرد','متوسط المدة','الزيارات','نجاح الزيارات','النقاط','الأداء']; const thead = document.createElement('thead'); const tr = document.createElement('tr'); headers.forEach(label => { const th = node('th', label, { background: '#1f2937', color: '#fff', padding: '9px', border: '1px solid #d1d5db' }); tr.appendChild(th) }); thead.appendChild(tr); table.appendChild(thead); const tbody = document.createElement('tbody'); tableRows.slice(offset, offset + 10).forEach(row => { const line = document.createElement('tr'); [row.name,row.calls,row.newCustomers,row.conversions,row.conversionRate == null ? '' : `${row.conversionRate}%`,row.interested,row.noAnswer,row.avgDurationSec,row.visits,row.visitSuccessRate == null ? '' : `${row.visitSuccessRate}%`,row.score,row.performance].forEach((value, index) => { const cell = node('td', value, { padding: '8px', border: '1px solid #e5e7eb', overflowWrap: 'anywhere', verticalAlign: 'top' }); if (index === 11 && String(value).includes('تحويل')) { cell.style.background = '#ecfdf5'; cell.style.color = '#047857' } else if (index === 11 && String(value).includes('غير')) { cell.style.background = '#fef2f2'; cell.style.color = '#dc2626' } line.appendChild(cell) }); tbody.appendChild(line) }); table.appendChild(tbody); return table
  })
  const pageCount = pages.length
  for (let index = 0; index < pages.length; index++) { container.replaceChildren(); container.append(node('h1', 'تقرير التقارير والتحليلات', { fontSize: '24px', margin: '0 0 4px' }), node('div', `تاريخ التصدير: ${report.meta.exportedAt} | الفترة: ${report.meta.from} إلى ${report.meta.to}`, { color: '#4b5563', marginBottom: '4px' }), node('div', report.meta.filters, { color: '#6b7280', marginBottom: '18px' }), node('h2', pages[index].title, { fontSize: '20px', margin: '0 0 12px' }), pages[index].body()); const canvas = await html2canvas(container, { scale: 1.5, backgroundColor: '#fff', windowWidth: 1500 }); const ratio = Math.min(277 / canvas.width, 180 / canvas.height); if (index) pdf.addPage(); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, canvas.width * ratio, canvas.height * ratio); pdf.setFontSize(9); pdf.setTextColor(75,85,99); pdf.text(`${index + 1} / ${pageCount}`, 148, 202, { align: 'center' }); canvas.width = canvas.height = 0 }
  container.remove(); return pdf.output('blob')
}
