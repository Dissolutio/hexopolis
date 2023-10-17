import { MapHex3D } from './MapHex3D'
import { staticMap } from './static-map'
import { BoardHex, BoardHexes } from 'game/types'

const boardHexesArray = Object.values(staticMap)

export function StaticMap({ boardHexes }: { boardHexes?: BoardHexes }) {
  const hexArray = boardHexes ? Object.values(boardHexes) : boardHexesArray
  return (
    <>
      {hexArray.map((bh) => {
        return (
          <MapHex3D key={`${bh.id}${bh.altitude}`} boardHex={bh as BoardHex} />
        )
      })}
    </>
  )
}
