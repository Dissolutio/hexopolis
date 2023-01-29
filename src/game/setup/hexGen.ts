import { BoardHexes, HexCoordinates } from '../types'
import { generateHexID } from '../constants'
import {
  generateHexagonHexas,
  generateOrientedRectangleHexas,
  generateParalellogramHexas,
  generateRectangleHexas,
} from 'game/hex-utils'

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
        unitHeadHexID: '',
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
