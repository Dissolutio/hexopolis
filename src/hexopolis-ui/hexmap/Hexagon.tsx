import * as React from 'react'
import classNames from 'classnames'
import { useLayoutContext } from './HexgridLayout'
import { hexUtilsHexToPixel } from 'game/hex-utils'
import { HexCoordinates } from 'game/types'

type HexagonProps = {
  q: number
  r: number
  s: number
  data?: any
  onClick?: HexagonMouseEventHandler
  className?: string
  children?: React.ReactNode | React.ReactNode[]
}

type H = { data?: any; state: { hex: HexCoordinates }; props: HexagonProps }

export type HexagonMouseEventHandler = (
  event: React.MouseEvent<SVGGElement, MouseEvent>,
  h: H
) => void

/**
 * Renders a Hexagon cell at the given rqs-based coordinates.
 */
export function Hexagon(props: HexagonProps) {
  const { q, r, s, data, onClick, className, children } = props
  const { layout, points } = useLayoutContext()
  const { hex, pixel } = React.useMemo(() => {
    const hex = { q, r, s }
    const pixel = hexUtilsHexToPixel(hex, layout)
    if (`${hex.q},${hex.r},${hex.s}` === '-2,6,-4') {
      console.log(
        '🚀 ~ file: Hexagon.tsx:33 ~ const{hex,pixel}=React.useMemo ~ pixel',
        pixel
      )
    }
    return {
      hex,
      pixel,
    }
  }, [q, r, s, layout])

  const state = { hex }

  return (
    <g
      className={classNames('hexagon-group', className)}
      transform={`translate(${pixel.x}, ${pixel.y})`}
      onClick={(e) => {
        if (onClick) {
          onClick(e, { data, state, props })
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
