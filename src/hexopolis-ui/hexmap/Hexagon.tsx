import * as React from 'react'
import classNames from 'classnames'
import { useLayoutContext } from './HexgridLayout'
import { hexUtilsHexToPixel } from 'game/hex-utils'
import { BoardHex } from 'game/types'

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
  const { layout, points } = useLayoutContext()
  const { pixel } = React.useMemo(() => {
    const pixel = hexUtilsHexToPixel(hex, layout)
    return {
      pixel,
    }
  }, [hex, layout])

  const hexAltitude = hex.altitude
  return (
    <g
      className={'hexagon-group'}
      transform={`translate(${pixel.x}, ${pixel.y})`}
      onClick={(e) => {
        if (onClick) {
          onClick(e, hex)
        }
      }}
    >
      <g className="hexagon">
        <polygon points={points} className={className} />
        {children}
      </g>
    </g>
  )
}

export default Hexagon
