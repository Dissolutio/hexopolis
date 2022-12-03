import { Hex } from 'react-hexgrid'
import {
  MoveRange,
  OrderMarker,
  OrderMarkers,
  PlayerOrderMarkers,
  PlayersState,
} from './types'

export const phaseNames = {
  placement: 'placement',
  placeOrderMarkers: 'placeOrderMarkers',
  roundOfPlay: 'roundOfPlay',
}

export const stageNames = {
  placeOrderMarkers: 'placeOrderMarkers',
  placingUnits: 'placingUnits',
  attacking: 'attacking',
}

export const OM_COUNT = 3
const ORDERS = ['0', '1', '2', 'X']

export function generatePreplacedOrderMarkers(): OrderMarkers {
  const orderMarkers: OrderMarkers = {
    '0': [],
    '1': [],
  }
  for (let i = 0; i < OM_COUNT; i++) {
    orderMarkers['0'].push({
      order: i.toString(),
      gameCardID: 'p0_hs1185',
    })
    orderMarkers['1'].push({
      order: i.toString(),
      gameCardID: 'p1_hs1002',
    })
  }
  return orderMarkers
}
export function generateBlankOrderMarkers(): OrderMarkers {
  const blankOrderMarkers = ORDERS.reduce((prev, curr) => {
    return [...prev, { gameCardID: '', order: curr }]
  }, [] as OrderMarker[])
  return {
    '0': blankOrderMarkers,
    '1': blankOrderMarkers,
  }
}
export function generateBlankPlayersState(): PlayersState {
  return {
    '0': {
      orderMarkers: generateBlankPlayersOrderMarkers(),
    },
    '1': {
      orderMarkers: generateBlankPlayersOrderMarkers(),
    },
  }
}
export function generateBlankPlayersOrderMarkers(): PlayerOrderMarkers {
  return {
    '0': '',
    '1': '',
    '2': '',
    X: '',
  }
}

export function generateHexID(hex: Hex) {
  return `${hex.q},${hex.r},${hex.s}`
}
export function generateBlankMoveRange(): MoveRange {
  return { safe: [], engage: [], disengage: [], denied: [] }
}
