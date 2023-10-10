import { Move } from 'boardgame.io'
import { getActivePlayersIdleStage, stageNames } from '../constants'
import { uniq } from 'lodash'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
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
import { selectIfGameArmyCardHasAbility } from '../selector/card-selectors'
import {
  killUnit_G,
  moveUnit_G,
  revealGlyph_G,
  updateMovePointsUponMovingOntoMoveGlyph_G,
} from './G-mutators'
import { glyphIDs } from '../glyphs'
import { rollHeroscapeDice } from '../rollHeroscapeDice'

export const noUndoMoveAction: Move<GameState> = {
  undoable: false,
  move: (
    { G, events, random },
    unit: GameUnit,
    endHex: BoardHex,
    currentMoveRange: MoveRange
  ) => {
    const { unitID } = unit
    const endHexID = endHex.id
    const endTailHexID = currentMoveRange[endHexID].fromHexID
    const fallDamage = currentMoveRange[endHexID]?.fallDamage ?? 0
    const glyphOnHex = selectGlyphForHex({
      hexID: endHexID,
      glyphs: G.hexMap.glyphs,
    })
    const isMovingOntoMoveGlyph = glyphOnHex?.glyphID === glyphIDs.move
    const isGlyphOnHexUnrevealed = !glyphOnHex?.isRevealed
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
    const newGlyphs = { ...G.hexMap.glyphs }
    const newBoardHexes: BoardHexes = { ...G.boardHexes }
    const newGameUnits: GameUnits = { ...G.gameUnits }
    const unitSingleName = `${unitGameCard.singleName}`
    const unitPlayerID = `${unitGameCard.playerID}`
    const unitLife = unitGameCard.life - unit.wounds
    let newStageQueue: StageQueueItem[] = []
    // falling wounds initializes as 0, but may be more, so these get mutated
    let fallingDamageWounds = 0
    let isFatal = false

    // 1. They fall, and die or take wounds
    if (fallDamage > 0) {
      fallingDamageWounds = rollHeroscapeDice(fallDamage, random).skulls
      isFatal = fallingDamageWounds >= unitLife
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
          gameUnits: newGameUnits,
          unitToKillID: unitID,
          killerUnitID: unitID, // falling damage is a unit killing itself
          defenderHexID: startHexID,
          defenderTailHexID: startTailHexID,
        })
        if (isWarriorSpirit) {
          // mark this so after placing spirit we can get back to moving (or ending turn if we're out of moves)
          newStageQueue.push({
            playerID: unit.playerID,
            stage: stageNames.movement,
          })
          const activePlayers = getActivePlayersIdleStage({
            gamePlayerIDs: Object.keys(G.players),
            activePlayerID: unitGameCard.playerID,
            activeStage: stageNames.placingAttackSpirit,
            idleStage: stageNames.idlePlacingAttackSpirit,
          })
          events.setActivePlayers({
            value: activePlayers,
          })
        }
        if (isArmorSpirit) {
          // mark this so after placing spirit we can get back to moving (or ending turn if we're out of moves)
          newStageQueue.push({
            playerID: unit.playerID,
            stage: stageNames.movement,
          })

          const activePlayers = getActivePlayersIdleStage({
            gamePlayerIDs: Object.keys(G.players),
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
        newGameUnits[unitID].wounds += fallingDamageWounds
      }
    }

    // 2. Move the unit if it didn't die
    // update unit position
    if (!isFatal) {
      moveUnit_G({
        unitID,
        startHexID,
        endHexID,
        boardHexes: newBoardHexes,
        startTailHexID,
        endTailHexID,
      })
      // update unit move-points
      newGameUnits[unitID].movePoints = movePointsLeft
      // Reveal or activate glyph on hex
      if (glyphOnHex) {
        revealGlyph_G({
          endHexID: endHexID,
          glyphOnHex: glyphOnHex,
          // mutated: glyphs
          glyphs: G.hexMap.glyphs,
        })
      }
      if (isMovingOntoMoveGlyph) {
        // update move-points of all the other units for this turn (not the one on the glyph)
        updateMovePointsUponMovingOntoMoveGlyph_G({
          gameCardID: unit.gameCardID,
          unitIdOnGlyph: unitID,
          boardHexes: newBoardHexes,
          gameArmyCards: G.gameArmyCards,
          glyphs: G.hexMap.glyphs,
          // mutated: gameUnits
          gameUnits: newGameUnits,
        })
      }
    }
    // update game log
    const indexOfThisMove = G.unitsMoved.length
    const moveId = `r${G.currentRound}:om${G.currentOrderMarker}:${unitID}:m${indexOfThisMove}`
    const gameLogForThisMove = encodeGameLogMessage({
      type: gameLogTypes.move,
      id: moveId,
      playerID: unitPlayerID,
      unitID: unitID,
      unitSingleName,
      startHexID,
      endHexID,
      fallDamage: fallDamage,
      wounds: fallingDamageWounds,
      isFatal,
      revealedGlyphID:
        !isFatal && isGlyphOnHexUnrevealed ? glyphOnHex?.glyphID ?? '' : '',
      reclaimedGlyphID: !isFatal ? glyphOnHex?.glyphID ?? '' : '',
    })
    G.gameLog.push(gameLogForThisMove)
    G.stageQueue = newStageQueue
    // update G
    G.boardHexes = { ...newBoardHexes }
    G.gameUnits = { ...newGameUnits }
    G.unitsMoved = [...G.unitsMoved, unitID]
    return G
  },
}
