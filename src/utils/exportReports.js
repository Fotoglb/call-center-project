import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { Chart, registerables } from 'chart.js'
import { autoTable } from 'jspdf-autotable'

Chart.register(...registerables)
const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const COLORS = ['#2563eb', '#9333ea', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#6366f1']
const text = v => (v == null ? '' : String(v))
const display = v => (v == null || v === '' ? '—' : String(v))
const number = v =>
  v == null || v === '' || typeof v === 'boolean' || !Number.isFinite(Number(v)) ? null : Number(v)
const percent = v => (number(v) == null ? null : number(v) / 100)
const list = v => (Array.isArray(v) ? v : [])
const hex = (v, fallback = '#64748b') =>
  typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback
const xml = v =>
  text(v)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
const date = v => {
  const s = text(v),
    m = /^(\d{4})-(\d{2})-(\d{2})(?:$|T| )/.exec(s)
  if (!m) return s || null
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`)
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s.slice(0, 10) ? d : s
}
const h = (label, key, kind = 'text') => ({ label, key, kind })
const EMP = [
  h('الموظف', 'name'),
  h('عدد المكالمات', 'calls', 'num'),
  h('عملاء جدد', 'newCustomers', 'num'),
  h('التحويلات', 'conversions', 'num'),
  h('معدل التحويل', 'conversionRate', 'pct'),
  h('مهتم', 'interested', 'num'),
  h('لا يرد', 'noAnswer', 'num'),
  h('متوسط مدة المكالمة (ثانية)', 'avgDurationSec', 'decimal'),
  h('الزيارات', 'visits', 'num'),
  h('نجاح الزيارات', 'visitSuccessRate', 'pct'),
  h('نقاط الأداء', 'score', 'decimal'),
  h('الأداء', 'performance')
]
const formats = { num: '#,##0', decimal: '#,##0.0#', pct: '0.0%', date: 'yyyy-mm-dd' }
const convert = (v, k) =>
  k === 'pct'
    ? percent(v)
    : k === 'date'
      ? date(v)
      : ['num', 'decimal'].includes(k)
        ? number(v)
        : text(v) || null
const pctLabel = v => (number(v) == null ? '—' : `${number(v)}%`)
const metricLabel = c =>
  c.value == null || c.value === ''
    ? '—'
    : `${c.value}${c.unit === '%' ? '%' : c.unit ? ' ' + c.unit : ''}`
function normalize(report) {
  const r = report || {}
  return {
    ...r,
    meta: r.meta || {},
    cards: list(r.cards),
    trend: list(r.trend),
    sources: list(r.sources),
    employees: list(r.employees),
    visitTrend: list(r.visitTrend),
    employeeTable: list(r.employeeTable)
  }
}
const circular = s => ['pie', 'doughnut'].includes(s.type)
// Pass the original dashboard configurations through report.exportCharts to preserve its design.
// Existing defaults are retained for backwards compatibility; no new metric calculation is introduced.
function chartSpecs(r) {
  const rate = r.trend.length > 0 && r.trend.every(x => number(x.conversionRate) != null)
  const success =
    r.visitTrend.length > 0 && r.visitTrend.every(x => number(x.visitSuccessRate) != null)
  const series = (label, data, color) => ({
    label,
    data,
    backgroundColor: color,
    borderColor: color
  })
  const defaults = {
    conversion: {
      type: 'line',
      title: rate ? 'معدل التحويل — الاتجاه الزمني' : 'الاتجاه الزمني — التحويلات والعملاء الجدد',
      labels: r.trend.map(x => text(x.date)),
      datasets: rate
        ? [
            series(
              'معدل التحويل (%)',
              r.trend.map(x => number(x.conversionRate)),
              COLORS[0]
            )
          ]
        : [
            series(
              'التحويلات',
              r.trend.map(x => number(x.converted)),
              COLORS[0]
            ),
            series(
              'عملاء جدد',
              r.trend.map(x => number(x.leads)),
              COLORS[2]
            )
          ]
    },
    sources: {
      type: 'doughnut',
      title: 'توزيع مصادر العملاء',
      labels: r.sources.map(x => text(x.name)),
      datasets: [
        series(
          'عدد العملاء',
          r.sources.map(x => number(x.count)),
          r.sources.map((x, i) => hex(x.color, COLORS[i % COLORS.length]))
        )
      ]
    },
    employees: {
      type: 'doughnut',
      title: 'أداء الموظفين — عدد المكالمات',
      labels: r.employees.map(x => text(x.name)),
      datasets: [
        series(
          'المكالمات',
          r.employees.map(x => number(x.calls)),
          r.employees.map((x, i) => hex(x.color, COLORS[i % COLORS.length]))
        )
      ]
    },
    visits: {
      type: 'bar',
      title: success ? 'معدل نجاح الزيارات' : 'عدد الزيارات',
      labels: r.visitTrend.map(x => text(x.date)),
      datasets: [
        series(
          success ? 'نجاح الزيارات (%)' : 'الزيارات',
          r.visitTrend.map(x => number(success ? x.visitSuccessRate : x.visits)),
          '#14b8a6'
        )
      ]
    }
  }
  return Object.fromEntries(
    Object.entries(defaults).map(([key, base]) => {
      const s = r.exportCharts?.[key] || base
      if (
        !['line', 'bar', 'pie', 'doughnut'].includes(s.type) ||
        !Array.isArray(s.labels) ||
        !Array.isArray(s.datasets) ||
        !s.datasets.length ||
        s.datasets.some(d => !Array.isArray(d.data) || d.data.length !== s.labels.length) ||
        (circular(s) && s.datasets.length !== 1)
      )
        throw new Error(`Invalid export chart: ${key}`)
      const labels = s.labels.map(text)
      const candidates = {
        conversion: [
          [r.trend, 'date', 'leads', 'عملاء جدد', 'count', 2],
          [r.trend, 'date', 'converted', 'التحويلات', 'count', 3],
          [r.trend, 'date', 'conversionRate', 'معدل التحويل (%)', '%', 6]
        ],
        sources: [
          [r.sources, 'name', 'percent', 'النسبة (%)', '%', 2],
          [r.sources, 'name', 'count', 'عدد العملاء', 'count', 3]
        ],
        employees: [[r.employees, 'name', 'calls', 'المكالمات', 'count', 2]],
        visits: [
          [r.visitTrend, 'date', 'visits', 'عدد الزيارات', 'count', 2],
          [r.visitTrend, 'date', 'visitSuccessRate', 'معدل نجاح الزيارات (%)', '%', 3]
        ]
      }[key]
      const datasets = s.datasets.map((d, i) => {
        const data = d.data.map(number)
        const matches = candidates.filter(
          ([rows, cat, field]) =>
            data.some(v => v !== null) &&
            labels.every(
              (label, j) =>
                rows[j] && text(rows[j][cat]) === label && number(rows[j][field]) === data[j]
            )
        )
        const selected =
          matches.find(x => x[2] === d.metricKey) ||
          matches.find(x => x[3] === d.label) ||
          (matches.length === 1 ? matches[0] : null)
        const metric =
          selected || (!r.exportCharts?.[key] ? candidates.find(x => x[3] === d.label) : null)
        const unit = metric ? metric[4] : d.unit
        const label = metric ? metric[3] : text(d.label)
        return { ...d, label, unit, data, sourceColumn: metric?.[5] }
      })
      let title = s.title || base.title
      if (
        key === 'conversion' &&
        datasets.some(d => d.sourceColumn === 2 || d.sourceColumn === 3) &&
        !datasets.some(pctSeries)
      )
        title = 'الاتجاه الزمني — التحويلات والعملاء الجدد'
      if (key === 'visits' && datasets[0].sourceColumn === 2) title = 'عدد الزيارات'
      if (key === 'visits' && datasets[0].sourceColumn === 3) title = 'معدل نجاح الزيارات'
      if (key === 'employees' && datasets[0].sourceColumn === 2) title = s.title || 'أداء الموظفين'
      return [key, { ...s, title, labels, datasets }]
    })
  )
}
function addSheet(w, name, headers, rows) {
  const s = w.addWorksheet(name, {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
    properties: { defaultRowHeight: 19 }
  })
  s.columns = headers.map(x => ({
    header: x.label,
    key: x.key,
    width: Math.min(40, Math.max(15, x.label.length + 5)),
    style: { numFmt: formats[x.kind] || 'General' }
  }))
  for (const raw of rows)
    s.addRow(Object.fromEntries(headers.map(x => [x.key, convert(raw[x.key], x.kind)])))
  s.getRow(1).height = 34
  s.getRow(1).eachCell(c => styleHead(c))
  for (let i = 2; i <= s.rowCount; i++) {
    const row = s.getRow(i)
    let lines = 1
    row.eachCell({ includeEmpty: true }, (c, j) => {
      const col = s.getColumn(j),
        len = c.value instanceof Date ? 10 : text(c.value).length
      col.width = Math.min(52, Math.max(col.width, len + 3))
      lines = Math.max(lines, Math.ceil(len / 48))
      c.alignment = { vertical: 'middle', horizontal: 'right', readingOrder: 'rtl', wrapText: true }
      if (i % 2 === 0) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F7FA' } }
    })
    row.height = Math.max(21, lines * 17)
  }
  s.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, s.rowCount), column: headers.length }
  }
  return s
}
function styleHead(c) {
  c.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
  c.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true, readingOrder: 'rtl' }
}
const NS = 'http://schemas.openxmlformats.org/'
const C = `${NS}drawingml/2006/chart`,
  A = `${NS}drawingml/2006/main`,
  R = `${NS}officeDocument/2006/relationships`,
  P = `${NS}package/2006/relationships`,
  XDR = `${NS}drawingml/2006/spreadsheetDrawing`
const decl = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
const colName = n => {
  let s = ''
  while (n) {
    n--
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26)
  }
  return s
}
// Excel supports solid RGB fills. Convert common CSS colors without changing the dashboard's colors.
function rgb(v, fallback) {
  if (typeof v !== 'string') return fallback
  if (/^#[0-9a-f]{3}$/i.test(v))
    return (
      '#' +
      v
        .slice(1)
        .split('')
        .map(x => x + x)
        .join('')
    )
  if (/^#[0-9a-f]{6}$/i.test(v)) return v
  const m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(v)
  return m
    ? '#' +
        m
          .slice(1, 4)
          .map(x => Math.min(255, +x).toString(16).padStart(2, '0'))
          .join('')
    : fallback
}
const solid = c =>
  `<a:solidFill><a:srgbClr val="${rgb(c, '#64748b').slice(1).toUpperCase()}"/></a:solidFill>`
const colorAt = (d, i) =>
  rgb(
    Array.isArray(d.backgroundColor) ? d.backgroundColor[i] : d.backgroundColor || d.borderColor,
    COLORS[i % COLORS.length]
  )
const pctSeries = d =>
  d.unit != null ? d.unit === '%' : text(d.label).includes('%') || text(d.label).includes('٪')
function chartXml(spec, sheet, start) {
  const n = spec.labels.length,
    sh = `'${sheet.replace(/'/g, "''")}'!`,
    ref = (col, first = 2, last = n + 1) =>
      xml(`${sh}$${colName(col)}$${first}:$${colName(col)}$${last}`),
    isCircular = circular(spec),
    opts = spec.options || {},
    isPct = spec.datasets.every(pctSeries)
  const title = `<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="ar"/><a:t>${xml(spec.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>`
  const cats = `<c:cat><c:strRef><c:f>${ref(start)}</c:f><c:strCache><c:ptCount val="${n}"/>${spec.labels.map((x, i) => `<c:pt idx="${i}"><c:v>${xml(x)}</c:v></c:pt>`).join('')}</c:strCache></c:strRef></c:cat>`
  const series = spec.datasets
    .map((d, i) => {
      const col = start + i + 1,
        color = rgb(
          spec.type === 'line'
            ? d.borderColor || d.backgroundColor
            : d.backgroundColor || d.borderColor,
          COLORS[i % COLORS.length]
        )
      const marker = d.pointRadius === 0 ? 'none' : 'circle'
      return `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:strRef><c:f>${xml(`${sh}$${colName(col)}$1`)}</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${xml(d.label)}</c:v></c:pt></c:strCache></c:strRef></c:tx><c:spPr>${spec.type === 'line' ? `<a:ln w="${Math.max(0, Math.round((typeof d.borderWidth === 'number' ? d.borderWidth : 2) * 9525))}">${solid(color)}</a:ln>` : solid(color)}</c:spPr>${spec.type === 'line' ? `<c:marker><c:symbol val="${marker}"/><c:size val="${Math.max(2, Math.min(72, Math.round((typeof d.pointRadius === 'number' ? d.pointRadius : 2) * 2)))}"/></c:marker>` : ''}${isCircular || (spec.type === 'bar' && Array.isArray(d.backgroundColor)) ? d.data.map((_, j) => `<c:dPt><c:idx val="${j}"/><c:spPr>${solid(colorAt(d, j))}</c:spPr></c:dPt>`).join('') : ''}${cats}<c:val><c:numRef><c:f>${ref(col)}</c:f><c:numCache><c:formatCode>${isPct ? '0.0&quot;%&quot;' : 'General'}</c:formatCode><c:ptCount val="${n}"/>${d.data.map((v, j) => (v == null ? '' : `<c:pt idx="${j}"><c:v>${v}</c:v></c:pt>`)).join('')}</c:numCache></c:numRef></c:val>${spec.type === 'line' ? `<c:smooth val="${d.tension > 0 ? 1 : 0}"/>` : ''}</c:ser>`
    })
    .join('')
  const ids = '<c:axId val="100"/><c:axId val="200"/>'
  const cutout =
    typeof opts.cutout === 'string' && /^\d+(\.\d+)?%$/.test(opts.cutout)
      ? Math.max(10, Math.min(90, Math.round(parseFloat(opts.cutout))))
      : 65
  const horizontal = spec.type === 'bar' && opts.indexAxis === 'y'
  const kind =
    spec.type === 'line'
      ? `<c:lineChart><c:grouping val="standard"/>${series}${ids}</c:lineChart>`
      : spec.type === 'bar'
        ? `<c:barChart><c:barDir val="${horizontal ? 'bar' : 'col'}"/><c:grouping val="clustered"/>${series}<c:gapWidth val="80"/>${ids}</c:barChart>`
        : `<c:${spec.type === 'pie' ? 'pieChart' : 'doughnutChart'}><c:varyColors val="1"/>${series}<c:firstSliceAng val="0"/>${spec.type === 'doughnut' ? `<c:holeSize val="${cutout}"/>` : ''}</c:${spec.type === 'pie' ? 'pieChart' : 'doughnutChart'}>`
  const axis = opts.scales?.[horizontal ? 'x' : 'y'] || {},
    axisLimits =
      (Number.isFinite(axis.max) ? `<c:max val="${axis.max}"/>` : '') +
      (Number.isFinite(axis.min)
        ? `<c:min val="${axis.min}"/>`
        : axis.beginAtZero
          ? '<c:min val="0"/>'
          : '')
  const axes = isCircular
    ? ''
    : `<c:catAx><c:axId val="100"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${horizontal ? 'l' : 'b'}"/><c:tickLblPos val="nextTo"/><c:crossAx val="200"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:tickLblSkip val="${Math.max(1, Math.ceil(n / 16))}"/></c:catAx><c:valAx><c:axId val="200"/><c:scaling><c:orientation val="minMax"/>${axisLimits}</c:scaling><c:delete val="0"/><c:axPos val="${horizontal ? 'b' : 'l'}"/><c:majorGridlines/><c:numFmt formatCode="${isPct ? '0.0&quot;%&quot;' : 'General'}" sourceLinked="0"/><c:tickLblPos val="nextTo"/><c:crossAx val="100"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx>`
  const lp =
      { top: 't', bottom: 'b', left: 'l', right: 'r' }[opts.plugins?.legend?.position] ||
      (isCircular ? 'r' : 'b'),
    legend =
      opts.plugins?.legend?.display === false
        ? ''
        : `<c:legend><c:legendPos val="${lp}"/><c:overlay val="0"/></c:legend>`
  return `${decl}<c:chartSpace xmlns:c="${C}" xmlns:a="${A}" xmlns:r="${R}"><c:lang val="ar"/><c:chart>${title}<c:plotArea><c:layout/>${kind}${axes}</c:plotArea>${legend}<c:plotVisOnly val="0"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`
}
const rel = (id, type, target) =>
  `<Relationship Id="${id}" Type="${R}/${type}" Target="${target}"/>`
