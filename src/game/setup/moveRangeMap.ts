export const moveRangeTestHexIDs = {
  safeAdjacentSameLevel_id: '1,0,-1',
  engagedAdjacentSameLevel_id: '0,0,0',
  disengageOne_id: '-2,1,1',
  basicAdjacentFall_id: '-1,1,0',
}

export const moveRangeMap = {
  boardHexes: {
    [moveRangeTestHexIDs.basicAdjacentFall_id]: {
      // adjacent fall, jumping into a hole
      q: -1,
      r: 1,
      s: 0,
      id: moveRangeTestHexIDs.basicAdjacentFall_id,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 1,
      terrain: 'grass',
      startzonePlayerIDs: [''],
    },
    [moveRangeTestHexIDs.disengageOne_id]: {
      // the disengagement of bad-guy-1
      q: -2,
      r: 1,
      s: 1,
      id: moveRangeTestHexIDs.disengageOne_id,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 5,
      terrain: 'grass',
      startzonePlayerIDs: [''],
    },
    '-1,-1,2': {
      // second "bad guy" will go here
      q: -1,
      r: -1,
      s: 2,
      id: '-1,-1,2',
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 5,
      terrain: 'grass',
      startzonePlayerIDs: [''],
    },
    '-1,0,1': {
      q: -1,
      r: 0,
      s: 1,
      id: '-1,0,1',
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 5,
      terrain: 'grass',
      startzonePlayerIDs: [''],
    },
    '0,-1,1': {
      q: 0,
      r: -1,
      s: 1,
      id: '0,-1,1',
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 5,
      terrain: 'grass',
      startzonePlayerIDs: ['0'],
    },
    [moveRangeTestHexIDs.engagedAdjacentSameLevel_id]: {
      q: 0,
      r: 0,
      s: 0,
      id: moveRangeTestHexIDs.engagedAdjacentSameLevel_id,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 5,
      terrain: 'grass',
      startzonePlayerIDs: [],
    },
    '0,1,-1': {
      q: 0,
      r: 1,
      s: -1,
      id: '0,1,-1',
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 5,
      terrain: 'grass',
      startzonePlayerIDs: ['1'],
    },
    // '1,-1,0': {
    //   q: 1,
    //   r: -1,
    //   s: 0,
    //   id: '1,-1,0',
    //   occupyingUnitID: '',
    //   isUnitTail: false,
    //   altitude: 5,
    //   terrain: 'grass',
    //   startzonePlayerIDs: ['5'],
    // },
    [moveRangeTestHexIDs.safeAdjacentSameLevel_id]: {
      q: 1,
      r: 0,
      s: -1,
      id: moveRangeTestHexIDs.safeAdjacentSameLevel_id,
      occupyingUnitID: '',
      isUnitTail: false,
      altitude: 5,
      terrain: 'grass',
      startzonePlayerIDs: ['3'],
    },
  },
  hexMap: {
    mapId: 'moveRangeMap',
    mapShape: 'hexagon',
    mapName: 'Move Range Test Map',
    flat: false,
    mapSize: 1,
    hexSize: 10,
    mapWidth: 1,
    mapHeight: 1,
    glyphs: {
      // '0,0,0': {
      //   hexID: '0,0,0',
      //   glyphID: 'move',
      //   isRevealed: true,
      // },
    },
  },
}
