import type { Move } from 'boardgame.io'
import { GameState, UnitsCloning, WaterCloneRoll } from '../types'

export const rollForWaterClone: Move<GameState> = (
  { G, random },
  { unitsCloning }: { unitsCloning: UnitsCloning }
) => {
  const blankWaterCloneRoll = {
    diceRolls: {},
    threshholds: {},
    cloneCount: 0,
    placements: {},
  }
  const waterCloneRoll: WaterCloneRoll = unitsCloning.reduce(
    (result, current) => {
      const isOnWater = G.boardHexes[current.clonerHexID].terrain === 'water'
      const threshhold = isOnWater ? 10 : 15
      // TODO: Anything influencing the dice roll? i.e. SuBakNa Hive Supremacy, Glyph of Lodin (+1 d20)
      const dieRoll = random.Die(20)
      const isSuccess = dieRoll >= threshhold
      return {
        ...result,
        threshholds: {
          ...result.threshholds,
          [current.clonerID]: threshhold,
        },
        diceRolls: {
          ...result.diceRolls,
          [current.clonerID]: dieRoll,
        },
        placements: {
          ...result.placements,
          [current.clonerID]: isSuccess
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
  G.waterCloneRoll = waterCloneRoll
  //
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
    movePoints: 0, // TODO: over time, there may be many properties that need resetting upon death/resurrection
  }
  delete G.killedUnits[clonedID]
  // place the unit
  G.boardHexes[hexID].occupyingUnitID = clonedID
  G.waterClonesPlaced.push({ clonedID, hexID, clonerID })
}