const rels = body => `${decl}<Relationships xmlns="${P}">${body}</Relationships>`
async function injectCharts(buffer, items) {
  const zip = await JSZip.loadAsync(buffer)
  let types = await zip.file('[Content_Types].xml').async('string')
  for (const [i, item] of items.entries()) {
    const k = i + 1,
      sheetPath = `xl/worksheets/sheet${item.sheet.id}.xml`,
      rp = `xl/worksheets/_rels/sheet${item.sheet.id}.xml.rels`
    let sx = await zip.file(sheetPath).async('string')
    if (/<(?:\w+:)?drawing\b/.test(sx)) throw new Error('Unexpected existing drawing')
    const old = zip.file(rp),
      oldR = old ? await old.async('string') : rels('')
    let id = 'rIdExportChart'
    while (oldR.includes(`Id="${id}"`)) id += 'X'
    const drawing = `<drawing xmlns:r="${R}" r:id="${id}"/>`
    sx = /<(?:legacyDrawing|picture|oleObjects|controls|webPublishItems|tableParts|extLst)\b/.test(
      sx
    )
      ? sx.replace(
          /<(?:legacyDrawing|picture|oleObjects|controls|webPublishItems|tableParts|extLst)\b/,
          m => drawing + m
        )
      : sx.replace('</worksheet>', drawing + '</worksheet>')
    zip.file(sheetPath, sx)
    zip.file(
      rp,
      oldR.replace(
        '</Relationships>',
        `${rel(id, 'drawing', `../drawings/drawing${k}.xml`)}</Relationships>`
      )
    )
    const marker = (tag, col, row) =>
      `<xdr:${tag}><xdr:col>${col}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:${tag}>`
    // Place each native chart below all data, leaving two empty rows.
    // OOXML anchor coordinates are zero-based; hidden helper columns are avoided.
    const top = item.sheet.rowCount + 2,
      bottom = top + 21
    const left = 0,
      right = circular(item.spec) ? item.start - 1 : item.start + item.spec.datasets.length + 5 // Four extra visible columns for Cartesian charts
    zip.file(
      `xl/drawings/drawing${k}.xml`,
      `${decl}<xdr:wsDr xmlns:xdr="${XDR}" xmlns:a="${A}"><xdr:twoCellAnchor>${marker('from', left, top)}${marker('to', right, bottom)}<xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="1" name="Chart ${k}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="${C}"><c:chart xmlns:c="${C}" xmlns:r="${R}" r:id="rId1"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>`
    )
    zip.file(
      `xl/drawings/_rels/drawing${k}.xml.rels`,
      rels(rel('rId1', 'chart', `../charts/chart${k}.xml`))
    )
    zip.file(`xl/charts/chart${k}.xml`, chartXml(item.spec, item.sheet.name, item.start))
    types = types.replace(
      '</Types>',
      `<Override PartName="/xl/drawings/drawing${k}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/><Override PartName="/xl/charts/chart${k}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/></Types>`
    )
  }
  zip.file('[Content_Types].xml', types)
  if (Object.keys(zip.files).some(name => name.startsWith('xl/media/') && !zip.files[name].dir))
    throw new Error('Excel export must not contain images')
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
}
// Show the native chart slice color beside each matching source-table row.
// Match by category name, not row index: dashboard charts may be sorted or filtered.
function addCircularColorColumn(sheet, headers, rows, spec) {
  if (!circular(spec)) return
  const col = headers.length + 1,
    positions = new Map()
  spec.labels.forEach((label, i) => {
    const indices = positions.get(label) || []
    indices.push(i)
    positions.set(label, indices)
  })
  const tableCounts = new Map()
  rows.forEach(row => {
    const label = text(row[headers[0].key])
    tableCounts.set(label, (tableCounts.get(label) || 0) + 1)
  })
  sheet.getColumn(col).width = 12
  const head = sheet.getCell(1, col)
  head.value = 'اللون'
  styleHead(head)
  rows.forEach((row, i) => {
    const label = text(row[headers[0].key]),
      indices = positions.get(label)
    // Do not assign a misleading color to unmatched or ambiguous categories.
    if (!indices || indices.length !== 1 || tableCounts.get(label) !== 1) return
    const cell = sheet.getCell(i + 2, col)
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + colorAt(spec.datasets[0], indices[0]).slice(1).toUpperCase() }
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, rows.length + 1), column: col }
  }
}
export async function exportReportsExcel(report) {
  const r = normalize(report),
    specs = chartSpecs(r),
    w = new ExcelJS.Workbook()
  w.creator = 'نظام مركز الاتصالات'
  w.created = new Date()
  w.calcProperties.fullCalcOnLoad = true
  const summary = addSheet(
    w,
    'ملخص الإحصائيات',
    [h('المؤشر', 'label'), h('القيمة', 'value')],
    r.cards
      .map(c => ({ label: c.label, value: null }))
      .concat([{ label: 'الفترة الزمنية' }, { label: 'الفلاتر المطبقة' }])
  )
  r.cards.forEach((c, i) => {
    const cell = summary.getCell(i + 2, 2),
      unit = text(c.unit).trim(),
      value = number(c.value)
    if (c.value == null || c.value === '') {
      cell.value = null
      return
    }
    if (value == null) {
      const raw = text(c.value)
      cell.value =
        unit && !raw.trimEnd().endsWith(unit) ? `${raw}${unit === '%' ? '' : ' '}${unit}` : raw
      cell.numFmt = 'General'
      return
    }
    if (unit === '%') {
      cell.value = value / 100
      cell.numFmt = Number.isInteger(value) ? '0%' : '0.##########%'
      return
    }
    if (/["\\\r\n]/.test(unit)) {
      cell.value = metricLabel(c)
      cell.numFmt = 'General'
      return
    }
    cell.value = value
    const base = Number.isInteger(value) ? '#,##0' : '#,##0.##########'
    cell.numFmt = unit ? `${base}" ${unit}"` : base
  })
  summary.getCell(r.cards.length + 2, 2).value = `${text(r.meta.from)} إلى ${text(r.meta.to)}`
  summary.getCell(r.cards.length + 3, 2).value = text(r.meta.filters)
  summary.getColumn(2).width = 52
  const definitions = [
    [
      'conversion',
      'الاتجاه الزمني',
      [
        h('التاريخ', 'date', 'date'),
        h('عملاء جدد', 'leads', 'num'),
        h('التحويلات', 'converted', 'num'),
        h('المكالمات', 'calls', 'num'),
        h('الزيارات', 'visits', 'num'),
        h('معدل التحويل', 'conversionRate', 'pct')
      ],
      r.trend
    ],
    [
      'sources',
      'مصادر العملاء',
      [h('المصدر', 'name'), h('النسبة', 'percent', 'pct'), h('العدد', 'count', 'num')],
      r.sources
    ],
    [
      'employees',
      'أداء الموظفين',
      [
        h('الموظف', 'name'),
        h('المكالمات', 'calls', 'num'),
        h('عملاء جدد', 'newCustomers', 'num'),
        h('التحويلات', 'conversions', 'num')
      ],
      r.employees
    ],
    [
      'visits',
      specs.visits.title === 'عدد الزيارات' ? 'عدد الزيارات' : 'نجاح الزيارات',
      [
        h('التاريخ', 'date', 'date'),
        h('الزيارات', 'visits', 'num'),
        h('معدل نجاح الزيارات', 'visitSuccessRate', 'pct')
      ],
      r.visitTrend
    ]
  ]
  const items = []
  for (const [key, name, headers, rows] of definitions) {
    const s = addSheet(w, name, headers, rows),
      spec = specs[key]
    if (!spec.labels.length) continue
    const start = headers.length + 2 + (key === 'sources' ? 1 : 0)
    if (key === 'sources') s.getColumn(start - 2).width = 15
    addCircularColorColumn(s, headers, rows, spec)
    s.getCell(1, start).value = 'تصنيفات الرسم'
    s.getColumn(start).width = 24
    spec.datasets.forEach((d, i) => {
      s.getCell(1, start + i + 1).value = d.label
      s.getColumn(start + i + 1).width = 21
    })
    spec.labels.forEach((label, i) => {
      const row = i + 2,
        source = s.getCell(row, 1).value
      const labelCell = s.getCell(row, start)
      labelCell.value =
        source != null &&
        (source instanceof Date
          ? source.toISOString().slice(0, 10) === label
          : text(source) === label)
          ? {
              formula: source instanceof Date ? `TEXT(A${row},"yyyy-mm-dd")` : `A${row}`,
              result: label
            }
          : label
      spec.datasets.forEach((d, j) => {
        const v = d.data[i],
          c = s.getCell(row, start + j + 1),
          col = d.sourceColumn
        c.value =
          col && v != null
            ? {
                formula: `IF(ISNUMBER(${colName(col)}${row}),${colName(col)}${row}${pctSeries(d) ? '*100' : ''},NA())`,
                result: v
              }
            : v
        c.numFmt = pctSeries(d) ? '0.0"%"' : '#,##0.##'
      })
    })
    for (let j = start; j <= start + spec.datasets.length; j++) {
      styleHead(s.getCell(1, j))
      s.getColumn(j).hidden = true
    }
    items.push({ sheet: s, spec, start })
  }
  addSheet(w, 'تقرير الأداء الوظيفي', EMP, r.employeeTable)
  return new Blob([await injectCharts(await w.xlsx.writeBuffer(), items)], { type: MIME })
}
const fontFamily = 'Tajawal, Arial, sans-serif'
const reportTitle = 'تقرير التقارير والتحليلات'
const metaLine = r =>
  `تاريخ التصدير: ${text(r.meta.exportedAt)} | الفترة: ${text(r.meta.from)} إلى ${text(r.meta.to)}`
function sliceSpec(s, from, to) {
  return {
    ...s,
    labels: s.labels.slice(from, to),
    datasets: s.datasets.map(d => ({
      ...d,
      data: d.data.slice(from, to),
      backgroundColor: Array.isArray(d.backgroundColor)
        ? d.backgroundColor.slice(from, to)
        : d.backgroundColor,
      borderColor: Array.isArray(d.borderColor) ? d.borderColor.slice(from, to) : d.borderColor
    }))
  }
}
function sections(r, specs) {
  const out = []
  if (r.cards.length) out.push({ type: 'summary', title: 'ملخص الإحصائيات' })
  for (const s of Object.values(specs)) {
    if (!s.labels.length) {
      out.push({ type: 'empty', title: s.title })
      continue
    }
    const limit = circular(s) ? s.labels.length : 31
    for (let i = 0; i < s.labels.length; i += limit)
      out.push({
        type: 'chart',
        title:
          s.title +
          (s.labels.length > limit
            ? ` (${Math.floor(i / limit) + 1}/${Math.ceil(s.labels.length / limit)})`
            : ''),
        spec: circular(s) ? s : sliceSpec(s, i, i + limit)
      })
  }
  out.push({ type: 'table', title: 'تقرير الأداء الوظيفي' })
  return out
}
// Clone plain configuration objects without discarding Chart.js callbacks.
function cloneConfig(v) {
  if (Array.isArray(v)) return v.map(cloneConfig)
  if (v && Object.getPrototypeOf(v) === Object.prototype)
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, cloneConfig(x)]))
  return v
}
async function renderChart(s) {
  const canvas = document.createElement('canvas'),
    opts = cloneConfig(s.options || {}),
    isCircular = circular(s)
  canvas.width = isCircular ? 1000 : 1750
  canvas.height = isCircular ? 760 : 390
  let chart
  try {
    const defaults = {
      layout: { padding: 12 },
      plugins: {
        legend: {
          display: !isCircular && s.datasets.length > 1,
          position: 'bottom',
          rtl: true,
          labels: { font: { family: fontFamily, size: 20 } }
        },
        title: { display: false }
      },
      ...(isCircular
        ? { ...(s.type === 'doughnut' ? { cutout: '65%' } : {}) }
        : {
            scales: {
              x: {
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 16,
                  font: { family: fontFamily, size: 18 }
                },
                grid: { display: false }
              },
              y: {
                beginAtZero: true,
                ticks: { font: { family: fontFamily, size: 18 } },
                grid: { color: '#e2e8f0' }
              }
            }
          })
    }
    // Only export-specific settings are forced. The supplied UI configuration takes precedence.
    const options = {
      ...defaults,
      ...opts,
      plugins: {
        ...defaults.plugins,
        ...opts.plugins,
        tooltip: { ...opts.plugins?.tooltip, enabled: false }
      },
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      devicePixelRatio: 2,
      events: []
    }
    // Export-only axes: keep the UI styling, but fit the printed data and labels.
    if (!isCircular) {
      const horizontal = opts.indexAxis === 'y',
        category = horizontal ? 'y' : 'x',
        value = horizontal ? 'x' : 'y'
      const categoryOptions = opts.scales?.[category] || {},
        valueOptions = opts.scales?.[value] || {}
      options.scales = {
        ...opts.scales,
        [category]: {
          ...defaults.scales.x,
          ...categoryOptions,
          ticks: {
            ...defaults.scales.x.ticks,
            ...categoryOptions.ticks,
            autoSkip: true,
            maxTicksLimit: 10,
            minRotation: 0,
            maxRotation: 30,
            font: { ...categoryOptions.ticks?.font, family: fontFamily, size: 28 }
          }
        },
        [value]: {
          ...defaults.scales.y,
          ...valueOptions,
          ticks: {
            ...defaults.scales.y.ticks,
            ...valueOptions.ticks,
            font: { ...valueOptions.ticks?.font, family: fontFamily, size: 27 }
          }
        }
      }
      const axis = options.scales[value],
        values = s.datasets.flatMap(d => d.data).filter(Number.isFinite)
      if (!axis.type || axis.type === 'linear') {
        delete axis.min
        delete axis.max
        delete axis.suggestedMin
        delete axis.suggestedMax
        delete axis.ticks.stepSize
        delete axis.ticks.count
        axis.beginAtZero = true
        if (values.length && values.every(v => v >= 0)) axis.min = 0
        if (s.datasets.every(pctSeries)) {
          axis.min = 0
          axis.max = 100
        } else if (values.length && values.every(Number.isInteger)) axis.ticks.precision = 0
        axis.ticks.maxTicksLimit = 6
      }
    }
    const datasets = s.datasets.map((d, i) => ({
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length],
      borderWidth: isCircular ? 2 : 2.5,
      pointRadius: 3,
      ...cloneConfig(d)
    }))
    chart = new Chart(canvas, {
      type: s.type,
      data: { labels: s.labels.slice(), datasets },
      options,
      plugins: s.plugins || []
    })
    chart.update('none')
    return { url: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }
  } finally {
    chart?.destroy()
    canvas.width = 0
    canvas.height = 0
  }
}
// Export only the actual chart categories and series; never derive extra shares.
function chartTable(spec) {
  return {
    headers: [
      spec.categoryLabel || (circular(spec) ? 'التصنيف' : 'التاريخ / التصنيف'),
      ...spec.datasets.map(d => d.label)
    ],
    rows: spec.labels.map((label, i) => [
      label,
      ...spec.datasets.map(d =>
        d.data[i] == null ? '—' : `${d.data[i]}${pctSeries(d) ? '%' : ''}`
      )
    ])
  }
}
const tableData = r =>
  r.employeeTable.map(row =>
    EMP.map(c => (c.kind === 'pct' ? pctLabel(row[c.key]) : display(row[c.key])))
  )
