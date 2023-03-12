import { generateHexagon } from './hex-gen'
import {
  BoardHexes,
  GameMap,
  GameUnits,
  MapOptions,
  StartZones,
} from '../types'
import { giantsTable } from './giantsTable'
import { devHexagon } from './devHexagon'
import { selectHexNeighbors } from '../selectors'
import { transformBoardHexesWithPrePlacedUnits } from '../transformers'

function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart: string | number = (Math.random() * 46656) | 0
  let secondPart: string | number = (Math.random() * 46656) | 0
  firstPart = ('000' + firstPart.toString(36)).slice(-3)
  secondPart = ('000' + secondPart.toString(36)).slice(-3)
  return firstPart + secondPart
}
export function makeGiantsTableMap({
  withPrePlacedUnits,
  gameUnitsToPrePlace,
}: {
  withPrePlacedUnits?: boolean
  gameUnitsToPrePlace: GameUnits
}): GameMap {
  const boardHexes = giantsTable.boardHexes as unknown as BoardHexes
  if (!boardHexes) {
    throw new Error('giantsTable.boardHexes is not defined')
  }
  for (const hex in boardHexes) {
    if (Object.prototype.hasOwnProperty.call(boardHexes, hex)) {
      const element = boardHexes[hex]
      if (element.terrain === 'void') {
        delete boardHexes[hex]
      }
    }
  }
  const startZones = getStartZonesFromBoardHexes(boardHexes)
  if (withPrePlacedUnits) {
    transformBoardHexesWithPrePlacedUnits(
      boardHexes,
      startZones,
      gameUnitsToPrePlace ?? {}
    )
  }
  return {
    boardHexes: giantsTable.boardHexes as unknown as BoardHexes,
    hexMap: giantsTable.hexMap,
    startZones: getStartZonesFromBoardHexes(boardHexes),
  }
}
export function makeDevHexagonMap({
  withPrePlacedUnits,
  gameUnits,
}: {
  withPrePlacedUnits: boolean
  gameUnits: GameUnits
}): GameMap {
  const boardHexes = devHexagon.boardHexes as unknown as BoardHexes
  if (!boardHexes) {
    throw new Error('devHexagon.boardHexes is not defined')
  }
  const startZones = getStartZonesFromBoardHexes(boardHexes)
  if (withPrePlacedUnits) {
    transformBoardHexesWithPrePlacedUnits(
      boardHexes,
      startZones,
      gameUnits ?? {}
    )
  }
  return {
    boardHexes: devHexagon.boardHexes as unknown as BoardHexes,
    hexMap: devHexagon.hexMap,
    startZones: getStartZonesFromBoardHexes(boardHexes),
  }
}
export function makeHexagonShapedMap(mapOptions?: MapOptions): GameMap {
  const mapSize = mapOptions?.mapSize ?? 3
  const withPrePlacedUnits = mapOptions?.withPrePlacedUnits ?? false
  const gameUnits = mapOptions?.gameUnits ?? {}
  const flat = mapOptions?.flat ?? false

  const boardHexes: BoardHexes = transformBoardHexesToHaveStartZones(
    generateHexagon(mapSize),
    mapSize
  )
  const startZones = getStartZonesFromBoardHexes(boardHexes)
  let boardHexesWithPrePlacedUnits: BoardHexes =
    transformBoardHexesWithPrePlacedUnits(boardHexes, startZones, gameUnits)
  return {
    boardHexes: withPrePlacedUnits ? boardHexesWithPrePlacedUnits : boardHexes,
    startZones,
    hexMap: {
      mapId: generateUID(),
      mapShape: 'hexagon',
      mapName: 'The Big Hexagon',
      flat,
      mapSize,
      mapHeight: mapSize,
      mapWidth: mapSize,
      hexSize: 10,
      glyphs: {},
    },
  }
}

const transformBoardHexesToHaveStartZones = (
  boardHexes: BoardHexes,
  mapSize: number
): BoardHexes => {
  const cornersIDs = [
    `0,-${mapSize},${mapSize}`,
    `0,${mapSize},-${mapSize}`,
    `-${mapSize},0,${mapSize}`,
    `${mapSize},0,-${mapSize}`,
    `-${mapSize},${mapSize},0`,
    `${mapSize},-${mapSize},0`,
  ]
  const maxSpreadToAvoidOverlapping = Math.floor(mapSize / 2)
  let startZones: {
    [key: string]: string[]
  } = {
    '0': [`0,-${mapSize},${mapSize}`],
    '1': [`0,${mapSize},-${mapSize}`],
    '2': [`-${mapSize},0,${mapSize}`],
    '3': [`${mapSize},0,-${mapSize}`],
    '4': [`-${mapSize},${mapSize},0`],
    '5': [`${mapSize},-${mapSize},0`],
  }
  for (let index = 0; index < maxSpreadToAvoidOverlapping; index++) {
    Object.entries(startZones).forEach(([playerID, hexIDArr]) => {
      const newHexes = hexIDArr.flatMap((hexID) => {
        return selectHexNeighbors(hexID, boardHexes).map((h) => h.id)
      })
      startZones[playerID] = [...startZones[playerID], ...newHexes]
    })
  }
  return Object.entries(boardHexes).reduce((acc: BoardHexes, [hexID, hex]) => {
    const startzonePlayerIDs = Object.entries(startZones).reduce(
      (acc: string[], [playerID, hexIDs]) => {
        if (hexIDs?.includes(hexID)) {
          return [...acc, playerID]
        } else {
          return acc
        }
      },
      []
    )
    return {
      ...acc,
      [hexID]: {
        ...hex,
        startzonePlayerIDs,
      },
    }
  }, {})
}
const getStartZonesFromBoardHexes = (map: BoardHexes): StartZones => {
  let result: StartZones = {}
  for (const boardHex in map) {
    if (Object.prototype.hasOwnProperty.call(map, boardHex)) {
      map[boardHex].startzonePlayerIDs.forEach(
        (id) => (result[id] = [...(result?.[id] ?? []), map[boardHex].id])
      )
    }
  }
  return result
}
