import { BoardHexes, HexCoordinates, HexTerrain } from '../types'
import { generateHexID } from '../constants'
import { generateHexagonHexas } from '../hex-utils'

export const generateHexagon = (mapSize: number): BoardHexes => {
  const hexgridHexes = generateHexagonHexas(mapSize)
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
        isUnitTail: false,
        altitude: 1,
        terrain: HexTerrain.grass,
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

// function generateOrientedRectangle(mapSize: number): BoardHexes {
//   const hexgridHexes = generateOrientedRectangleHexas(mapSize, mapSize)
//   const boardHexes = hexesToBoardHexes(hexgridHexes)
//   return boardHexes
// }
// function generateRectangle(mapSize: number): BoardHexes {
//   const hexgridHexes = generateRectangleHexas(mapSize + 1, mapSize + 1)
//   const boardHexes = hexesToBoardHexes(hexgridHexes)
//   return boardHexes
// }
// function generateParallelogram(mapSize: number): BoardHexes {
//   const hexgridHexes = generateParalellogramHexas(
//     -mapSize - 2,
//     mapSize + 2,
//     -mapSize,
//     mapSize
//   )
//   const boardHexes = hexesToBoardHexes(hexgridHexes)
//   return boardHexes
// }
