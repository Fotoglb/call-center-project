export const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const isRequired = value =>
  value !== null && value !== undefined && String(value).trim() !== ''

export const minLength = (value, min) => String(value).length >= min

export const maxLength = (value, max) => String(value).length <= max

export const isPhone = value => /^\+?[\d\s\-().]{7,15}$/.test(value)

export function createValidator(rules) {
  return function validate(values) {
    const errors = {}
    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const [rule, param] of Object.entries(fieldRules)) {
        if (rule === 'required' && param && !isRequired(values[field])) {
          errors[field] = `${field} is required`
          break
        }
        if (rule === 'email' && param && values[field] && !isEmail(values[field])) {
          errors[field] = 'Invalid email address'
          break
        }
        if (rule === 'minLength' && values[field] && !minLength(values[field], param)) {
          errors[field] = `Minimum ${param} characters required`
          break
        }
      }
    }
    return errors
  }
}
