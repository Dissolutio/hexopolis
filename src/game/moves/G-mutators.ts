import { generateBlankPlayersOrderMarkers } from '../constants'
import { selectGameCardByID, selectUnitsForCard } from '../selectors'
import { selectUnitMoveValue } from '../selector/card-selectors'
import {
  BoardHexes,
  GameArmyCard,
  GameUnits,
  Glyph,
  Glyphs,
  OrderMarkers,
  PlayerOrderMarkers,
  PlayerState,
  UnitsKilled,
} from '../types'
import { MOVE_GLYPH_BONUS } from '../glyphs'

export const killUnit_G = ({
  boardHexes,
  unitsKilled,
  killedUnits,
  gameUnits,
  gameArmyCards,
  killedArmyCards,
  unitToKillID,
  killerUnitID,
  defenderHexID,
  defenderTailHexID,
}: {
  boardHexes: BoardHexes
  gameArmyCards: GameArmyCard[]
  killedArmyCards: GameArmyCard[]
  unitsKilled: UnitsKilled
  killedUnits: GameUnits
  gameUnits: GameUnits
  unitToKillID: string
  killerUnitID?: string
  defenderHexID?: string
  defenderTailHexID?: string
}) => {
  // if someone killed this unit, add them to the killed units (wasted units from The Drop have no killer)
  if (killerUnitID) {
    unitsKilled[killerUnitID] = [
      ...(unitsKilled?.[killerUnitID] ?? []),
      unitToKillID,
    ]
  }

  killedUnits[unitToKillID] = {
    ...gameUnits[unitToKillID],
  }
  delete gameUnits[unitToKillID]
  if (defenderHexID) {
    // remove from hex, and tail if applicable
    boardHexes[defenderHexID].occupyingUnitID = ''
    if (defenderTailHexID) {
      boardHexes[defenderTailHexID].occupyingUnitID = ''
      boardHexes[defenderTailHexID].isUnitTail = false
    }
  }
  // remove the game army card if all units for it are dead
  const isNoMoreUnitsForCard = !Object.values(gameUnits).find(
    (u) => u.gameCardID === killedUnits[unitToKillID].gameCardID
  )
  if (isNoMoreUnitsForCard) {
    const indexOfGameArmyCardToRemove = gameArmyCards.findIndex(
      (c) => c.gameCardID === killedUnits[unitToKillID].gameCardID
    )
    killedArmyCards.push(gameArmyCards[indexOfGameArmyCardToRemove])
    gameArmyCards.splice(indexOfGameArmyCardToRemove, 1)
  }
}
export const moveUnit_G = ({
  unitID,
  startHexID,
  endHexID,
  boardHexes,
  startTailHexID = '',
  endTailHexID = '',
}: {
  unitID: string
  startHexID: string
  endHexID: string
  boardHexes: BoardHexes
  startTailHexID?: string
  endTailHexID?: string
}) => {
  if (startTailHexID) {
    // remove from old
    boardHexes[startHexID].occupyingUnitID = ''
    boardHexes[startTailHexID].occupyingUnitID = ''
    boardHexes[startTailHexID].isUnitTail = false
    // add to new
    boardHexes[endHexID].occupyingUnitID = unitID
    boardHexes[endTailHexID].occupyingUnitID = unitID
    boardHexes[endTailHexID].isUnitTail = true
  } else {
    // remove from old
    boardHexes[startHexID].occupyingUnitID = ''
    // add to new
    boardHexes[endHexID].occupyingUnitID = unitID
  }
}
export const revealGlyph_G = ({
  endHexID,
  glyphOnHex,
  glyphs,
}: {
  endHexID: string
  glyphOnHex: Glyph
  glyphs: Glyphs
}) => {
  const isUnrevealedGlyph = glyphOnHex.isRevealed === false
  // reveal glyph
  if (isUnrevealedGlyph) {
    // mutate glyphs
    glyphs[endHexID].isRevealed = true
  }
}
export const assignCardMovePointsToUnit_G = ({
  unitID,
  boardHexes,
  gameArmyCards,
  gameUnits,
  glyphs,
  overrideMovePoints,
}: {
  unitID: string
  boardHexes: BoardHexes
  gameArmyCards: GameArmyCard[]
  gameUnits: GameUnits
  glyphs: Glyphs
  overrideMovePoints?: number
}) => {
  const gameCard = selectGameCardByID(
    gameArmyCards,
    gameUnits[unitID].gameCardID
  )
  // TODO: move point card selector
  if (!gameCard) {
    return
  }
  const startingMovePoints = selectUnitMoveValue({
    unitID,
    gameArmyCard: gameCard,
    boardHexes,
    gameUnits,
    glyphs,
  })
  const movePoints = overrideMovePoints ?? startingMovePoints ?? 0
  // move-points
  const unitWithMovePoints = {
    ...gameUnits[unitID],
    movePoints,
  }
  gameUnits[unitID] = unitWithMovePoints
}
// So, this function gets called:
// NOT REPLACED YET: 1. when we assign initial move points (start of turn, after BerserkerCharge success)
// 2. AND when we move onto a move glyph, we will update the move points of the current turn's units (except the one on the glyph, since they do not get the bonus when moving off the glyph)
export const updateMovePointsUponMovingOntoMoveGlyph_G = ({
  gameCardID,
  unitIdOnGlyph,
  gameArmyCards,
  gameUnits,
}: {
  gameCardID: string
  unitIdOnGlyph: string
  boardHexes: BoardHexes
  gameArmyCards: GameArmyCard[]
  gameUnits: GameUnits
  glyphs: Glyphs
}) => {
  const gameCard = selectGameCardByID(gameArmyCards, gameCardID)
  const currentTurnUnits = selectUnitsForCard(
    gameCard?.gameCardID ?? '',
    gameUnits
  )
  if (!gameCard) {
    return
  }
  // move-points
  currentTurnUnits.forEach((unit) => {
    //ignore the unit on the glyph, it does not get the bonus when moving off of the glyph (moving at all, really)
    if (unit.unitID === unitIdOnGlyph) {
      return
    }
    // all the other units for this turn's card get the bonus
    const unitWithMovePoints = {
      ...gameUnits[unit.unitID],
      movePoints: gameUnits[unit.unitID].movePoints + MOVE_GLYPH_BONUS,
    }
    // gameUnits is what gets mutated
    gameUnits[unit.unitID] = unitWithMovePoints
  })
}

