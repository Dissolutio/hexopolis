import { useBgioG } from 'bgio-contexts'
import { hexUtilsGetTailCoordinates } from 'game/hex-utils'
import { BoardHex } from 'game/types'
import { usePlacementContext } from 'hexopolis-ui/contexts'

type Props = {
  hex: BoardHex
}

export const UnitTail = ({ hex }: Props) => {
  const { boardHexes } = useBgioG()
  const { editingBoardHexes } = usePlacementContext()
  const headHexID =
    Object.entries(editingBoardHexes).find(
      (e) =>
        e[1]?.unitID === editingBoardHexes?.[hex.id]?.unitID && !e[1].isUnitTail
    )?.[0] ?? ''
  const headHex = boardHexes?.[headHexID]
  const headCoordinates = (headHex &&
    hexUtilsGetTailCoordinates(hex, headHex)) || { x: 0, y: 0 }
  return (
    <g>
      <line
        x1="0"
        y1="0"
        x2={headCoordinates.x}
        y2={headCoordinates.y}
        style={{ stroke: 'var(--player-color)', strokeWidth: 2 }}
      />
    </g>
  )
}
