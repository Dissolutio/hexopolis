import { Move } from 'boardgame.io'
import { glyphIDs } from '../glyphs'
import { uniq } from 'lodash'
import { encodeGameLogMessage } from '../gamelog'
import {
  selectGameCardByID,
  selectGlyphForHex,
  selectHexForUnit,
  selectTailHexForUnit,
} from '../selectors'
import {
  BoardHex,
  BoardHexes,
  GameState,
  GameUnit,
  GameUnits,
  MoveRange,
  StageQueueItem,
} from '../types'
import {
  moveUnit_G,
  updateMovePointsUponMovingOntoMoveGlyph_G,
} from './G-mutators'

export const moveAction: Move<GameState> = (
  { G },
  unit: GameUnit,
  endHex: BoardHex,
  currentMoveRange: MoveRange
) => {
  const { unitID } = unit
  const endHexID = endHex.id
  const endTailHexID = currentMoveRange[endHexID].fromHexID
  const startHex = selectHexForUnit(unitID, G.boardHexes)
  const startTailHex = selectTailHexForUnit(unitID, G.boardHexes)
  const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
  const startHexID = startHex?.id ?? ''
  const startTailHexID = startTailHex?.id ?? ''
  const movePointsLeft = currentMoveRange[endHexID].movePointsLeft
  const movedUnitsCount = uniq(G.unitsMoved).length
  const allowedMoveCount = unitGameCard?.figures ?? 0
  const isAvailableMoveToBeUsed = movedUnitsCount < allowedMoveCount
  const isUnitMoved = G.unitsMoved.includes(unitID)
  const isDisallowedBecauseMaxUnitsMoved =
    !isAvailableMoveToBeUsed && !isUnitMoved
  //! EARLY OUTS
  // DISALLOW - unit card not found
  if (!unitGameCard) {
    console.error(
      `Move action denied: missing needed ingredients to calculate move`
    )
    return
  }
  // DISALLOW - max units moved, cannot move any NEW units, and this unit would be a newly moved unit
  if (isDisallowedBecauseMaxUnitsMoved) {
    console.error(
      `Move action denied:no new units can move, max units have been moved`
    )
    return
  }

  // ALLOW
  // make copies
  const newBoardHexes: BoardHexes = { ...G.boardHexes }
  const newGameUnits: GameUnits = { ...G.gameUnits }
  const newUnitsMoved = [...G.unitsMoved, unitID]
  const unitSingleName = `${unitGameCard.singleName}`
  const unitPlayerID = `${unitGameCard.playerID}`
  let newStageQueue: StageQueueItem[] = []

  // update unit position
  moveUnit_G({
    unitID,
    startHexID,
    endHexID,
    boardHexes: newBoardHexes,
    startTailHexID,
    endTailHexID,
  })
  // consider if moving onto move-glyph
  const glyphOnEndHex = selectGlyphForHex({
    hexID: endHexID,
    glyphs: G.hexMap.glyphs,
  })
  const glyphID = glyphOnEndHex?.glyphID ?? ''
  const isMovingOntoMoveGlyph = glyphID === glyphIDs.move
  if (isMovingOntoMoveGlyph) {
    // update move-points of all the other units for this turn (not the one on the glyph)
    updateMovePointsUponMovingOntoMoveGlyph_G({
      gameCardID: unit.gameCardID,
      unitIdOnGlyph: unitID,
      boardHexes: newBoardHexes,
      gameArmyCards: G.gameArmyCards,
      gameUnits: newGameUnits,
      glyphs: G.hexMap.glyphs,
    })
  }
  // update moving unit's move-points
  newGameUnits[unitID].movePoints = movePointsLeft
  // update game log
  const indexOfThisMove = G.unitsMoved.length
  const moveId = `r${G.currentRound}:om${G.currentOrderMarker}:${unitID}:m${indexOfThisMove}`
  const gameLogForThisMove = encodeGameLogMessage({
    type: 'move',
    id: moveId,
    playerID: unitPlayerID,
    unitID: unitID,
    unitSingleName,
    startHexID,
    endHexID,
    reclaimedGlyphID: glyphID,
  })
  G.gameLog.push(gameLogForThisMove)
  G.stageQueue = newStageQueue
  // update G
  G.boardHexes = { ...newBoardHexes }
  G.gameUnits = { ...newGameUnits }
  G.unitsMoved = newUnitsMoved
  return G
}
