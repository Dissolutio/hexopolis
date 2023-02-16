import { Move } from 'boardgame.io'
import {
  getActivePlayersIdleStage,
  stageNames,
  transformMoveRangeToArraysOfIds,
} from '../constants'
import { uniq } from 'lodash'
import { encodeGameLogMessage } from '../gamelog'
import {
  selectGameCardByID,
  selectHexForUnit,
  selectRevealedGameCard,
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
import { rollHeroscapeDice } from './attack-action'
import { selectIfGameArmyCardHasAbility } from 'game/selector/card-selectors'
import { killUnit_G } from './G-mutators'

export const moveAction: Move<GameState> = {
  undoable: ({ G, ctx }) => true,
  move: (
    { G, ctx, events, random },
    unit: GameUnit,
    endHex: BoardHex,
    currentMoveRange: MoveRange
  ) => {
    const { unitID } = unit
    const endHexID = endHex.id
    const endTailHexID = currentMoveRange[endHexID].fromHexID
    const fallDamage = currentMoveRange[endHexID].fallDamage
    const startHex = selectHexForUnit(unitID, G.boardHexes)
    const startTailHex = selectTailHexForUnit(unitID, G.boardHexes)
    const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const startHexID = startHex?.id ?? ''
    const startTailHexID = startTailHex?.id ?? ''
    const movePointsLeft = currentMoveRange[endHexID].movePointsLeft
    const revealedGameCard = selectRevealedGameCard(
      G.orderMarkers,
      G.gameArmyCards,
      G.currentOrderMarker,
      ctx.currentPlayer
    )
    const movedUnitsCount = uniq(G.unitsMoved).length
    const allowedMoveCount = revealedGameCard?.figures ?? 0

    const isAvailableMoveToBeUsed = movedUnitsCount < allowedMoveCount
    const isUnitMoved = G.unitsMoved.includes(unitID)
    const isDisallowedBecauseMaxUnitsMoved =
      !isAvailableMoveToBeUsed && !isUnitMoved
    //! EARLY OUTS
    // DISALLOW - move not in move range
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
    // while making copies, update moved units counter
    const newUnitsMoved = [...G.unitsMoved, unitID]
    const unitSingleName = `${unitGameCard.singleName}`
    const unitPlayerID = `${unitGameCard.playerID}`
    const unitLife = unitGameCard.life - unit.wounds
    let newStageQueue: StageQueueItem[] = []
    let fallingDamageWounds = 0
    let isFatal = false

    // 1. They fall, and die or take wounds
    if (fallDamage) {
      const { skulls } = rollHeroscapeDice(fallDamage, random)
      // mutation
      fallingDamageWounds = skulls
      isFatal = skulls >= unitLife
      // 1.A kill the unit
      if (isFatal) {
        const isWarriorSpirit = selectIfGameArmyCardHasAbility(
          "Warrior's Attack Spirit 1",
          unitGameCard
        )
        const isArmorSpirit = selectIfGameArmyCardHasAbility(
          "Warrior's Armor Spirit 1",
          unitGameCard
        )
        killUnit_G({
          boardHexes: G.boardHexes,
          gameArmyCards: G.gameArmyCards,
          killedArmyCards: G.killedArmyCards,
          unitsKilled: G.unitsKilled,
          killedUnits: G.killedUnits,
          gameUnits: G.gameUnits,
          unitToKillID: unitID,
          killerUnitID: unitID,
          defenderHexID: startHexID,
          defenderTailHexID: startTailHexID,
        })
        if (isWarriorSpirit) {
          // TODO: we could add this only if they have moves left
          // mark this so after placing spirit we can get back to moving (or ending turn if we're out of moves)
          newStageQueue.push({
            playerID: unit.playerID,
            stage: stageNames.movement,
          })
          const activePlayers = getActivePlayersIdleStage({
            activePlayerID: unitGameCard.playerID,
            activeStage: stageNames.placingAttackSpirit,
            idleStage: stageNames.idlePlacingAttackSpirit,
          })
          events.setActivePlayers({
            value: activePlayers,
          })
        }

        if (isArmorSpirit) {
          // TODO: we could add this only if they have moves left
          // mark this so after placing spirit we can get back to moving (or ending turn if we're out of moves)
          newStageQueue.push({
            playerID: unit.playerID,
            stage: stageNames.movement,
          })

          const activePlayers = getActivePlayersIdleStage({
            activePlayerID: unitGameCard.playerID,
            activeStage: stageNames.placingArmorSpirit,
            idleStage: stageNames.idlePlacingArmorSpirit,
          })
          events.setActivePlayers({
            value: activePlayers,
          })
        }
      }
      // 1.B they take wounds
      else {
        newGameUnits[unitID].wounds += skulls
      }
    }

    // 2. Move the unit if not fatal
    // update unit position
    if (!isFatal) {
      if (unit.is2Hex && startTailHexID) {
        // remove from old
        newBoardHexes[startHexID].occupyingUnitID = ''
        newBoardHexes[startTailHexID].occupyingUnitID = ''
        newBoardHexes[startTailHexID].isUnitTail = false
        // add to new
        newBoardHexes[endHexID].occupyingUnitID = unitID
        newBoardHexes[endTailHexID].occupyingUnitID = unitID
        newBoardHexes[endTailHexID].isUnitTail = true
      } else {
        // remove from old
        newBoardHexes[startHexID].occupyingUnitID = ''
        // add to new
        newBoardHexes[endHexID].occupyingUnitID = unitID
      }
      // update unit move-points
      newGameUnits[unitID].movePoints = movePointsLeft
    }
    // update game log
    const indexOfThisMove = G.unitsMoved.length
    const moveId = `r${G.currentRound}:om${G.currentOrderMarker}:${unitID}:m${indexOfThisMove}`
    const gameLogForThisMove = encodeGameLogMessage({
      type: 'move',
      id: moveId,
      playerID: revealedGameCard?.playerID ?? '',
      unitID: unitID,
      unitSingleName: revealedGameCard?.singleName ?? '',
      startHexID,
      endHexID,
      wounds: fallingDamageWounds,
      isFatal,
    })
    G.gameLog.push(gameLogForThisMove)
    G.stageQueue = newStageQueue
    // update G
    G.boardHexes = { ...newBoardHexes }
    G.gameUnits = { ...newGameUnits }
    G.unitsMoved = newUnitsMoved
    return G
  },
}
