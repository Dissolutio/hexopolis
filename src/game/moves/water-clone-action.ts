import type { Move } from 'boardgame.io'
import { selectGlyphForHex } from 'game/selectors'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import { GameState, HexTerrain, UnitsCloning, WaterCloneRoll } from '../types'
import { revealGlyph_G } from './G-mutators'

export const rollForWaterClone: Move<GameState> = {
  undoable: false,
  move: (
    { G, ctx, random },
    { unitsCloning, unitName }: { unitsCloning: UnitsCloning; unitName: string }
  ) => {
    const blankWaterCloneRoll = {
      diceRolls: {},
      threshholds: {},
      cloneCount: 0,
      placements: {},
    }
    const waterCloneRoll: WaterCloneRoll = unitsCloning.reduce(
      (result, current) => {
        const isOnWater =
          G.boardHexes[current.clonerHexID].terrain === HexTerrain.water
        const rollThreshhold = isOnWater ? 10 : 15
        // const roll = random.Die(20)
        const roll = 20
        const isRollSuccessful = roll >= rollThreshhold
        return {
          ...result,
          threshholds: {
            ...result.threshholds,
            [current.clonerID]: rollThreshhold,
          },
          diceRolls: {
            ...result.diceRolls,
            [current.clonerID]: roll,
          },
          placements: {
            ...result.placements,
            [current.clonerID]: isRollSuccessful
              ? {
                  clonerID: current.clonerID,
                  clonerHexID: current.clonerHexID,
                  tails: current.tails,
                }
              : undefined,
          },
        }
      },
      blankWaterCloneRoll
    )
    // clear out the undefined values
    Object.keys(waterCloneRoll?.placements ?? {}).forEach((keyOfPlacements) => {
      if (!waterCloneRoll?.placements[keyOfPlacements]) {
        delete waterCloneRoll?.placements[keyOfPlacements]
      }
    })
    const cloneCount = Object.values(waterCloneRoll?.placements ?? {}).length
    waterCloneRoll.cloneCount = cloneCount
    G.waterCloneRoll = waterCloneRoll
    // add to game log
    const rollsAndThreshholds = Object.keys(
      waterCloneRoll?.diceRolls ?? {}
    ).map((gameUnitID) => {
      return [
        waterCloneRoll.diceRolls[gameUnitID],
        waterCloneRoll.threshholds[gameUnitID],
      ]
    })
    const id = `r${G.currentRound}:om${G.currentOrderMarker}:waterClone`
    const gameLogForThisMove = encodeGameLogMessage({
      type: gameLogTypes.waterClone,
      id,
      playerID: ctx.currentPlayer,
      rollsAndThreshholds,
      cloneCount,
      unitName,
    })
    G.gameLog.push(gameLogForThisMove)
    //
  },
}
export const finishWaterCloningAndEndTurn: Move<GameState> = ({
  G,
  events,
}) => {
  // reset water clone stuff
  G.waterCloneRoll = undefined
  G.waterClonesPlaced = []
  events.endTurn()
}
export const placeWaterClone: Move<GameState> = (
  { G },
  { clonedID, hexID, clonerID }
) => {
  // unkill the unit
  G.gameUnits[clonedID] = {
    ...G.killedUnits[clonedID],
    movePoints: 0,
  }
  delete G.killedUnits[clonedID]
  // TODO: GLYPH move
  // place the unit
  G.boardHexes[hexID].occupyingUnitID = clonedID
  G.waterClonesPlaced.push({ clonedID, hexID, clonerID })
}