async function loadPdfFont(pdf, r) {
  if (!r.pdfFontUrl) return false
  try {
    const res = await fetch(r.pdfFontUrl)
    if (!res.ok) throw new Error(`Font HTTP ${res.status}`)
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (bytes.length < 12 || bytes[0] !== 0 || bytes[1] !== 1 || bytes[2] !== 0 || bytes[3] !== 0)
      throw new Error('Expected TrueType font')
    let binary = ''
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
    pdf.addFileToVFS('ReportArabic.ttf', btoa(binary))
    pdf.addFont('ReportArabic.ttf', 'ReportArabic', 'normal')
    pdf.setFont('ReportArabic', 'normal')
    return true
  } catch (e) {
    console.warn('Arabic PDF font unavailable; using HTML fallback.', e)
    return false
  }
}
function addImageFit(pdf, img, x, y, w, h) {
  const ratio = Math.min(w / img.width, h / img.height),
    iw = img.width * ratio,
    ih = img.height * ratio
  pdf.addImage(img.url, 'PNG', x + (w - iw) / 2, y + (h - ih) / 2, iw, ih, undefined, 'FAST')
}
function nativeText(pdf, value, x, y, size = 10, color = [30, 41, 59], align = 'right') {
  pdf.setFont('ReportArabic', 'normal')
  pdf.setFontSize(size)
  pdf.setTextColor(...color)
  pdf.text(text(value), x, y, { align })
}
function nativeMeta(pdf, r) {
  nativeText(pdf, 'تاريخ التصدير:', 285, 19, 9, [71, 85, 105])
  nativeText(pdf, 'الفترة:', 142, 19, 9, [71, 85, 105])
  const ltr = (v, x) => {
    pdf.setFont('ReportArabic', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(71, 85, 105)
    pdf.text(text(v), x, 19, {
      align: 'right',
      isInputRtl: false,
      isOutputRtl: false,
      isInputVisual: true,
      isOutputVisual: true
    })
  }
  ltr(
    text(r.meta.exportedAt)
      .replace(/[\u200e\u200f\u061c]/g, '')
      .replace(/م/g, 'PM')
      .replace(/ص/g, 'AM'),
    260
  )
  ltr(`${text(r.meta.from)} - ${text(r.meta.to)}`, 128)
}
async function nativePdf(pdf, r, parts) {
  const bottom = 190
  let y = 0,
    first = true
  function header() {
    if (!first) pdf.addPage()
    first = false
    nativeText(pdf, reportTitle, 285, 12, 16)
    nativeMeta(pdf, r)
    pdf.setFontSize(9)
    let top = 24
    for (const line of pdf.splitTextToSize(text(r.meta.filters), 273)) {
      nativeText(pdf, line, 285, top, 9, [71, 85, 105])
      top += 4
    }
    pdf.setDrawColor(226, 232, 240)
    pdf.line(12, top, 285, top)
    y = top + 5
  }
  function ensure(height) {
    if (y + height > bottom) header()
  }
  function title(t) {
    nativeText(pdf, t, 285, y + 4, 12)
    y += 8
  }
  function table(headers, rows, part, side = null) {
    if (!rows.length) {
      nativeText(pdf, 'لا توجد بيانات', 148, y + 7, 11, [100, 116, 139], 'center')
      y += 14
      return
    }
    ensure(18)
    const oldPage = pdf.getNumberOfPages()
    const start = y
    // Measure continuation header using the same metadata, reserving space for repeated table headers.
    pdf.setFont('ReportArabic', 'normal')
    pdf.setFontSize(9)
    const top = 24 + 4 * pdf.splitTextToSize(text(r.meta.filters), 273).length + 13
    autoTable(pdf, {
      startY: start,
      head: [headers.slice().reverse()],
      body: rows.map(row => row.slice().reverse()),
      margin: { left: side ? side.left : 12, right: 12, top, bottom: 20 },
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
      theme: 'grid',
      styles: {
        font: 'ReportArabic',
        fontStyle: 'normal',
        fontSize: headers.length === 12 ? 8 : 9,
        cellPadding: 1.65,
        halign: 'right',
        valign: 'middle',
        overflow: 'linebreak',
        lineColor: [226, 232, 240],
        lineWidth: 0.15
      },
      headStyles: {
        font: 'ReportArabic',
        fontStyle: 'normal',
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      willDrawPage: ({ pageNumber }) => {
        if (pageNumber > 1) {
          nativeText(pdf, reportTitle, 285, 12, 16)
          nativeMeta(pdf, r)
          pdf.setFontSize(9)
          let p = 24
          for (const line of pdf.splitTextToSize(text(r.meta.filters), 273)) {
            nativeText(pdf, line, 285, p, 9, [71, 85, 105])
            p += 4
          }
          nativeText(pdf, part.title + ' — تابع', 285, p + 6, 11)
        }
      },
      didDrawCell: ({ section, row, column, cell }) => {
        if (
          part.spec &&
          circular(part.spec) &&
          section === 'body' &&
          column.index === headers.length - 1
        ) {
          pdf.setFillColor(colorAt(part.spec.datasets[0], row.index))
          pdf.circle(cell.x + 2, cell.y + cell.height / 2, 0.9, 'F')
        }
      }
    })
    y = pdf.lastAutoTable.finalY + 6
    return pdf.getNumberOfPages() !== oldPage
  }
  header()
  for (const part of parts) {
    if (part.type === 'summary') {
      ensure(35)
      title(part.title)
      const cols = 3,
        w = 87,
        gap = 6,
        h = 24
      for (let i = 0; i < r.cards.length; i += cols) {
        if (y + h > bottom) {
          header()
          title(part.title + ' — تابع')
        }
        for (let j = 0; j < cols && i + j < r.cards.length; j++) {
          const c = r.cards[i + j],
            x = 285 - w - j * (w + gap)
          pdf.setDrawColor(226, 232, 240)
          pdf.setFillColor(248, 250, 252)
          pdf.roundedRect(x, y, w, h, 2, 2, 'FD')
          nativeText(pdf, c.label, x + w / 2, y + 8, 10, [71, 85, 105], 'center')
          nativeText(pdf, metricLabel(c), x + w / 2, y + 18, 15, [15, 23, 42], 'center')
        }
        y += h + 3
      }
      y += 3
    } else if (part.type === 'chart') {
      const img = await renderChart(part.spec),
        data = chartTable(part.spec),
        isCircular = circular(part.spec)
      const chartH = isCircular ? 78 : 56
      ensure(chartH + 27)
      title(part.title)
      if (isCircular && data.rows.length <= 14) {
        const start = y
        addImageFit(pdf, img, 12, start, 113, chartH)
        table(data.headers, data.rows, part, { left: 132 })
        y = Math.max(y, start + chartH + 6)
      } else {
        addImageFit(pdf, img, 12, y, 273, chartH)
        y += chartH + 3
        table(data.headers, data.rows, part)
      }
    } else if (part.type === 'table') {
      header()
      title(part.title)
      table(
        EMP.map(c => c.label),
        tableData(r),
        part
      )
    } else {
      ensure(20)
      title(part.title)
      nativeText(pdf, 'لا توجد بيانات', 148, y + 6, 11, [100, 116, 139], 'center')
      y += 14
    }
  }
}
function element(tag, value, css = '') {
  const e = document.createElement(tag)
  if (value != null) e.textContent = text(value)
  e.style.cssText = css
  return e
}
function htmlHeader(r) {
  const box = element(
    'header',
    null,
    'margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:8px'
  )
  box.append(
    element('h1', reportTitle, 'font-size:28px;margin:0 0 4px;color:#0f172a'),
    element('div', metaLine(r), 'font-size:17px;color:#475569'),
    element('div', r.meta.filters, 'font-size:17px;color:#475569;overflow-wrap:anywhere')
  )
  return box
}
function htmlTable(headers) {
  const t = element(
    'table',
    null,
    'width:100%;border-collapse:collapse;table-layout:fixed;font-size:17px;line-height:1.25'
  )
  const head = element('thead'),
    tr = element('tr')
  headers.forEach((label, i) =>
    tr.append(
      element(
        'th',
        label,
        `padding:6px 5px;background:#1f2937;color:white;border:1px solid #cbd5e1;overflow-wrap:anywhere;${headers.length === 12 ? (i === 0 ? 'width:12%' : i === 7 ? 'width:11%' : '') : ''}`
      )
    )
  )
  head.append(tr)
  t.append(head, element('tbody'))
  return t
}
function htmlRow(row, i) {
  const tr = element('tr', null, `background:${i % 2 ? '#f8fafc' : '#fff'}`)
  row.forEach(v =>
    tr.append(
      element(
        'td',
        v,
        'padding:5px;border:1px solid #e2e8f0;overflow-wrap:anywhere;text-align:right;vertical-align:middle'
      )
    )
  )
  return tr
}
async function fallbackPdf(pdf, r, parts) {
  // Fixed page dimensions ensure identical text size even when a page contains few rows.
  const width = 1500,
    height = 990
  const host = element(
    'div',
    null,
    `position:absolute;left:-20000px;top:0;width:${width}px;min-height:${height}px;box-sizing:border-box;padding:24px;background:white;color:#1e293b;font-family:${fontFamily};direction:rtl;line-height:1.3`
  )
  document.body.append(host)
  let first = true,
    body
  const reset = () => {
    body = element('main')
    host.replaceChildren(htmlHeader(r), body)
  }
  const overflow = () => host.scrollHeight > height + 1
  const capture = async () => {
    if (!body.children.length) return
    const c = await html2canvas(host, {
      scale: 2,
      backgroundColor: '#fff',
      width,
      height: Math.max(height, host.scrollHeight),
      windowWidth: 1550,
      logging: false
    })
    try {
      if (!first) pdf.addPage()
      first = false
      addImageFit(
        pdf,
        { url: c.toDataURL('image/png'), width: c.width, height: c.height },
        10,
        10,
        277,
        183
      )
    } finally {
      c.width = 0
      c.height = 0
    }
    reset()
  }
  const heading = t => element('h2', t, 'font-size:23px;margin:12px 0 8px;color:#1e293b')
  const section = t => {
    const e = element('section')
    e.append(heading(t))
    return e
  }
  async function appendBlock(block) {
    body.append(block)
    if (overflow() && body.children.length > 1) {
      block.remove()
      await capture()
      body.append(block)
    }
  }
  async function appendRows(part, headers, rows, block, t) {
    for (let i = 0; i < rows.length; i++) {
      const row = htmlRow(rows[i], i)
      if (part.spec && circular(part.spec)) {
        const sw = element(
          'span',
          null,
          `display:inline-block;width:12px;height:12px;margin-left:8px;background:${colorAt(part.spec.datasets[0], i)}`
        )
        row.cells[0].prepend(sw)
      }
      t.tBodies[0].append(row)
      if (overflow()) {
        row.remove()
        if (t.tBodies[0].rows.length || body.children.length > 1 || block.querySelector('img')) {
          if (!t.tBodies[0].rows.length) t.remove()
          if (!block.querySelector('img') && !block.querySelector('table')) block.remove()
          await capture()
          block = section(part.title + ' — تابع')
          t = htmlTable(headers)
          block.append(t)
          body.append(block)
        }
        t.tBodies[0].append(row)
      }
    }
  }
  reset()
  try {
    for (const part of parts) {
      if (part.type === 'summary') {
        for (let i = 0; i < r.cards.length; i += 3) {
          const block = element('section')
          if (i === 0) block.append(heading(part.title))
          const grid = element(
            'div',
            null,
            'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:7px'
          )
          for (const c of r.cards.slice(i, i + 3)) {
            const card = element(
              'div',
              null,
              'border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;padding:13px;text-align:center'
            )
            card.append(
              element('div', c.label, 'font-size:19px;color:#475569'),
              element('strong', metricLabel(c), 'display:block;font-size:29px;margin-top:5px')
            )
            grid.append(card)
          }
          block.append(grid)
          await appendBlock(block)
        }
      } else if (part.type === 'chart') {
        const img = await renderChart(part.spec),
          data = chartTable(part.spec),
          block = section(part.title),
          image = element('img', null, 'display:block;width:100%;height:290px;object-fit:contain')
        image.src = img.url
        await image.decode()
        const t = htmlTable(data.headers)
        if (circular(part.spec) && data.rows.length <= 14) {
          const grid = element(
            'div',
            null,
            'display:grid;grid-template-columns:1.25fr 1fr;gap:18px;align-items:center'
          )
          grid.append(t, image)
          block.append(grid)
          data.rows.forEach((values, i) => {
            const row = htmlRow(values, i)
            row.cells[0].prepend(
              element(
                'span',
                null,
                `display:inline-block;width:12px;height:12px;margin-left:8px;background:${colorAt(part.spec.datasets[0], i)}`
              )
            )
            t.tBodies[0].append(row)
          })
          await appendBlock(block)
          if (overflow()) {
            block.remove()
            block.replaceChildren(heading(part.title), image)
            const table = htmlTable(data.headers)
            block.append(table)
            await appendBlock(block)
            await appendRows(part, data.headers, data.rows, block, table)
          }
        } else {
          block.append(image)
          await appendBlock(block)
          block.append(t)
          await appendRows(part, data.headers, data.rows, block, t)
        }
      } else if (part.type === 'table') {
        if (body.children.length) await capture()
        const block = section(part.title),
          headers = EMP.map(c => c.label),
          rows = tableData(r),
          t = htmlTable(headers)
        block.append(t)
        if (!rows.length) block.append(element('p', 'لا توجد بيانات', 'text-align:center'))
        await appendBlock(block)
        await appendRows(part, headers, rows, block, t)
      } else {
        const block = section(part.title)
        block.append(element('p', 'لا توجد بيانات', 'text-align:center;color:#64748b'))
        await appendBlock(block)
      }
    }
    await capture()
  } finally {
    host.remove()
  }
}
export async function exportReportsPdf(report) {
  const r = normalize(report),
    specs = chartSpecs(r),
    parts = sections(r, specs)
  await document.fonts?.ready
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  if (await loadPdfFont(pdf, r)) await nativePdf(pdf, r, parts)
  else await fallbackPdf(pdf, r, parts)
  const pages = pdf.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(71, 85, 105)
    pdf.text(`${i} / ${pages}`, 148.5, 202, { align: 'center' })
  }
  return pdf.output('blob')
}
