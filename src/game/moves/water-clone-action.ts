import type { Move } from 'boardgame.io'
import {
  GameState,
  UnitsCloning,
  WaterCloneProposition,
  WaterCloneRoll,
} from '../types'

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
  console.log(
    '🚀 ~ file: water-clone-action.ts:46 ~ unitsCloning',
    unitsCloning
  )
  const waterCloneRoll: WaterCloneRoll = unitsCloning.reduce(
    (result, current) => {
      const isOnWater = G.boardHexes[current.unitHexID].terrain === 'water'
      const threshhold = isOnWater ? 10 : 15
      // TODO: Anything influencing the dice roll? i.e. SuBakNa Hive Supremacy, Glyph of Lodin (+1 d20)
      //   const dieRoll = random.Die(20)
      const dieRoll = 18
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
  // clear out the undefined values, because they end up making the UI go: .filter(s => !!s)
  Object.keys(waterCloneRoll?.placements ?? {}).forEach((keyOfPlacements) => {
    if (!waterCloneRoll?.placements[keyOfPlacements]) {
      delete waterCloneRoll?.placements[keyOfPlacements]
    }
  })
  G.waterCloneRoll = waterCloneRoll
  //
}
export const finishWaterCloningAndEndTurn: Move<GameState> = (
  { G, events },
  { waterClonePlacements }: { waterClonePlacements: WaterCloneProposition }
) => {
  const newBoardHexes = { ...G.boardHexes }
  const newGameUnits = { ...G.gameUnits }
  const newKilledUnits = { ...G.killedUnits }
  waterClonePlacements.forEach((placement) => {
    // unkill the unit
    newGameUnits[placement.clonedID] = newKilledUnits[placement.clonedID]
    delete newKilledUnits[placement.clonedID]
    // place the unit
    newBoardHexes[placement.hexID].occupyingUnitID = placement.clonedID
  })

  // reset water clone stuff
  G.waterCloneRoll = undefined
  events.endTurn()
}
export const placeWaterClone: Move<GameState> = (
  { G },
  { clonerID, clonedID, hexID }
) => {
  //   G.waterClonesPlaced = [
  //     ...(G?.waterClonesPlaced ?? []),
  //     { clonerID, clonedID, hexID },
  //   ]
  // unkill the unit (choosing to leave G.unitsKilled, and the same unit might get killed many times, could even be a post-game stat)
  G.gameUnits[clonedID] = {
    ...G.killedUnits[clonedID],
    movePoints: 0, // TODO: over time, there may be many properties that need resetting upon death/resurrection
  }
  delete G.killedUnits[clonedID]
  // place the unit
  G.boardHexes[hexID].occupyingUnitID = ''
}
