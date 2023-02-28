import * as React from 'react'
import { useLayoutContext } from './HexgridLayout'
import { hexUtilsHexToPixel } from 'game/hex-utils'
import { BoardHex } from 'game/types'
import { HexGridCoordinate } from './HexGridCoordinate'

type HexagonProps = {
  hex: BoardHex
  onClick?: (e: React.MouseEvent, hex: BoardHex) => void
  className?: string
  children?: React.ReactNode | React.ReactNode[]
}

/**
 * Renders a Hexagon cell at the given rqs-based coordinates.
 */
export function Hexagon(props: HexagonProps) {
  const { hex, onClick, className, children } = props
  const { points } = useLayoutContext()

  return (
    <HexGridCoordinate hex={hex} onClick={onClick}>
      <polygon points={points} className={`base-maphex ${className}`} />
      {children}
    </HexGridCoordinate>
  )
}

export default Hexagon
