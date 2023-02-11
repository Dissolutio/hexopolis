import { Game } from 'boardgame.io'
import { TurnOrder, PlayerView } from 'boardgame.io/core'

import { selectUnitsForCard, selectUnrevealedGameCard } from './selectors'
import { GameState, OrderMarker, GameUnit } from './types'
import { moves } from './moves/moves'
import { rollD20Initiative } from './rollInitiative'
import { gameSetupInitialGameState } from './setup/setup'
import { encodeGameLogMessage, gameLogTypes } from './gamelog'
import {
  phaseNames,
  stageNames,
  OM_COUNT,
  generateBlankOrderMarkers,
  generateBlankPlayersOrderMarkers,
} from './constants'

export const defaultSetupData = {
  score: { '0': 0, '1': 0 },
  lobbyDisplayName: '',
}

export const MYGAME_NUMPLAYERS = 2

export const HexedMeadow: Game<GameState> = {
  name: 'HexedMeadow',
  // Function that returns the initial value of G.
  // setupData is an optional custom object that is
  // passed through the Game Creation API.
  setup: (ctx, setupData) => {
    return gameSetupInitialGameState
  },
  /*  validateSetupData -- Optional function to validate the setupData before matches are created. If this returns a value, an error will be reported to the user and match creation is aborted:
  validateSetupData: (setupData, numPlayers) => 'setupData is not valid!',
  */
  moves,
  seed: `${Math.random()}`,
  // The minimum and maximum number of players supported (this is only enforced when using the Lobby server component)
  minPlayers: 2,
  maxPlayers: 2,
  playerView: PlayerView.STRIP_SECRETS,
  phases: {
    //PHASE: PLACEMENT
    [phaseNames.placement]: {
      start: true,
      // all players may make moves and place their units
      turn: {
        activePlayers: {
          all: stageNames.placingUnits,
        },
      },
      // once all players have placed their units and confirmed ready, the order marker stage will begin
      endIf: ({ G }) => {
        return G.placementReady['0'] && G.placementReady['1']
      },
      next: phaseNames.placeOrderMarkers,
    },
    //PHASE: ORDER-MARKERS
    [phaseNames.placeOrderMarkers]: {
      // reset order-markers state
      onBegin: ({ G }) => {
        // bypassing first-round-reset allows you to customize initial game state, for development
        if (G.currentRound > 1) {
          // clear secret order marker state
          G.players['0'].orderMarkers = generateBlankPlayersOrderMarkers()
          G.players['1'].orderMarkers = generateBlankPlayersOrderMarkers()
          // clear public order marker state
          G.orderMarkers = generateBlankOrderMarkers()
          G.orderMarkersReady = {
            '0': false,
            '1': false,
          }
        }
      },
      // all players may make moves and place their order markers (order markers are hidden from other players via the bgio player-state API)
      turn: {
        activePlayers: {
          all: stageNames.placeOrderMarkers,
        },
      },
      // proceed to round-of-play once all players are ready
      endIf: ({ G }) => {
        // TODO: check to make sure all order markers are placed!
        return G.orderMarkersReady['0'] && G.orderMarkersReady['1']
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
      onBegin: ({ G }) => {
        const initiativeRoll = rollD20Initiative(['0', '1'])
        const roundBeginGameLog = encodeGameLogMessage({
          type: gameLogTypes.roundBegin,
          id: `${G.currentRound}`,
          initiativeRolls: initiativeRoll.rolls,
        })
        G.initiative = initiativeRoll.initiative
        G.currentOrderMarker = 0
        G.gameLog = [...G.gameLog, roundBeginGameLog]
      },
      // reset state, update currentRound
      onEnd: ({ G }) => {
        G.orderMarkersReady = { '0': false, '1': false }
        G.roundOfPlayStartReady = { '0': false, '1': false }
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
          const movePoints = unrevealedGameCard?.move ?? 0
          // loop thru this turns units
          let mutatedGameUnits = { ...G.gameUnits }
          currentTurnUnits.length &&
            currentTurnUnits.forEach((unit: GameUnit) => {
              const { unitID } = unit
              // move-points
              const unitWithMovePoints = {
                ...unit,
                movePoints,
              }
              mutatedGameUnits[unitID] = unitWithMovePoints
            })

          // finally, update state
          G.gameUnits = mutatedGameUnits
          G.unitsMoved = []
          G.unitsAttacked = {}
          G.isCurrentPlayerAttacking = false
          G.chompsAttempted = []
          G.grenadesThrown = []
          G.berserkerChargeRoll = undefined
          G.berserkerChargeSuccessCount = 0
          // if no units, end turn
          if (isRevealedGameCardCompletelyOutOfUnits) {
            const revealedGameCard = G.gameArmyCards.find(
              (gc) => gc.gameCardID === revealedGameCardID
            )
            const id = `r${G.currentRound}:om${G.currentOrderMarker}:p${ctx.currentPlayer}:${revealedGameCardID}:no-units-end-turn`
            const gameLogForNoUnitsOnTurn = encodeGameLogMessage({
              type: gameLogTypes.noUnitsOnTurn,
              id,
              playerID: ctx.currentPlayer,
              cardNameWithNoUnits: revealedGameCard?.name ?? '',
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
            events.setPhase(phaseNames.placeOrderMarkers)
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
    const gameUnitsArr = Object.values(G.gameUnits)
    const isP0Dead = !gameUnitsArr.some((u: GameUnit) => u.playerID === '0')
    const isP1Dead = !gameUnitsArr.some((u: GameUnit) => u.playerID === '1')
    if (isP0Dead) {
      return { winner: '1' }
    } else if (isP1Dead) {
      return { winner: '0' }
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
