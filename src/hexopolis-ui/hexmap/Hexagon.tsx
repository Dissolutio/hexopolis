import * as React from 'react'
import classNames from 'classnames'
import { useLayoutContext } from './HexgridLayout'
import { hexUtilsHexToPixel } from 'game/hex-utils'
import { HexCoordinates } from 'game/types'

type Props = {
  q: number
  r: number
  s: number
  fill?: string
  data?: any
  onClick?: HexagonMouseEventHandler
  className?: string
  children?: React.ReactNode | React.ReactNode[]
}

type H = { data?: any; state: { hex: HexCoordinates }; props: Props }

export type HexagonMouseEventHandler = (
  event: React.MouseEvent<SVGGElement, MouseEvent>,
  h: H
) => void

/**
 * Renders a Hexagon cell at the given rqs-based coordinates.
 */
export function Hexagon(props: Props) {
  const { q, r, s, fill, data, onClick, className, children } = props
  const fillId = fill ? `url(#${fill})` : undefined
  const { layout, points } = useLayoutContext()
  const { hex, pixel } = React.useMemo(() => {
    const hex = { q, r, s }
    const idToCheck = '0,4,-4'
    const pixel = hexUtilsHexToPixel(hex, layout)
    if (`${hex.q},${hex.r},${hex.s}` === idToCheck) {
      console.log(
        '🚀 ~ file: Hexagon.tsx:34 ~ const{hex,pixel}=React.useMemo ~ pixel',
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
        <polygon points={points} fill={fillId} />
        {children}
      </g>
    </g>
  )
}

export default Hexagon
