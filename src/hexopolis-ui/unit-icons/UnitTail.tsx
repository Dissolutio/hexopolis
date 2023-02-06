import { useBgioCtx, useBgioG } from 'bgio-contexts'
import { hexUtilsGetTailCoordinates } from 'game/hex-utils'
import { BoardHex } from 'game/types'
import { usePlacementContext } from 'hexopolis-ui/contexts'
import { playerIconColors } from './UnitIcon'

type Props = {
  hex: BoardHex
  iconPlayerID: string
}

export const UnitTail = ({ hex, iconPlayerID }: Props) => {
  const { boardHexes } = useBgioG()
  const { editingBoardHexes } = usePlacementContext()
  const { isPlacementPhase } = useBgioCtx()
  const hexesToConsider = isPlacementPhase ? editingBoardHexes : boardHexes
  const headHexID =
    Object.entries(hexesToConsider).find(
      (e) =>
        e[1]?.occupyingUnitID === hexesToConsider?.[hex.id]?.occupyingUnitID &&
        !e[1].isUnitTail
    )?.[0] ?? ''
  const headHex = boardHexes?.[headHexID]
  const headCoordinates = (headHex &&
    hexUtilsGetTailCoordinates(hex, headHex)) || { x: 0, y: 0 }
  const lineStyle = {
    stroke: `${playerIconColors?.[iconPlayerID as string] ?? 'var(--white)'}`,
    // stroke: `url(#lingrad-${hex.id})`,
    strokeWidth: 2,
  }
  return (
    <g>
      <line
        x1="0"
        y1="0"
        x2={headCoordinates.x}
        y2={headCoordinates.y}
        style={lineStyle}
      />
      {/* <defs>
        <linearGradient
          id={`lingrad-${hex.id}`}
          x1="0"
          y1="0"
          x2={headCoordinates.x}
          y2={headCoordinates.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="transparent" offset="0.0" />
          <stop
            stopColor={`${
              playerIconColors?.[iconPlayerID as string] ?? 'var(--white)'
            }`}
            offset="1"
          />
        </linearGradient>
      </defs> */}
    </g>
  )
}
