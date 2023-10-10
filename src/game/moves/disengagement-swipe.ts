import type { Move } from 'boardgame.io'
import { selectIfGameArmyCardHasAbility } from '../selector/card-selectors'
import { getActivePlayersIdleStage, stageNames } from '../constants'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import {
  selectGameCardByID,
  selectGlyphForHex,
  selectHexForUnit,
  selectTailHexForUnit,
} from '../selectors'
import { BoardHexes, GameState, GameUnits, StageQueueItem } from '../types'
import {
  killUnit_G,
  moveUnit_G,
  revealGlyph_G,
  updateMovePointsUponMovingOntoMoveGlyph_G,
} from './G-mutators'
import { glyphIDs } from '../glyphs'
import { rollHeroscapeDice } from '../rollHeroscapeDice'

// accept => disengage => wounds last? => falling => wounds => move

// 7 possible paths:
// 1. (2 + 2-move paths) Accept: Fatal or non-fatal, then move unit
// 2. (1 + 2-move paths) Deny: Still swipes to go, or move unit
// 3. (2 paths) 1. falling damage, fatal, set stages, 2. wounds and move-unit
export const takeDisengagementSwipe: Move<GameState> = {
  undoable: false,
  move: (
    { G, events, random },
    { unitID: unitSwipingID, isTaking }: { unitID: string; isTaking: boolean }
  ) => {
    const disengagesAttempting = G.disengagesAttempting
    const fallDamage = disengagesAttempting?.fallDamage ?? 0
    const unitAttemptingToDisengage = disengagesAttempting?.unit
    const unitAttemptingToDisengageHex = selectHexForUnit(
      unitAttemptingToDisengage?.unitID ?? '',
      G.boardHexes
    )
    const unitAttemptingToDisengageTailHex = selectTailHexForUnit(
      unitAttemptingToDisengage?.unitID ?? '',
      G.boardHexes
    )
    const unitAttemptingCard = selectGameCardByID(
      G.gameArmyCards,
      unitAttemptingToDisengage?.gameCardID ?? ''
    )
    const unitSwiping = G.gameUnits[unitSwipingID]
    const unitSwipingCard = selectGameCardByID(
      G.gameArmyCards,
      unitSwiping?.gameCardID ?? ''
    )

    // DISALLOWED
    // state is wrong
    if (
      !disengagesAttempting ||
      !unitAttemptingToDisengage ||
      !unitAttemptingToDisengageHex ||
      !unitAttemptingCard ||
      !unitSwiping ||
      !unitSwipingCard
    ) {
      events.setActivePlayers({
        currentPlayer: stageNames.movement,
      })
      G.disengagesAttempting = undefined
      G.disengagedUnitIds = []
      console.error(
        `Disengagement swipe action denied, no unit attempting, or no card for unit attempting, or no .disengagesAttempting in G`
      )
      return
    }
    if (G.disengagedUnitIds.includes(unitSwipingID)) {
      console.error(
        `Disengagement swipe action denied, this unit has already been disengaged`
      )
      return
    }

    // ALLOWED
    // copied state will be mutated
    let newBoardHexes: BoardHexes = { ...G.boardHexes }
    let newGameUnits: GameUnits = { ...G.gameUnits }
    let newUnitsMoved = [...G.unitsMoved]
    let newStageQueue: StageQueueItem[] = []
    /* 
      Here's the flow:
      1. swipe => wounds => maybe Move
      2. deny => maybe Move
      Move: fall => wounds => kill or move-unit
    */
    const unitDisengagingID = unitAttemptingToDisengage.unitID
    const unitDisengagingPlayerID = unitAttemptingToDisengage.playerID
    const endHexID = disengagesAttempting.endHexID
    const glyphOnEndHex = selectGlyphForHex({
      hexID: endHexID,
      glyphs: G.hexMap.glyphs,
    })
    const isRevealingGlyph = glyphOnEndHex && !glyphOnEndHex.isRevealed
    const isReclaimingGlyph = glyphOnEndHex && glyphOnEndHex.isRevealed
    const glyphID = glyphOnEndHex?.glyphID ?? ''
    const isMovingOntoMoveGlyph = glyphID === glyphIDs.move
    const endTailHexID = disengagesAttempting.endFromHexID
    const isAllEngagementsSettled =
      G.disengagedUnitIds.length >=
      disengagesAttempting.defendersToDisengage.length - 1
    const disengagementDiceRolled = 1
    const skullsRolled = rollHeroscapeDice(
      disengagementDiceRolled,
      random
    ).skulls
    const isAHit = skullsRolled > 0
    const initialLife = unitAttemptingCard.life
    const swipeWounds = isTaking && isAHit ? skullsRolled : 0
    const unitLifeLeft =
      initialLife - (unitAttemptingToDisengage.wounds + swipeWounds)
    const isFatalSwipe = unitLifeLeft <= 0
    const isWarriorSpirit =
      isFatalSwipe &&
      selectIfGameArmyCardHasAbility(
        "Warrior's Attack Spirit 1",
        unitAttemptingCard
      )
    const isArmorSpirit =
      isFatalSwipe &&
      selectIfGameArmyCardHasAbility(
        "Warrior's Armor Spirit 1",
        unitAttemptingCard
      )
    const warriorSpiritActivePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
      activePlayerID: unitDisengagingPlayerID,
      activeStage: stageNames.placingAttackSpirit,
      idleStage: stageNames.idlePlacingAttackSpirit,
    })
    const armorSpiritActivePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
      activePlayerID: unitDisengagingPlayerID,
      activeStage: stageNames.placingArmorSpirit,
      idleStage: stageNames.idlePlacingArmorSpirit,
    })
    if (isTaking) {
      if (isFatalSwipe) {
        killUnit_G({
          boardHexes: newBoardHexes,
          gameArmyCards: G.gameArmyCards,
          killedArmyCards: G.killedArmyCards,
          unitsKilled: G.unitsKilled,
          killedUnits: G.killedUnits,
          gameUnits: newGameUnits,
          unitToKillID: unitDisengagingID,
          killerUnitID: unitSwipingID,
          defenderHexID: unitAttemptingToDisengageHex.id,
          defenderTailHexID: unitAttemptingToDisengageTailHex?.id,
        })
        // and reset disengagement state
        G.disengagesAttempting = undefined
        G.disengagedUnitIds = []
        // update G
        G.boardHexes = { ...newBoardHexes }
        G.gameUnits = { ...newGameUnits }
        // update game log for fatal disengagement
        const indexOfThisDisengage = G.disengagedUnitIds.length
        const id = `r${G.currentRound}:om${G.currentOrderMarker}:${unitSwipingID}:d-fatal-${indexOfThisDisengage}`
        const gameLogForFatalSwipe = encodeGameLogMessage({
          type: gameLogTypes.disengageSwipeFatal,
          id,
          playerID: unitSwipingCard.playerID,
          unitSingleName: unitSwipingCard.singleName,
          defenderUnitName: unitAttemptingCard.name,
          defenderSingleName: unitAttemptingCard.singleName,
          defenderPlayerID: unitAttemptingCard.playerID,
        })
        G.gameLog.push(gameLogForFatalSwipe)
        /* begin stage queue */
        if (isWarriorSpirit) {
          newStageQueue.push({
            playerID: unitDisengagingID,
            stage: stageNames.movement,
          })
          G.stageQueue = newStageQueue
          events.setActivePlayers({
            value: warriorSpiritActivePlayers,
          })
        } else if (isArmorSpirit) {
          newStageQueue.push({
            playerID: unitDisengagingID,
            stage: stageNames.movement,
          })
          G.stageQueue = newStageQueue
          events.setActivePlayers({
            value: armorSpiritActivePlayers,
          })
        } else {
          // no need for queue, just go back to movement
          events.setActivePlayers({
            currentPlayer: stageNames.movement,
          })
          // end the current stage? is this right?
          // events.endStage()
        }
        /* end stage queue */
      } else if (!isFatalSwipe) {
        // assign wounds
        newGameUnits[unitDisengagingID].wounds += swipeWounds
        // update game log for non-fatal disengagement
        const indexOfThisDisengage = G.disengagedUnitIds.length
        const logShortTerm = swipeWounds > 0 ? 'nonfatal' : 'miss'
        const id = `r${G.currentRound}:om${G.currentOrderMarker}:${unitSwipingID}:d-${logShortTerm}-${indexOfThisDisengage}`
        const type =
          swipeWounds > 0
            ? gameLogTypes.disengageSwipeNonFatal
            : gameLogTypes.disengageSwipeMiss
        const gameLogForNonFatalSwipe = encodeGameLogMessage({
          type,
          id,
          playerID: unitSwipingCard.playerID,
          unitName: unitSwipingCard.name,
          unitSingleName: unitSwipingCard.singleName,
          defenderUnitName: unitAttemptingCard.name,
          defenderSingleName: unitAttemptingCard.singleName,
          defenderPlayerID: unitAttemptingCard.playerID,
          wounds: swipeWounds,
          revealedGlyphID: isRevealingGlyph ? glyphID : undefined,
          reclaimedGlyphID: isReclaimingGlyph ? glyphID : undefined,
        })
        G.gameLog.push(gameLogForNonFatalSwipe)
        // is this is the last disengagement-swipe, move the unit, it might fall to death
        if (isAllEngagementsSettled) {
          const fallingDamageWounds = rollHeroscapeDice(
            fallDamage,
            random
          ).skulls
          let isFallFatal = false
          if (fallDamage > 0) {
            isFallFatal = unitLifeLeft - fallingDamageWounds <= 0
            if (isFallFatal) {
              killUnit_G({
                boardHexes: G.boardHexes,
                gameArmyCards: G.gameArmyCards,
                killedArmyCards: G.killedArmyCards,
                unitsKilled: G.unitsKilled,
                killedUnits: G.killedUnits,
                gameUnits: newGameUnits,
                unitToKillID: unitDisengagingID,
                killerUnitID: unitDisengagingID, // falling damage is a unit killing itself
                defenderHexID: unitAttemptingToDisengageHex.id,
                defenderTailHexID: unitAttemptingToDisengageTailHex?.id,
              })
              if (isWarriorSpirit) {
                newStageQueue.push({
                  playerID: unitDisengagingID,
                  stage: stageNames.movement,
                })
                G.stageQueue = newStageQueue
                events.setActivePlayers({
                  value: warriorSpiritActivePlayers,
                })
              } else if (isArmorSpirit) {
                newStageQueue.push({
                  playerID: unitDisengagingID,
                  stage: stageNames.movement,
                })
                G.stageQueue = newStageQueue
                events.setActivePlayers({
                  value: armorSpiritActivePlayers,
                })
              } else {
                // no need for queue, just go back to movement
                events.setActivePlayers({
                  currentPlayer: stageNames.movement,
                })
                // end the current stage? is this necessary?
                events.endStage()
              }
            }
            // if fall is not fatal, assign wounds
            else {
              newGameUnits[unitDisengagingID].wounds += fallingDamageWounds
            }
          }
          if (!isFallFatal) {
            // unit is not dead, move it
            moveUnit_G({
              unitID: unitDisengagingID,
              startHexID: unitAttemptingToDisengageHex.id,
              endHexID,
              boardHexes: newBoardHexes,
              startTailHexID: unitAttemptingToDisengageTailHex?.id,
              endTailHexID,
            })
            newUnitsMoved.push(unitDisengagingID)
            // reveal glyph if necessary
            if (isRevealingGlyph) {
              revealGlyph_G({
                endHexID,
                glyphOnHex: glyphOnEndHex,
                glyphs: G.hexMap.glyphs,
              })
            }
            if (isMovingOntoMoveGlyph) {
              // update move-points of all the other units for this turn (not the one on the glyph)
              updateMovePointsUponMovingOntoMoveGlyph_G({
                gameCardID: unitAttemptingCard.gameCardID,
                unitIdOnGlyph: unitAttemptingToDisengage.unitID,
                boardHexes: newBoardHexes,
                gameArmyCards: G.gameArmyCards,
                glyphs: G.hexMap.glyphs,
                // mutated: gameUnits
                gameUnits: newGameUnits,
              })
            }
            // update unit move-points from move-range
            newGameUnits[unitDisengagingID].movePoints =
              disengagesAttempting.movePointsLeft
          }
          // update G
          G.boardHexes = { ...newBoardHexes }
          G.gameUnits = { ...newGameUnits }
          G.unitsMoved = newUnitsMoved
          // gamelog code copied from move-fall-action
          const indexOfThisMove = G.unitsMoved.length
          const moveId = `r${G.currentRound}:om${G.currentOrderMarker}:${unitDisengagingID}:m${indexOfThisMove}`
          const gameLogForThisMove = encodeGameLogMessage({
            type: gameLogTypes.move,
            id: moveId,
            playerID: unitDisengagingPlayerID,
            unitID: unitDisengagingID,
            unitSingleName: unitAttemptingCard.singleName,
            endHexID,
            fallDamage: fallDamage,
            wounds: fallingDamageWounds,
            isFatal: isFallFatal,
            revealedGlyphID: isRevealingGlyph ? glyphID : undefined,
            reclaimedGlyphID: isReclaimingGlyph ? glyphID : undefined,
          })
          G.gameLog.push(gameLogForThisMove)
          // send players back to movement/idle stages
          events.setActivePlayers({
            currentPlayer: stageNames.movement,
          })
          // end the current stage? is this necessary?
          events.endStage()
          // finally, clear disengagement state
          G.disengagesAttempting = undefined
          G.disengagedUnitIds = []
        } else {
          // ENGAGEMENTS NOT SETTLED
          // add to G.disengagedUnitIds
          G.disengagedUnitIds.push(unitSwiping.unitID)
        }
      }
    }

    if (!isTaking) {
      // update game log for non-fatal disengagement
      const indexOfThisDisengage = G.disengagedUnitIds.length
      const id = `r${G.currentRound}:om${G.currentOrderMarker}:${unitSwipingID}:d-deny-${indexOfThisDisengage}`
      const gameLogForDeniedSwipe = encodeGameLogMessage({
        type: gameLogTypes.disengageSwipeDenied,
        id,
        playerID: unitSwiping.playerID,
        unitSingleName: unitSwipingCard.singleName,
        defenderPlayerID: unitDisengagingPlayerID,
      })
      G.gameLog.push(gameLogForDeniedSwipe)
      if (isAllEngagementsSettled) {
        const fallingDamageWounds = rollHeroscapeDice(fallDamage, random).skulls
        let isFallFatal = false
        if (fallDamage > 0) {
          isFallFatal = unitLifeLeft - fallingDamageWounds <= 0
          if (isFallFatal) {
            killUnit_G({
              boardHexes: G.boardHexes,
              gameArmyCards: G.gameArmyCards,
              killedArmyCards: G.killedArmyCards,
              unitsKilled: G.unitsKilled,
              killedUnits: G.killedUnits,
              gameUnits: newGameUnits,
              unitToKillID: unitDisengagingID,
              killerUnitID: unitDisengagingID, // falling damage is a unit killing itself
              defenderHexID: unitAttemptingToDisengageHex.id,
              defenderTailHexID: unitAttemptingToDisengageTailHex?.id,
            })
            /* begin stage queue */
            if (isWarriorSpirit) {
              newStageQueue.push({
                playerID: unitDisengagingID,
                stage: stageNames.movement,
              })
              G.stageQueue = newStageQueue
              events.setActivePlayers({
                value: warriorSpiritActivePlayers,
              })
            } else if (isArmorSpirit) {
              newStageQueue.push({
                playerID: unitDisengagingID,
                stage: stageNames.movement,
              })
              G.stageQueue = newStageQueue
              events.setActivePlayers({
                value: armorSpiritActivePlayers,
              })
            } else {
              // no need for queue, just go back to movement
              events.setActivePlayers({
                currentPlayer: stageNames.movement,
              })
              // end the current stage? is this necessary?
              // events.endStage()
            }
            /* end stage queue */
          }
          // if fall is not fatal, assign wounds
          else {
            newGameUnits[unitDisengagingID].wounds += fallingDamageWounds
          }
        }
        if (!isFallFatal) {
          moveUnit_G({
            unitID: unitDisengagingID,
            boardHexes: newBoardHexes,
            startHexID: unitAttemptingToDisengageHex.id,
            startTailHexID: unitAttemptingToDisengageTailHex?.id,
            endHexID,
            endTailHexID,
          })
          newUnitsMoved.push(unitDisengagingID)

          // reveal glyph if necessary
          if (isRevealingGlyph) {
            revealGlyph_G({
              endHexID,
              glyphOnHex: glyphOnEndHex,
              glyphs: G.hexMap.glyphs,
            })
          }
          if (isMovingOntoMoveGlyph) {
            // update move-points of all the other units for this turn (not the one on the glyph)
            updateMovePointsUponMovingOntoMoveGlyph_G({
              gameCardID: unitAttemptingCard.gameCardID,
              unitIdOnGlyph: unitAttemptingToDisengage.unitID,
              boardHexes: newBoardHexes,
              gameArmyCards: G.gameArmyCards,
              glyphs: G.hexMap.glyphs,
              // mutated: gameUnits
              gameUnits: newGameUnits,
            })
          }
          // update unit move-points from move-range
          newGameUnits[unitDisengagingID].movePoints =
            disengagesAttempting.movePointsLeft
        }

        // update G
        G.boardHexes = { ...newBoardHexes }
        G.gameUnits = { ...newGameUnits }
        G.unitsMoved = newUnitsMoved

        // copied from move-fall-action
        const indexOfThisMove = G.unitsMoved.length
        const moveId = `r${G.currentRound}:om${G.currentOrderMarker}:${unitDisengagingID}:m${indexOfThisMove}`
        const gameLogForThisMove = encodeGameLogMessage({
          type: gameLogTypes.move,
          id: moveId,
          playerID: unitDisengagingPlayerID,
          unitID: unitDisengagingID,
          unitSingleName: unitAttemptingCard.singleName,
          endHexID,
          fallDamage: fallDamage,
          wounds: fallingDamageWounds,
          isFatal: isFallFatal,
          revealedGlyphID: isRevealingGlyph ? glyphID : undefined,
          reclaimedGlyphID: isReclaimingGlyph ? glyphID : undefined,
        })
        G.gameLog.push(gameLogForThisMove)
        /* END MOVE */
        // send players back to movement/idle stages
        events.setActivePlayers({
          currentPlayer: stageNames.movement,
        })
        // end the current stage? is this necessary?
        events.endStage()
        // finally, clear disengagement state
        G.disengagesAttempting = undefined
        G.disengagedUnitIds = []
      } else {
        // ENGAGEMENTS NOT SETTLED
        // add to G.disengagedUnitIds
        G.disengagedUnitIds.push(unitSwiping.unitID)
      }
    }
  },
}
