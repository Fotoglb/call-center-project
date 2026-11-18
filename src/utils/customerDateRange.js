export function customerDateRange(range, now = new Date()) {
  if (!range) return {}
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start)
  if (range === 'yesterday') {
    start.setDate(start.getDate() - 1)
    end.setDate(end.getDate() - 1)
  } else if (range === 'week') start.setDate(start.getDate() - 6)
  else if (range === 'month') start.setDate(1)
  else if (range !== 'today') return {}
  end.setHours(23, 59, 59, 999)
  return { from: start.toISOString(), to: end.toISOString() }
}
