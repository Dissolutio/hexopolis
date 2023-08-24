export const moveRangePassThruTestHexIDs = {
  movingUnit: '1,0,-1',
  enemyUnit: '0,0,0',
  unreachableWithoutGhostWalk: '-1,0,1',
}

export const moveRangePassThruMap = {
  boardHexes: {
    [moveRangePassThruTestHexIDs.enemyUnit]: {
      q: 0,
      r: 0,
      s: 0,
      id: moveRangePassThruTestHexIDs.enemyUnit,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: ['0'],
    },
    [moveRangePassThruTestHexIDs.movingUnit]: {
      q: 1,
      r: 0,
      s: -1,
      id: moveRangePassThruTestHexIDs.movingUnit,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: ['1'],
    },
    [moveRangePassThruTestHexIDs.unreachableWithoutGhostWalk]: {
      q: -1,
      r: 0,
      s: 1,
      id: moveRangePassThruTestHexIDs.unreachableWithoutGhostWalk,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: [''],
    },
  },
  hexMap: {
    mapId: 'moveRangePassThruMap',
    mapShape: 'hexagon',
    mapName: 'Move Range Pass Thru Test Map',
    flat: false,
    mapSize: 1,
    hexSize: 10,
    mapWidth: 1,
    mapHeight: 1,
    glyphs: {},
  },
}
