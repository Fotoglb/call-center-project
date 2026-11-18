// Match the international format used when saving Saudi phone numbers.
export function normalizeCustomerSearch(value) {
  const text = String(value ?? '').trim()
  const digits = text
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
  if (!/^[+\d\s()-]+$/.test(digits)) return text

  const phone = digits.replace(/[\s()-]/g, '')
  // Accept partial numbers too, so typing 05 searches the +9665 prefix.
  if (/^05\d*$/.test(phone)) return `+966${phone.slice(1)}`
  if (/^5\d*$/.test(phone)) return `+966${phone}`
  if (/^009665\d*$/.test(phone)) return `+${phone.slice(2)}`
  if (/^9665\d*$/.test(phone)) return `+${phone}`
  return phone
}
