import { BoardHexes, HexCoordinates } from '../types'
import { generateHexID } from '../constants'
import { GridGenerator } from 'game/hex-utils'

export const generateHexagon = (mapSize: number): BoardHexes => {
  const hexgridHexes = GridGenerator.hexagon(mapSize)
  const boardHexes = hexesToBoardHexes(hexgridHexes)
  return boardHexes
}

function hexesToBoardHexes(hexgridHexes: HexCoordinates[]): BoardHexes {
  return hexgridHexes.reduce(
    (prev: BoardHexes, curr: HexCoordinates): BoardHexes => {
      const boardHex = {
        ...curr,
        id: generateHexID(curr),
        occupyingUnitID: '',
        altitude: 1,
        terrain: 'grass',
        startzonePlayerIDs: [],
      }
      return {
        ...prev,
        [boardHex.id]: boardHex,
      }
    },
    {}
  )
}

//TODO -- generate other maps -- WIP
// function generateOrientedRectangle(mapSize: number): BoardHexes {
//   const hexgridHexes = GridGenerator.orientedRectangle(mapSize, mapSize)
//   const boardHexes = hexesToBoardHexes(hexgridHexes)
//   return boardHexes
// }
// function generateRectangle(mapSize: number): BoardHexes {
//   const hexgridHexes = GridGenerator.rectangle(mapSize + 1, mapSize + 1)
//   const boardHexes = hexesToBoardHexes(hexgridHexes)
//   return boardHexes
// }
// function generateParallelogram(mapSize: number): BoardHexes {
//   const hexgridHexes = GridGenerator.parallelogram(
//     -mapSize - 2,
//     mapSize + 2,
//     -mapSize,
//     mapSize
//   )
//   const boardHexes = hexesToBoardHexes(hexgridHexes)
//   return boardHexes
// }
