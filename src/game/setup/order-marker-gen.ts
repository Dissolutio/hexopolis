import { OrderMarkers, PlayerState, StartingArmies } from '../types'

const generateOrderMarkerIDsFromStartingArmies = (
  startingArmies: StartingArmies
) => {
  return {
    p0_0: `p0_${startingArmies?.['0']?.[0] ?? ''}`,
    p0_1: `p0_${startingArmies?.['0']?.[0] ?? ''}`,
    p0_2: `p0_${startingArmies?.['0']?.[0] ?? ''}`,
    p0_X: `p0_${startingArmies?.['0']?.[0] ?? ''}`,
    p1_0: `p1_${startingArmies?.['1']?.[0] ?? ''}`,
    p1_1: `p1_${startingArmies?.['1']?.[0] ?? ''}`,
    p1_2: `p1_${startingArmies?.['1']?.[0] ?? ''}`,
    p1_X: `p1_${startingArmies?.['1']?.[0] ?? ''}`,
    p2_0: `p2_${startingArmies?.['2']?.[0] ?? ''}`,
    p2_1: `p2_${startingArmies?.['2']?.[0] ?? ''}`,
    p2_2: `p2_${startingArmies?.['2']?.[0] ?? ''}`,
    p2_X: `p2_${startingArmies?.['2']?.[0] ?? ''}`,
    p3_0: `p3_${startingArmies?.['3']?.[0] ?? ''}`,
    p3_1: `p3_${startingArmies?.['3']?.[0] ?? ''}`,
    p3_2: `p3_${startingArmies?.['3']?.[0] ?? ''}`,
    p3_X: `p3_${startingArmies?.['3']?.[0] ?? ''}`,
    p4_0: `p4_${startingArmies?.['4']?.[0] ?? ''}`,
    p4_1: `p4_${startingArmies?.['4']?.[0] ?? ''}`,
    p4_2: `p4_${startingArmies?.['4']?.[0] ?? ''}`,
    p4_X: `p4_${startingArmies?.['4']?.[0] ?? ''}`,
    p5_0: `p5_${startingArmies?.['5']?.[0] ?? ''}`,
    p5_1: `p5_${startingArmies?.['5']?.[0] ?? ''}`,
    p5_2: `p5_${startingArmies?.['5']?.[0] ?? ''}`,
    p5_X: `p5_${startingArmies?.['5']?.[0] ?? ''}`,
  }
}

export function generatePreplacedOrderMarkers(
  numPlayers: number,
  startingArmies: StartingArmies
): OrderMarkers {
  const oms = generateOrderMarkerIDsFromStartingArmies(startingArmies)
  const orderMarkers: OrderMarkers = {
    '0': [
      { order: '0', gameCardID: oms.p0_0 },
      { order: '1', gameCardID: oms.p0_1 },
      { order: '2', gameCardID: oms.p0_2 },
      { order: 'X', gameCardID: oms.p0_X },
    ],
    '1': [
      { order: '0', gameCardID: oms.p1_0 },
      { order: '1', gameCardID: oms.p1_1 },
      { order: '2', gameCardID: oms.p1_2 },
      { order: 'X', gameCardID: oms.p1_X },
    ],
    '2': [
      { order: '0', gameCardID: oms.p2_0 },
      { order: '1', gameCardID: oms.p2_1 },
      { order: '2', gameCardID: oms.p2_2 },
      { order: 'X', gameCardID: oms.p2_X },
    ],
    '3': [
      { order: '0', gameCardID: oms.p3_0 },
      { order: '1', gameCardID: oms.p3_1 },
      { order: '2', gameCardID: oms.p3_2 },
      { order: 'X', gameCardID: oms.p3_X },
    ],
    '4': [
      { order: '0', gameCardID: oms.p4_0 },
      { order: '1', gameCardID: oms.p4_1 },
      { order: '2', gameCardID: oms.p4_2 },
      { order: 'X', gameCardID: oms.p4_X },
    ],
    '5': [
      { order: '0', gameCardID: oms.p5_0 },
      { order: '1', gameCardID: oms.p5_1 },
      { order: '2', gameCardID: oms.p5_2 },
      { order: 'X', gameCardID: oms.p5_X },
    ],
  }
  const result: OrderMarkers = {}
  for (let index = 0; index < numPlayers; index++) {
    result[index] = orderMarkers[index]
  }
  return orderMarkers
}
export function playersStateWithPrePlacedOMs(
  numPlayers: number,
  startingArmies: StartingArmies
): PlayerState {
  const oms = generateOrderMarkerIDsFromStartingArmies(startingArmies)
  const orderMarkers: { [key: number]: any } = {
    0: {
      '0': oms.p0_0,
      '1': oms.p0_1,
      '2': oms.p0_2,
      X: oms.p0_X,
    },
    1: {
      '0': oms.p1_0,
      '1': oms.p1_1,
      '2': oms.p1_2,
      X: oms.p1_X,
    },
    2: {
      '0': oms.p2_0,
      '1': oms.p2_1,
      '2': oms.p2_2,
      X: oms.p2_X,
    },
    3: {
      '0': oms.p3_0,
      '1': oms.p3_1,
      '2': oms.p3_2,
      X: oms.p3_X,
    },
    4: {
      '0': oms.p4_0,
      '1': oms.p4_1,
      '2': oms.p4_2,
      X: oms.p4_X,
    },
    5: {
      '0': oms.p5_0,
      '1': oms.p5_1,
      '2': oms.p5_2,
      X: oms.p5_X,
    },
  }
  const result: PlayerState = {}
  for (let index = 0; index < numPlayers; index++) {
    result[index] = { orderMarkers: orderMarkers[index] }
  }
  return result
}
