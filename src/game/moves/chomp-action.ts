import type { Move } from 'boardgame.io'
import { GameState } from '../types'

export const chompAction: Move<GameState> = (
  { G, random },
  {
    chompingUnitID,
    targetUnitID,
  }: {
    chompingUnitID: string
    targetUnitID: string
    isSquad: boolean
  }
) => {
  const targetUnit = G.gameUnits[targetUnitID]
  const targetGameCard = G.gameArmyCards.find(
    (gc) => gc.gameCardID === targetUnit.gameCardID
  )
  // DISALLOW - missing needed ingredients
  if (!targetUnit || !targetGameCard) {
    console.error(
      `Chomp action denied: missing needed ingredients to calculate attack`
    )
    return
  }
  // 1. If it is a valid squad unit, kill it
  // 2. If it is a valid hero unit, roll for it, and maybe kill it
  // 3. Add to gamelog
  // 4. Send the player to movement stage
}

const killUnit_G = ({
  G,
  unitToKillID,
  killerUnitID,
  defenderHexID,
  defenderTailHexID,
}: {
  G: GameState
  unitToKillID: string
  killerUnitID: string
  defenderHexID: string
  defenderTailHexID: string
}) => {
  const newBoardHexes = { ...G.boardHexes }
  const newUnitsKilled = { ...G.unitsKilled }
  const newKilledUnits = { ...G.killedUnits }
  const newGameUnits = { ...G.gameUnits }

  G.unitsKilled = {
    ...G.unitsKilled,
    [killerUnitID]: [...(G.unitsKilled?.[killerUnitID] ?? []), unitToKillID],
  }
  G.killedUnits[unitToKillID] = {
    ...G.gameUnits[unitToKillID],
  }
  delete G.gameUnits[unitToKillID]
  // remove from hex, and tail if applicable
  G.boardHexes[defenderHexID].occupyingUnitID = ''
  if (defenderTailHexID) {
    G.boardHexes[defenderTailHexID].occupyingUnitID = ''
    G.boardHexes[defenderTailHexID].isUnitTail = false
  }
  return {
    boardHexes: newBoardHexes,
    unitsKilled: newUnitsKilled,
    killedUnits: newKilledUnits,
    gameUnits: newGameUnits,
  }
}
