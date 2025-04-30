import { SVG_HEX_APOTHEM, SVG_HEX_RADIUS } from 'app/constants'
import { Point } from 'game/types'

export function getHexagonSvgPolygonPoints(
) {
  const corners: Point[] = []

  for (let i = 0; i < 6; i++) {
    const x = SVG_HEX_RADIUS * Math.cos((2 * Math.PI * i) / 6 + Math.PI / 6)
    const y = SVG_HEX_RADIUS * Math.sin((2 * Math.PI * i) / 6 + Math.PI / 6)
    const point = { x: SVG_HEX_APOTHEM + x, y: SVG_HEX_RADIUS + y }
    // const point = { x: x, y: y }
    corners.push(point)
  }

  return corners
}

