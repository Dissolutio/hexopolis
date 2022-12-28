import { HexCoordinates } from './types'

export const hexUtilsDistance = (
  a: HexCoordinates,
  b: HexCoordinates
): number => {
  return hexUtilsLengths(hexUtilsSubtract(a, b))
}
export const hexUtilsLengths = (hex: HexCoordinates): number => {
  return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2
}
export const hexUtilsSubtract = (
  a: HexCoordinates,
  b: HexCoordinates
): HexCoordinates => {
  return { q: a.q - b.q, r: a.r - b.r, s: a.s - b.s }
}
