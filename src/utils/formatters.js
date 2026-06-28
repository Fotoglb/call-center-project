export function formatDate(date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s]
    .map(v => String(v).padStart(2, '0'))
    .filter((v, i) => i > 0 || v !== '00')
    .join(':')
}

export function formatPhoneNumber(number) {
  const cleaned = String(number).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : number
}

export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}
