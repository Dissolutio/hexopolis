import type { Move } from 'boardgame.io'
import { selectGlyphForHex } from '../selectors'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import { GameState, HexTerrain, UnitsCloning, WaterCloneRoll } from '../types'
import { revealGlyph_G } from './G-mutators'

export const rollForWaterClone: Move<GameState> = {
  undoable: false,
  move: (
    { G, ctx, random },
    // this depends on the ui to only pass in the units that have valid hexes to place clones onto
    {
      unitsCloning,
      unitName,
      possibleRevivals,
    }: {
      unitsCloning: UnitsCloning
      unitName: string
      possibleRevivals: number
    }
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
        const roll = random.Die(20)
        // const roll = 20
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
      possibleRevivals,
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
export const placeWaterClone: Move<GameState> = {
  undoable: false,
  move: ({ G, ctx }, { clonedID, hexID, clonerID }) => {
    // unkill the unit
    G.gameUnits[clonedID] = {
      ...G.killedUnits[clonedID],
      movePoints: 0,
      // TODO: REVIVE: other properties may need resetting
      wounds: 0,
    }
    delete G.killedUnits[clonedID]
    // so far, this is what differentiates this from undoablePlaceWaterClone
    const glyphOnHex = selectGlyphForHex({
      hexID: hexID,
      glyphs: G.hexMap.glyphs,
    })
    const isGlyphOnHexUnrevealed = glyphOnHex && !glyphOnHex.isRevealed
    // reveal or activate glyph on hex
    if (isGlyphOnHexUnrevealed) {
      revealGlyph_G({
        endHexID: hexID,
        glyphOnHex,
        glyphs: G.hexMap.glyphs,
      })
      // gamelog glyph reveal
      const indexOfThisClone = G.waterClonesPlaced.length
      const gameLogID = `r${G.currentRound}:om${G.currentOrderMarker}:clone:${indexOfThisClone}`
      const gameLogForGlyphReveal = encodeGameLogMessage({
        type: gameLogTypes.glyphReveal,
        id: gameLogID,
        playerID: ctx.currentPlayer,
        unitSingleName: 'Marro Warrior',
        revealedGlyphID: glyphOnHex?.glyphID ?? '',
      })
      G.gameLog.push(gameLogForGlyphReveal)
    }

    // place the unit
    G.boardHexes[hexID].occupyingUnitID = clonedID
    G.waterClonesPlaced.push({ clonedID, hexID, clonerID })
  },
}
export const undoablePlaceWaterClone: Move<GameState> = {
  undoable: true,
  move: ({ G, ctx }, { clonedID, hexID, clonerID }) => {
    // unkill the unit
    G.gameUnits[clonedID] = {
      ...G.killedUnits[clonedID],
      movePoints: 0,
      // TODO: REVIVE: other properties may need resetting
      wounds: 0,
    }
    delete G.killedUnits[clonedID]

    // place the unit
    G.boardHexes[hexID].occupyingUnitID = clonedID
    G.waterClonesPlaced.push({ clonedID, hexID, clonerID })
  },
}
