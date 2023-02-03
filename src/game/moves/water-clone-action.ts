import type { Move } from 'boardgame.io'
import { GameState, UnitsCloning, WaterCloneRoll } from '../types'

export const waterClone: Move<GameState> = (
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
      const isOnWater = G.boardHexes[current.unitHexID].terrain === 'water'
      const threshhold = isOnWater ? 10 : 15
      // TODO: Anything influencing the dice roll? i.e. SuBakNa Hive Supremacy, Glyph of Lodin (+1 d20)
      const dieRoll = random.Die(20)
      const isSuccess = dieRoll >= threshhold
      return {
        ...result,
        threshholds: {
          ...result.threshholds,
          [current.unit.unitID]: threshhold,
        },
        diceRolls: {
          ...result.diceRolls,
          [current.unit.unitID]: dieRoll,
        },
        cloneCount: isSuccess ? result.cloneCount + 1 : result.cloneCount,
        placements: {
          ...result.placements,
          [current.unit.unitID]: isSuccess
            ? {
                clonerID: current.unit.unitID,
                unitHexID: current.unitHexID,
                tails: current.tails,
              }
            : undefined,
        },
      }
    },
    blankWaterCloneRoll
  )

  G.waterCloneRoll = waterCloneRoll
  G.waterClonesPlaced = []
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
  { clonerID, clonedID, hexID }
) => {
  G.waterClonesPlaced = [
    ...(G?.waterClonesPlaced ?? []),
    { clonerID, clonedID, hexID },
  ]
  // unkill the unit (choosing to leave G.unitsKilled, and the same unit might get killed many times, could even be a post-game stat)
  G.gameUnits[clonedID] = {
    ...G.killedUnits[clonedID],
    movePoints: 0, // TODO: over time, there may be many properties that need resetting upon death/resurrection
  }
  delete G.killedUnits[clonedID]
  // place the unit
  G.boardHexes[hexID].occupyingUnitID = ''
}
