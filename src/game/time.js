/// NOTES:
/// this time is a u32, formatted as:
/// ??????hhhhhdddddmmmmyyyyyyyyyyyy
///
/// hours are 0 based, however days months and years are 1 based
///
/// haven't split this up into its own class or something because its relatively cheap
/// and mostly more convenient to deal with in this form

export function timeFromDateObject(date) {
  const h = (date.getHours() << 21) & 0x3e00000
  const y = date.getFullYear() & 0xfff
  const m = ((date.getMonth() + 1) << 12) & 0xf000
  const d = (date.getDate() << 16) & 0x1f0000

  return h | d | m | y
}

export function getYearFromTime(time) {
  return time & 0xfff
}

export function getMonthFromTime(time) {
  return (time & 0xf000) >> 12
}

export function getDayFromTime(time) {
  return (time & 0x1f0000) >> 16
}

export function getHourFromTime(time) {
  return (time & 0x3e00000) >> 21
}

export function updateDayFromTime(time, d) {
  return (time & 0xffe0ffff) | ((d << 16) & 0x1f0000)
}

export function updateMonthFromTime(time, m) {
  return (time & 0xffff0fff) | ((m << 12) & 0xf000)
}

export function updateYearFromTime(time, y) {
  return (time & 0xfffff000) | (y & 0xfff)
}

export function updateHourFromTime(time, h) {
  return (time & 0xfc1fffff) | ((h << 21) & 0x3e00000)
}
