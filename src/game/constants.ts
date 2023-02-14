import {
  HexCoordinates,
  MoveRange,
  OrderMarker,
  OrderMarkers,
  PlayerOrderMarkers,
  PlayerState,
  PlayerStateToggle,
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
  movement: 'movement',
  waitingForDisengageSwipe: 'waitingForDisengageSwipe',
  disengagementSwipe: 'disengagementSwipe',
  waterClone: 'waterClone',
  berserkerCharge: 'berserkerCharge',
  mindShackle: 'mindShackle',
  placingAttackSpirit: 'placingAttackSpirit',
  idlePlacingAttackSpirit: 'idlePlacingAttackSpirit',
  placingArmorSpirit: 'placingArmorSpirit',
  idlePlacingArmorSpirit: 'idlePlacingArmorSpirit',
  chomp: 'chomp',
  fireLineSA: 'fireLineSA',
  explosionSA: 'explosionSA',
  grenadeSA: 'grenadeSA',
}

export const OM_COUNT = 3
const ORDERS = ['0', '1', '2', 'X']

export function generateBlankOrderMarkers(): OrderMarkers {
  const blankOrderMarkers = ORDERS.reduce((prev, curr) => {
    return [...prev, { gameCardID: '', order: curr }]
  }, [] as OrderMarker[])
  return {
    '0': blankOrderMarkers,
    '1': blankOrderMarkers,
  }
}
export function generateBlankPlayersState(): PlayerState {
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

export function generateHexID(hex: HexCoordinates) {
  return `${hex.q},${hex.r},${hex.s}`
}
export function generateBlankMoveRange(): MoveRange {
  return {}
}
export function transformMoveRangeToArraysOfIds(moveRange: MoveRange): {
  safeMoves: string[]
  engageMoves: string[]
  disengageMoves: string[]
} {
  return {
    safeMoves: Object.keys(moveRange).filter(
      (hexID) => moveRange[hexID].isSafe
    ),
    engageMoves: Object.keys(moveRange).filter(
      (hexID) => moveRange[hexID].isEngage
    ),
    disengageMoves: Object.keys(moveRange).filter(
      (hexID) => moveRange[hexID].isDisengage
    ),
  }
}
const gamePlayerIDs = ['0', '1']
const selectAllOtherGamePlayerIDs = (playerID: string) => {
  return gamePlayerIDs.filter((id) => id !== playerID)
}
// Use this when you know the playerID and stage to put one player in, and need the rest to go to an idle stage
export function getActivePlayersIdleStage({
  activePlayerID,
  activeStage,
  idleStage,
}: {
  activePlayerID: string
  activeStage: string
  idleStage: string
}) {
  return gamePlayerIDs.reduce((prev, curr) => {
    if (curr === activePlayerID) {
      return { ...prev, [curr]: activeStage }
    }
    return { ...prev, [curr]: idleStage }
  }, {})
}

export function generateReadyStateForNumPlayers(
  numPlayers: number,
  defaultValue: boolean
): PlayerStateToggle {
  let rdyState: { [key: string]: boolean } = {}
  for (let index = 0; index < numPlayers; index++) {
    rdyState[index] = defaultValue
  }
  const result = rdyState
  return result
}
