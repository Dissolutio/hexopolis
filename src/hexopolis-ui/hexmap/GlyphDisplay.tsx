import * as React from 'react'

import { useLayoutContext, calculateCoordinates } from './HexgridLayout'
import { hexUtilsHexToPixel } from 'game/hex-utils'
import { BoardHex } from 'game/types'

type Props = {
  hex: BoardHex
  //   onClick?: (e: React.MouseEvent, hex: BoardHex) => void
  //   className?: string
  //   children?: React.ReactNode | React.ReactNode[]
}

/**
 * Renders a Hexagon cell at the given rqs-based coordinates.
 */
export function GlyphDisplay(props: Props) {
  const { hex } = props
  //   const hexAltitude = hex.altitude
  const { layout } = useLayoutContext()
  const angle = layout.flat ? 0 : Math.PI / 6
  const cornerCoords = calculateCoordinates(layout.size.x / 2, angle)
  const points = cornerCoords.map((point) => `${point.x},${point.y}`).join(' ')
  //   const { pixel } = React.useMemo(() => {
  //     const pixel = hexUtilsHexToPixel(hex, layout)
  //     return {
  //       pixel,
  //     }
  //   }, [hex, layout])

  return (
    <g transform={`translate(0, -2)`}>
      <polygon className={'hex-glyph'} points={points} />
    </g>
  )
}
