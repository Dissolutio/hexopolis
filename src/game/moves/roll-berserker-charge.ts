import type { Move } from 'boardgame.io'
import { GameState, UnitsCloning, WaterCloneRoll } from '../types'

export const rollForBerserkerCharge: Move<GameState> = (
  { G, random },
  { gameCardID }: { gameCardID: string }
) => {
  console.log('🚀 ~ file: roll-berserker-charge.ts:8 ~ gameCardID', gameCardID)
  // roll for it
  // if success, assign move points
  // report to G
  // game log
}
