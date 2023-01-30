import { useBgioG } from 'bgio-contexts'
import { BoardHex } from 'game/types'

type Props = {
  hexSize: number
  hex: BoardHex
}

export const UnitTail = ({ hexSize, hex }: Props) => {
  const { boardHexes } = useBgioG()
  const headHex = boardHexes[hex?.unitHeadHexID]
  console.log('🚀 ~ file: UnitTail.tsx:12 ~ UnitTail ~ headHex', headHex)

  const exampleHeadDirection = 'NW'
  const mapDirectionsToHeadCoordinates = {
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
        x2={mapDirectionsToHeadCoordinates[exampleHeadDirection].x}
        y2={mapDirectionsToHeadCoordinates[exampleHeadDirection].y}
        // style={{ stroke: 'var(--player-color)', strokeWidth: 2 }}
        style={{ stroke: 'url(#e)', strokeWidth: 2 }}
      />
    </g>
  )
}
