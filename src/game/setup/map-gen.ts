import { generateHexagon } from './hex-gen'
import {
  BoardHexes,
  GameMap,
  GameUnits,
  MapOptions,
  StartZones,
  StringKeyedObj,
} from '../types'
import { giantsTable } from './giantsTable'
import { devHexagon } from './devHexagon'
import { selectHexNeighbors, selectValidTailHexes } from '../selectors'

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
  gameUnits,
}: {
  withPrePlacedUnits: boolean
  gameUnits: GameUnits
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
      gameUnits ?? {}
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
    },
  }
}
function transformBoardHexesWithPrePlacedUnits(
  boardHexes: BoardHexes,
  startZones: StartZones,
  gameUnits: GameUnits
): BoardHexes {
  const copy = { ...boardHexes }
  const gameUnitsArr = Object.values(gameUnits)
  gameUnitsArr.forEach((unit) => {
    const is2Hex = unit.is2Hex
    try {
      const { playerID } = unit
      const sz = startZones?.[playerID].filter(
        (sz) => copy[sz].occupyingUnitID === ''
      )
      const validHex =
        sz?.find((hexID) => {
          if (is2Hex) {
            const validTails = selectValidTailHexes(hexID, copy).filter(
              (t) => t.occupyingUnitID === ''
            )
            return copy[hexID].occupyingUnitID === '' && validTails.length > 0
          } else {
            return copy[hexID].occupyingUnitID === ''
          }
        }) ?? ''
      const validTail = selectValidTailHexes(validHex ?? '', copy)
        .filter((t) => t.occupyingUnitID === '')
        .map((h) => h.id)[0]
      // update boardHex
      if (unit.is2Hex) {
        // update boardHex
        copy[validHex].occupyingUnitID = unit.unitID
        copy[validTail].occupyingUnitID = unit.unitID
        copy[validTail].isUnitTail = true
      } else {
        copy[validHex].occupyingUnitID = unit.unitID
      }
    } catch (error) {
      console.error(
        '🚀 ~ file: mapGen.ts ~ line 81 ~ gameUnitsArr.forEach ~ error',
        `🚔 The problem is likely the map is too small for the function trying to place all the units for pre-placed units (dev option on map setup)`,
        error
      )
    }
  })
  return copy
}

const transformBoardHexesToHaveStartZones = (
  boardHexes: BoardHexes,
  mapSize: number
): BoardHexes => {
  let result: BoardHexes = {}
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
