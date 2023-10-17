import { BoardHex } from 'game/types'
import { useBgioG } from 'bgio-contexts'
import { MapHex3D } from './MapHex3D'

export function MapDisplay3D() {
  const {
    boardHexes,
    hexMap: { mapId },
  } = useBgioG()
  const hexArray = Object.values(boardHexes)
  return (
    <>
      {hexArray.map((bh) => {
        return (
          <MapHex3D
            // key is ready for multi-level hexes
            key={`${bh.id}-${bh.altitude}`}
            boardHex={bh as BoardHex}
          />
        )
      })}
    </>
  )
}
