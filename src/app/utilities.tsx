export const omToString = (om: string) => {
  return om === 'X' ? om : (parseInt(om) + 1).toString()
}