export const wipeCardOrderMarkers_G = ({
  gameCardToWipeID,
  playerID,
  playerState,
  orderMarkers,
}: {
  gameCardToWipeID: string
  playerID: string
  playerState: PlayerState
  orderMarkers: OrderMarkers
}) => {
  // 1. wipe order markers from playerState
  const playerPrivateOrderMarkers = playerState[playerID].orderMarkers
  const playerStateOrderMarkersFilteredForCard = Object.entries(
    playerPrivateOrderMarkers
  ).reduce((acc: PlayerOrderMarkers, entry) => {
    const [order, gameCardID] = entry
    if (gameCardID === gameCardToWipeID) {
      return {
        ...acc,
        [order]: '',
      }
    }
    return {
      ...acc,
      [order]: gameCardID,
    }
  }, generateBlankPlayersOrderMarkers())
  // apply mutation to playerState
  playerState[playerID].orderMarkers = playerStateOrderMarkersFilteredForCard
  // 2. wipe order markers from public orderMarkers
  const orderMarkersFilteredForCard = orderMarkers[playerID].map((order) => {
    if (order.gameCardID === gameCardToWipeID) {
      return {
        ...order,
        gameCardID: '',
      }
    }
    return {
      ...order,
      gameCardID: order.gameCardID,
    }
  })
  // apply mutation to public orderMarkers
  orderMarkers[playerID] = orderMarkersFilteredForCard
}
// const entriesPS = Object.entries(playerPrivateOrderMarkers)
