export const omToString = (om: string | number) => {
  if (om === undefined || om === '') return ''
  if (typeof om === 'number') {
    return (om + 1).toString()
  } else {
    return om === 'X' ? om : (parseInt(om) + 1).toString()
  }
}
