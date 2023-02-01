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
  const style = {
    transform: `rotateZ(0deg) rotateX(${hexAltitude}deg) rotateY(0deg) translate3d(${pixel.x}px, ${pixel.y}px, ${hexAltitude}px)`,
  }
  return (
    <g
      className={classNames('hexagon-group', className)}
      style={style}
      onClick={(e) => {
        if (onClick) {
          onClick(e, hex)
        }
      }}
    >
      <g className="hexagon">
        <polygon points={points} />
        {children}
      </g>
    </g>
  )
}

export default Hexagon
