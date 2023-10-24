import { Move } from 'boardgame.io'
import { GameState } from 'game/types'

const rotateUnit: Move<GameState> = (
  { G },
  { unitID, turns }: { unitID: string; turns: number }
) => {
  const currentRotation = G.gameUnits[unitID]?.rotation
  G.gameUnits[unitID].rotation = (currentRotation + turns) % 6
}
