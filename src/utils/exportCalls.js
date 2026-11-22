const headers = ['اسم العميل', 'رقم الهاتف', 'الموظف المسؤول', 'نوع المشروع', 'موعد الاتصال القادم', 'آخر تواصل', 'مدة المكالمة', 'الحالة', 'ملاحظات']

export async function exportCallsExcel(rows) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('سجل المكالمات', { views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }] })
  sheet.columns = headers.map(header => ({ header, width: header === 'ملاحظات' ? 50 : 24 }))
  rows.forEach(row => sheet.addRow(row))
  sheet.getRow(1).font = { bold: true }
  sheet.eachRow(row => { row.alignment = { vertical: 'top', horizontal: 'right', wrapText: true } })
  return new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function exportCallsPdf(rows) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')])
  await document.fonts.ready
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const container = document.createElement('div')
  container.dir = 'rtl'
  container.style.cssText = 'position:absolute;left:-20000px;top:0;width:1400px;background:white;color:#111;padding:20px;font:16px Tajawal,sans-serif;'
  document.body.appendChild(container)
  try {
    // Render bounded groups so all returned records export without a giant canvas.
    for (let offset = 0; offset < rows.length; offset += 12) {
      container.replaceChildren()
      const table = document.createElement('table')
      table.style.cssText = 'width:100%;border-collapse:collapse;table-layout:fixed;'
      const addRow = (values, heading = false) => {
        const tr = document.createElement('tr')
        values.forEach((value, index) => {
          const cell = document.createElement(heading ? 'th' : 'td')
          cell.textContent = String(value ?? '')
          cell.style.cssText = `border:1px solid #ddd;padding:10px 6px;vertical-align:top;overflow-wrap:anywhere;background:${heading ? '#eef2ff' : '#fff'};`
          if (!heading && (index === 1 || index === 6)) cell.dir = 'ltr'
          tr.appendChild(cell)
        })
        table.appendChild(tr)
      }
      addRow(headers, true)
      rows.slice(offset, offset + 12).forEach(row => addRow(row))
      container.appendChild(table)
      const canvas = await html2canvas(container, { scale: 1.5, backgroundColor: '#ffffff', windowWidth: 1440 })
      const ratio = Math.min(277 / canvas.width, 190 / canvas.height)
      if (offset) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, canvas.width * ratio, canvas.height * ratio)
      canvas.width = canvas.height = 0
    }
    return pdf.output('blob')
  } finally {
    container.remove()
  }
}
