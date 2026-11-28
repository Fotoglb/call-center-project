import ExcelJS from 'exceljs'

export async function exportCustomers(rows) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('العملاء', { views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }] })
  const columns = [
    ['name', 'اسم العميل'], ['phone', 'رقم الجوال'],
    ['email', 'البريد الإلكتروني'], ['source', 'المصدر'],
    ['type', 'النوع'], ['city', 'المدينة'],
    ['agent', 'الموظف المسؤول'], ['date', 'التاريخ'],
  ]
  sheet.columns = columns.map(([key, header]) => ({ key, header, width: key === 'email' ? 36 : 24 }))
  for (const row of rows) {
    sheet.addRow(Object.fromEntries(columns.map(([key]) => {
      const value = row[key]
      return [key, value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : value]
    })))
  }
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: rows.length + 1, column: columns.length } }
  return new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
