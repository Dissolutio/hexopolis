import { nanoid } from 'nanoid'
import { generateHexagon } from './hexGen'
import { BoardHexes, GameMap, GameUnits, MapOptions, StartZones } from './types'

export function makeHexagonShapedMap(mapOptions?: MapOptions): GameMap {
  // destructure mapOptions: mapSize, withPrePlacedUnits, gameUnits, flat
  const mapSize = mapOptions?.mapSize ?? 3
  const withPrePlacedUnits = mapOptions?.withPrePlacedUnits ?? false
  const gameUnits = mapOptions?.gameUnits ?? {}
  const flat = mapOptions?.flat ?? false

  const flatDimensions = {
    hexHeight: Math.round(Math.sqrt(3) * 100) / 100,
    hexWidth: 2,
  }
  const pointyDimensions = {
    hexHeight: 2,
    hexWidth: Math.sqrt(3),
  }
  const mapDimensions = flat ? flatDimensions : pointyDimensions
  const startZones: StartZones = startZonesNoUnits(
    generateHexagon(mapSize),
    mapSize
  )
  const startZonesWithPrePlacedUnits: StartZones = startZonesNoUnits(
    generateHexagon(mapSize),
    mapSize
  )
  const boardHexes: BoardHexes = generateHexagon(mapSize)
  let boardHexesWithPrePlacedUnits: BoardHexes = startZonesWithUnits(
    generateHexagon(mapSize),
    startZonesWithPrePlacedUnits,
    gameUnits
  )
  return {
    boardHexes: withPrePlacedUnits ? boardHexesWithPrePlacedUnits : boardHexes,
    startZones: withPrePlacedUnits ? startZonesWithPrePlacedUnits : startZones,
    hexMap: {
      ...mapDimensions,
      mapShape: 'hexagon',
      flat,
      mapSize,
      hexSize: mapSize <= 3 ? 15 : mapSize <= 5 ? 20 : mapSize <= 10 ? 25 : 25,
      mapId: nanoid(),
    },
  }
}
function startZonesNoUnits(
  boardHexes: BoardHexes,
  mapSize: number
): StartZones {
  // this divides the map in half along the S-axis
  const boardHexesArr = Object.values(boardHexes)
  const P0StartZone = boardHexesArr
    .filter((hex) => hex.s >= Math.max(mapSize - 1, 1))
    .map((hex) => hex.id)
  const P1StartZone = boardHexesArr
    .filter((hex) => hex.s <= -1 * Math.max(mapSize - 1, 1))
    .map((hex) => hex.id)
  return {
    '0': P0StartZone,
    '1': P1StartZone,
  }
}
function startZonesWithUnits(
  boardHexes: BoardHexes,
  zones: StartZones,
  gameUnits: GameUnits
): BoardHexes {
  const gameUnitsArr = Object.values(gameUnits)
  // k, j are just increment values for uniqueness of hex
  let k = 0
  let j = 0
  gameUnitsArr.forEach((unit) => {
    try {
      const { playerID } = unit
      let randomHexID: string = ''
      if (playerID === '0') {
        randomHexID = zones?.[unit.playerID][k++] ?? ''
      }
      if (playerID === '1') {
        randomHexID = zones?.[unit.playerID][j++] ?? ''
      }
      // update boardHex
      boardHexes[randomHexID].occupyingUnitID = unit.unitID
    } catch (error) {
      console.error(
        '🚀 ~ file: mapGen.ts ~ line 81 ~ gameUnitsArr.forEach ~ error',
        `🚔 The problem is likely the map is too small for the function trying to place all the units for pre-placed units (dev option on map setup)`,
        error
      )
    }
  })
  return boardHexes
}
