export const moveRange2HexFlyEngagedMapTestHexIDs = {
  movingUnit: '0,0,0',
  movingUnitTail: '0,1,-1',
  enemyUnit1: '1,0,-1',
  enemyUnit2: '-1,0,1',
  adjacentHex: '0,-1,1',
}

export const moveRange2HexFlyEngagedMap = {
  boardHexes: {
    [moveRange2HexFlyEngagedMapTestHexIDs.movingUnit]: {
      q: 0,
      r: 0,
      s: 0,
      id: moveRange2HexFlyEngagedMapTestHexIDs.movingUnit,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: ['1'],
    },
    [moveRange2HexFlyEngagedMapTestHexIDs.movingUnitTail]: {
      q: 0,
      r: 1,
      s: -1,
      id: moveRange2HexFlyEngagedMapTestHexIDs.movingUnitTail,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: ['1'],
    },
    [moveRange2HexFlyEngagedMapTestHexIDs.enemyUnit1]: {
      q: 1,
      r: 0,
      s: -1,
      id: moveRange2HexFlyEngagedMapTestHexIDs.enemyUnit1,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: ['0'],
    },
    [moveRange2HexFlyEngagedMapTestHexIDs.enemyUnit2]: {
      q: -1,
      r: 0,
      s: 1,
      id: moveRange2HexFlyEngagedMapTestHexIDs.enemyUnit2,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: ['0'],
    },
    [moveRange2HexFlyEngagedMapTestHexIDs.adjacentHex]: {
      q: 0,
      r: -1,
      s: 1,
      id: moveRange2HexFlyEngagedMapTestHexIDs.adjacentHex,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: [''],
    },
  },
  hexMap: {
    mapId: 'moveRange2HexFlyEngagedMap',
    mapShape: 'hexagon',
    mapName: 'Move Range 2-Hex Fly Engaged Test Map',
    flat: false,
    mapSize: 1,
    hexSize: 10,
    mapWidth: 1,
    mapHeight: 1,
    glyphs: {},
  },
}
