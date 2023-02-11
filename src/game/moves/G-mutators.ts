import { BoardHexes, GameUnits, UnitsKilled } from '../types'

export const killUnit_G = ({
  boardHexes,
  unitsKilled,
  killedUnits,
  gameUnits,
  unitToKillID,
  killerUnitID,
  defenderHexID,
  defenderTailHexID,
}: {
  boardHexes: BoardHexes
  unitsKilled: UnitsKilled
  killedUnits: GameUnits
  gameUnits: GameUnits
  unitToKillID: string
  killerUnitID: string
  defenderHexID: string
  defenderTailHexID?: string
}) => {
  unitsKilled[killerUnitID] = [
    ...(unitsKilled?.[killerUnitID] ?? []),
    unitToKillID,
  ]

  killedUnits[unitToKillID] = {
    ...gameUnits[unitToKillID],
  }
  delete gameUnits[unitToKillID]
  // remove from hex, and tail if applicable
  boardHexes[defenderHexID].occupyingUnitID = ''
  if (defenderTailHexID) {
    boardHexes[defenderTailHexID].occupyingUnitID = ''
    boardHexes[defenderTailHexID].isUnitTail = false
  }
}
