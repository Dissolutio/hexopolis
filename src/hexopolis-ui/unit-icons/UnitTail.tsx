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
      (e) => e[1].unitID === hex.occupyingUnitID && !e[1].isUnitTail
    )?.[0] ?? ''
  const headHex = boardHexes?.[headHexID]
  const headCoordinates = hexUtilsGetTailCoordinates(hex, headHex)
  console.log(
    '🚀 ~ file: UnitTail.tsx:20 ~ UnitTail ~ headCoordinates',
    headCoordinates
  )
  const mapDirectionToHeadCoordinates = {
    // This is assuming (0,0) is the center of the tail's hexagon, and remember its using <svg>'s x,y coordinate system
    NE: { x: 8.66, y: -15 },
    E: { x: 17.32, y: 0 },
    SE: { x: 8.66, y: 15 },
    SW: { x: -8.66, y: 15 },
    W: { x: -17.32, y: 0 },
    NW: { x: -8.66, y: -15 },
  }
  return (
    <g>
      <line
        x1="0"
        y1="0"
        x2={headCoordinates.x}
        y2={headCoordinates.y}
        // style={{ stroke: 'var(--player-color)', strokeWidth: 2 }}
      />
    </g>
  )
}
