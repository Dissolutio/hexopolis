import { Ctx, Game } from 'boardgame.io'
import { TurnOrder, PlayerView } from 'boardgame.io/core'

import { selectUnitsForCard, selectUnrevealedGameCard } from './selectors'
import {
  GameState,
  OrderMarker,
  GameUnit,
  StageQueueItem,
  TheDropRoll,
} from './types'
import { moves } from './moves/moves'
import { rollD20Initiative } from './rollInitiative'
import { gameSetupInitialGameState } from './setup/setup'
import { encodeGameLogMessage, gameLogTypes } from './gamelog'
import {
  phaseNames,
  stageNames,
  OM_COUNT,
  generateBlankOrderMarkersForNumPlayers,
  generateBlankPlayersOrderMarkers,
  generateReadyStateForNumPlayers,
  getActivePlayersIdleStage,
  generateBlankPlayersStateForNumPlayers,
} from './constants'
import { assignCardMovePointsToUnit_G } from './moves/G-mutators'
import { selectIfGameArmyCardHasAbility } from './selector/card-selectors'
import { scenarioNames } from './setup/scenarios'

const isDevOverrideState =
  process.env.NODE_ENV === 'production'
    ? false
    : // toggle this one to test the game with pre-placed units
      true
// false

export const Hexoscape: Game<GameState> = {
  name: 'Hexoscape',
  // setup: Function that returns the initial value of G.
  // setupData is an optional custom object that is
  // passed through the Game Creation API, currently in useMultiplayerLobby.tsx.handleCreateMatch()
  setup: (ctx, setupData) => {
    const isLocalOrDemoGame = setupData === undefined
    const computeScenarioName = () => {
      // scenario-name can be passed from multiplayer lobby, otherwise we determine here which scenario-name to pass
      if (isLocalOrDemoGame) {
        if (ctx.ctx.numPlayers === 2) {
          if (process.env.NODE_ENV === 'development') {
            // DEV: change this to change 2 player local game
            return scenarioNames.clashingFrontsAtTableOfTheGiants2
            // return scenarioNames.forsakenWaters2
            // return scenarioNames.theBigHexagon2
            // return scenarioNames.makeMoveRange1HexWalkScenario
            // return scenarioNames.makeMoveRange2HexWalkScenario
            // return scenarioNames.makeMoveRangePassThruScenario
            // return scenarioNames.makeMoveRange1HexFlyEngagedScenario
            // return scenarioNames.makeMoveRange1HexFlyEngagedStealthScenario
            // return scenarioNames.makeMoveRange1HexFlyScenario
            // return scenarioNames.makeMoveRange2HexFlyScenario
            // return scenarioNames.makeMoveRange2HexFlyEngagedScenario
          } else {
            // the online 2 player demo scenario:
            return scenarioNames.clashingFrontsAtTableOfTheGiants2
          }
        }
        // gameSetupInitialGameState will return a default setup if we return empty string here
        return ''
      }
      return setupData?.scenarioName ?? ''
    }
    const scenarioName = computeScenarioName()
    return gameSetupInitialGameState({
      // numPlayers is decided either by createMatch, or what was passed to Bgio-Client (for local and demo games)
      numPlayers: setupData?.numPlayers || ctx.ctx.numPlayers,
      scenarioName,
      withPrePlacedUnits: isDevOverrideState,
      isLocalOrDemoGame,
    })
  },
  /*  validateSetupData -- Optional function to validate the setupData before matches are created. If this returns a value, an error will be reported to the user and match creation is aborted:
  validateSetupData: (setupData, numPlayers) => 'setupData is not valid!',
  */
  moves,
  seed: `${Math.random()}`,
  // The minimum and maximum number of players supported (this is only enforced when using the Lobby server component)
  minPlayers: 2,
  maxPlayers: 6,
  playerView: PlayerView.STRIP_SECRETS,
  phases: {
    //PHASE: DRAFT AND PLACE UNITS
    [phaseNames.draft]: {
      start: true,
      // all players may make moves and place their units
      onBegin: ({ G, ctx }) => {
        const playerIDs = Object.keys(G.players)
        const initiativeRoll = rollD20Initiative(playerIDs)
        // DEV: can make it so a certain player is first, etc.
        // if (process.env.NODE_ENV === 'test') {
        //   G.initiative = ['1', '0']
        // } else {
        //   G.initiative = initiativeRoll.initiative
        // }
        G.initiative = initiativeRoll.initiative
        // TODO: add gamelog of draft begin
        // const draftBeginGameLog = encodeGameLogMessage({
        //   type: gameLogTypes.roundBegin,
        //   id: `draftBegin`,
        //   initiativeRolls: initiativeRoll.rolls,
        // })
        // G.gameLog = [...G.gameLog, draftBeginGameLog]
      },
      turn: {
        // d20 roll-offs for initiative
        order: TurnOrder.CUSTOM_FROM('initiative'),
        activePlayers: {
          currentPlayer: stageNames.pickingUnits,
        },
        onBegin: ({ G, ctx, events }) => {
          // if player is already done drafting, skip their turn
          if (G.draftReady[ctx.currentPlayer] === true) {
            events.endTurn()
          }
        },
        onEnd: ({ G, ctx }) => {
          G.cardsDraftedThisTurn = []
        },
      },
      // Everybody picking at the same time, below, but undo does not work!
      // turn: {
      //   activePlayers: {
      //     all: stageNames.pickingUnits,
      //   },
      // },
      // once all players have placed their units and confirmed ready, the order marker stage will begin
      endIf: ({ G, ctx }) => {
        return checkReady('draftReady', G, ctx)
      },
      next: phaseNames.placement,
    },
    // PHASE: PLACEMENT
    [phaseNames.placement]: {
      // all players may make moves and place their units
      turn: {
        activePlayers: {
          all: stageNames.placingUnits,
        },
      },
      onEnd: ({ G, ctx }) => {
        const playerIDsWithActiveTheDrop = Object.keys(G.players).filter(
          (id) => {
            // players who already used The Drop cannot use it again
            if (G.theDropUsed.includes(id)) return false
            const armyCards = G.gameArmyCards.filter((c) => c.playerID === id)
            return armyCards.some((c) =>
              selectIfGameArmyCardHasAbility('The Drop', c)
            )
          }
        )
        if (playerIDsWithActiveTheDrop.length > 0) {
          // we initialise the drop result to an empty object here, so that we can check if it's empty in the next phase's onBegin hook (all because the onBegin hook is oddly called AFTER the onEnd hook)
          G.theDropResult = {}
        }
      },
      // once all players have placed their units and confirmed ready, the order marker stage will begin
      endIf: ({ G, ctx }) => {
        return checkReady('placementReady', G, ctx)
      },
      next: phaseNames.beforePlaceOrderMarkers,
    },
    //PHASE: ORDER-MARKERS (+ the drop)
    [phaseNames.beforePlaceOrderMarkers]: {
      turn: {
        onBegin: ({ G, events, random }) => {
          // we cannot use the onBegin hook for the phase, so we do it here: before order markers are placed, we can check to see who needs to use The Drop
          const playerIDsWithActiveTheDrop = Object.keys(G.players).filter(
            (id) => {
              const armyCards = G.gameArmyCards.filter((c) => c.playerID === id)
              return armyCards.some((c) => {
                // players (their cards really) who already used The Drop cannot use it again
                if (G.theDropUsed.includes(c.gameCardID)) return false
                return selectIfGameArmyCardHasAbility('The Drop', c)
              })
            }
          )
          const threshold = 13
          const rolls = playerIDsWithActiveTheDrop.map((id) => random.Die(20))
          const newDropResult: { [playerID: string]: TheDropRoll } =
            playerIDsWithActiveTheDrop.reduce((acc, id, i) => {
              return {
                ...acc,
                [id]: {
                  playerID: id,
                  roll: rolls[i],
                  threshold,
                  isSuccessful: rolls[i] >= threshold,
                },
              }
            }, {})
          G.theDropResult = newDropResult
          Object.values(newDropResult).forEach((result) => {
            const gameLog = encodeGameLogMessage({
              type: gameLogTypes.theDropRoll,
              id: `${G.currentRound}:theDrop:p${result.playerID}`,
              playerID: result.playerID,
              roll: result.roll,
              rollThreshold: threshold,
              isRollSuccessful: result.isSuccessful,
            })
            G.gameLog = [...G.gameLog, gameLog]
          })
          const playersIDsToUseTheDrop = playerIDsWithActiveTheDrop.filter(
            (id, i) => rolls[i] >= threshold
          )
          const orderOfDropStages =
            rollD20Initiative(playersIDsToUseTheDrop)?.initiative ?? []
          const playerDropStagesForQueue = orderOfDropStages.map(
            (playerID) => ({
              stage: stageNames.theDrop,
              playerID,
            })
          )
          let newStageQueue: StageQueueItem[] = [...playerDropStagesForQueue]
          const nextStage = newStageQueue.shift()
          G.stageQueue = newStageQueue
          if (nextStage) {
            const activePlayers = getActivePlayersIdleStage({
              gamePlayerIDs: Object.keys(G.players),
              activePlayerID: nextStage.playerID,
              activeStage: stageNames.theDrop,
              idleStage: stageNames.idleTheDrop,
            })
            events.setActivePlayers({ value: activePlayers })
          } else {
            events.endPhase()
          }
        },
        // all players may make moves and place their order markers (order markers are hidden from other players via the bgio player-state API)
        activePlayers: {
          all: stageNames.placeOrderMarkers,
        },
      },
      onEnd: ({ G, ctx }) => {
        // clear the drop result, it was initialised to an empty object by placement.onEnd
        G.theDropResult = undefined
      },
      // proceed to order-markers if no players have pre-order marker abilities
      endIf: ({ G }) => {
        const playerIDsWithActiveTheDrop = Object.keys(G.players).filter(
          (id) => {
            // players (their card, really) who already used The Drop cannot use it again
            if (G.theDropUsed.includes(id)) return false
            const armyCards = G.gameArmyCards.filter((c) => c.playerID === id)
            return armyCards.some((c) =>
              selectIfGameArmyCardHasAbility('The Drop', c)
            )
          }
        )
        return (
          // we need to run this check here because endIf is called before onBegin, so if we keep the phase from ending, then onBegin will fire and players can Drop/ adjust their order markers
          playerIDsWithActiveTheDrop.length <= 0
        )
      },
      next: phaseNames.placeOrderMarkers,
    },
    [phaseNames.placeOrderMarkers]: {
      // reset order-markers state
      onBegin: ({ G, ctx }) => {
        // bypassing first-round-reset allows you to customize initial game state, for development
        if (G.currentRound > 1) {
          // clear secret order marker state
          G.players = generateBlankPlayersStateForNumPlayers(ctx.numPlayers)
          // clear public order marker state
          G.orderMarkers = generateBlankOrderMarkersForNumPlayers(
            ctx.numPlayers
          )
          G.orderMarkersReady = generateReadyStateForNumPlayers(
            ctx.numPlayers,
            false
          )
        }
      },
      turn: {
        // all players may make moves and place their order markers (order markers are hidden from other players via the bgio player-state API)
        activePlayers: {
          all: stageNames.placeOrderMarkers,
        },
      },
      // proceed to round-of-play once all players are ready
      endIf: ({ G, ctx }) => {
        // const playerIDsWithActiveTheDrop = Object.keys(G.players).filter(
        //   (id) => {
        //     // players who already used The Drop cannot use it again
        //     if (G.theDropUsed.includes(id)) return false
        //     const armyCards = G.gameArmyCards.filter((c) => c.playerID === id)
        //     return armyCards.some((c) =>
        //       selectIfGameArmyCardHasAbility('The Drop', c)
        //     )
        //   }
        // )
        return (
          // we need to run this check here because endIf is called before onBegin, so if we keep the phase from ending, then onBegin will fire and players can Drop/ adjust their order markers
          // playerIDsWithActiveTheDrop.length <= 0 &&
          checkReady('orderMarkersReady', G, ctx)
        )
      },
      // setup unrevealed public order-markers
      onEnd: ({ G }) => {
        // setup unrevealed public order-markers state by copying over the private order-markers state: remove the order number (which is not public yet), but leave the gameCardID (which is public)
        G.orderMarkers = Object.keys(G.players).reduce(
          (orderMarkers, playerID) => {
            return {
              ...orderMarkers,
              [playerID]: Object.values(G.players[playerID].orderMarkers).map(
                (om) => ({ gameCardID: om, order: '' })
              ),
            }
          },
          {}
        )
      },
      next: phaseNames.roundOfPlay,
    },
    //PHASE-ROUND OF PLAY -
    [phaseNames.roundOfPlay]: {
      // roll initiative
      onBegin: ({ G, ctx }) => {
        const playerIDs = Object.keys(G.players)
        const initiativeRoll = rollD20Initiative(playerIDs)
        // TODO gamelog initiative roll
        const roundBeginGameLog = encodeGameLogMessage({
          type: gameLogTypes.roundBegin,
          id: `${G.currentRound}`,
          playerID: '',
          initiativeRolls: initiativeRoll.rolls,
        })
        if (process.env.NODE_ENV === 'test') {
          // enable pre-determined initiative in tests
          G.initiative = ['1', '0']
        } else {
          G.initiative = initiativeRoll.initiative
        }
        G.currentOrderMarker = 0
        G.gameLog = [...G.gameLog, roundBeginGameLog]
      },
      // reset state, update currentRound
      onEnd: ({ G, ctx }) => {
        G.orderMarkersReady = generateReadyStateForNumPlayers(
          ctx.numPlayers,
          false
        )
        G.currentOrderMarker = 0
        G.currentRound += 1
      },
      // turn -- roll initiative, reveal order marker, assign move-points/move-ranges, update currentOrderMarker, end round after last turn
      turn: {
        // d20 roll-offs for initiative
        order: TurnOrder.CUSTOM_FROM('initiative'),
        activePlayers: {
          currentPlayer: stageNames.movement,
        },
        // reveal order marker, assign move-points/move-ranges to eligible units
        onBegin: ({ G, ctx, events }) => {
          // Reveal order marker
          const currentPlayersOrderMarkers =
            G.players[ctx.currentPlayer].orderMarkers
          const revealedGameCardID =
            currentPlayersOrderMarkers[G.currentOrderMarker.toString()]
          const revealedGameCardUnits = Object.values(G.gameUnits).filter(
            (u: GameUnit) => u?.gameCardID === revealedGameCardID
          )
          const isRevealedGameCardCompletelyOutOfUnits =
            revealedGameCardUnits.length === 0
          const indexToReveal = G.orderMarkers[ctx.currentPlayer].findIndex(
            (om: OrderMarker) =>
              om.gameCardID === revealedGameCardID && om.order === ''
          )
          if (indexToReveal >= 0) {
            G.orderMarkers[ctx.currentPlayer][indexToReveal].order =
              G.currentOrderMarker.toString()
          }
          // Assign move points
          const unrevealedGameCard = selectUnrevealedGameCard(
            currentPlayersOrderMarkers,
            G.gameArmyCards,
            G.currentOrderMarker
          )
          const currentTurnUnits = selectUnitsForCard(
            unrevealedGameCard?.gameCardID ?? '',
            G.gameUnits
          )
          // loop thru this turns units
          currentTurnUnits.length &&
            currentTurnUnits.forEach((unit: GameUnit) => {
              const { unitID } = unit
              // G mutator
              assignCardMovePointsToUnit_G({
                boardHexes: G.boardHexes,
                gameArmyCards: G.gameArmyCards,
                glyphs: G.hexMap.glyphs,
                gameUnits: G.gameUnits,
                unitID,
              })
            })

          // finally, reset state for the turn about to be taken
          G.unitsMoved = []
          G.unitsAttacked = {}
          G.chompsAttempted = []
          G.mindShacklesAttempted = []
          G.grenadesThrown = []
          G.berserkerChargeRoll = undefined
          G.berserkerChargeSuccessCount = 0
          // if no units, end turn
          if (isRevealedGameCardCompletelyOutOfUnits) {
            const revealedGameCard = G.gameArmyCards.find(
              (gc) => gc.gameCardID === revealedGameCardID
            )
            const isNoCard = revealedGameCard === undefined
            const id = `r${G.currentRound}:om${G.currentOrderMarker}:p${ctx.currentPlayer}:${revealedGameCardID}:no-units-end-turn`
            const gameLogForNoUnitsOnTurn = encodeGameLogMessage({
              type: gameLogTypes.noUnitsOnTurn,
              id,
              playerID: ctx.currentPlayer,
              unitName: revealedGameCard?.name ?? '',
              isNoCard,
              currentOrderMarker: `${G.currentOrderMarker}`,
            })
            G.gameLog = [...G.gameLog, gameLogForNoUnitsOnTurn]
            events.endTurn()
          }
        },
        // clear move-points,  update currentOrderMarker, end round after last turn (go to place order-markers)
        onEnd: ({ G, ctx, events }) => {
          // if any card threw grenades, mark them as used
          ;[...new Set(G.grenadesThrown)].forEach((cardID) => {
            const indexToUpdate = G.gameArmyCards.findIndex(
              (card) => card.gameCardID === cardID
            )
            G.gameArmyCards[indexToUpdate].hasThrownGrenade = true
          })
          // reset unit move-points
          Object.keys(G.gameUnits).forEach((uid) => {
            G.gameUnits[uid].movePoints = 0
          })
          const isLastTurn = ctx.playOrderPos === ctx.numPlayers - 1
          const isLastOrderMarker = G.currentOrderMarker >= OM_COUNT - 1
          // update currentOrderMarker
          if (isLastTurn && !isLastOrderMarker) {
            G.currentOrderMarker++
          }
          // end the RoundOfPlay phase after last turn
          if (isLastTurn && isLastOrderMarker) {
            events.setPhase(phaseNames.beforePlaceOrderMarkers)
          }
        },
      },
    },
  },
  events: {
    endGame: false,
  },
  // Ends the game if this returns anything.
  // The return value is available in `ctx.gameover`.
  endIf: ({ G, ctx }) => {
    if (ctx.phase === phaseNames.placement || ctx.phase === phaseNames.draft) {
      return false
    }
    const gameUnitsArr = Object.values(G.gameUnits)
    const firstPlayerID = gameUnitsArr[0].playerID
    const allUnitsAreOfSamePlayer = gameUnitsArr.every(
      (u) => u.playerID === firstPlayerID
    )
    if (allUnitsAreOfSamePlayer) {
      return { winner: firstPlayerID }
    } else {
      return false
    }
  },
  // Called at the end of the game.
  // `ctx.gameover` is available at this point.
  onEnd: ({ G, ctx }) => {
    const winner = ctx.gameover.winner === '0' ? 'BEES' : 'BUTTERFLIES'
    console.log(`THE ${winner} WON!`)
  },
}

const checkReady = (key: string, G: GameState, ctx: Ctx) => {
  const arr: any[] = new Array(ctx.numPlayers).fill(false)
  for (let i = 0; i < ctx.numPlayers; i++) {
    // i.e. G.ready['0'] = [true, false, false]
    arr[i] = Boolean((G as any)?.[key]?.[i])
  }
  return arr.every((v) => v === true)
}
