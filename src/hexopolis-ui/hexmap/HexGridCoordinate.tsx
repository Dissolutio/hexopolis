import * as React from 'react'
import { useLayoutContext } from './HexgridLayout'
import { hexUtilsHexToPixel } from 'game/hex-utils'
import { BoardHex } from 'game/types'

type Props = {
  hex: BoardHex
  onClick?: (e: React.MouseEvent, hex: BoardHex) => void
  children?: React.ReactNode | React.ReactNode[]
}

export function HexGridCoordinate(props: Props) {
  const { hex, children, onClick } = props
  const { layout } = useLayoutContext()
  const { pixel } = React.useMemo(() => {
    const pixel = hexUtilsHexToPixel(hex, layout)
    return {
      pixel,
    }
  }, [hex, layout])

  return (
    <g
      transform={`translate(${pixel.x}, ${pixel.y})`}
      onClick={(e) => {
        if (onClick) {
          onClick(e, hex)
        }
      }}
    >
      {children}
    </g>
  )
}
