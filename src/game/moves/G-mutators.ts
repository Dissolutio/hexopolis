import { selectGameCardByID } from 'game/selectors'
import {
  BoardHexes,
  GameArmyCard,
  GameUnits,
  PlayerState,
  UnitsKilled,
} from '../types'

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
export const assignCardMovePointsToUnit_G = ({
  gameArmyCards,
  gameUnits,
  unitID,
  overrideMovePoints,
}: {
  gameArmyCards: GameArmyCard[]
  gameUnits: GameUnits
  unitID: string
  overrideMovePoints?: number
}) => {
  const gameCard = selectGameCardByID(
    gameArmyCards,
    gameUnits[unitID].gameCardID
  )
  // TODO: move point card selector
  const movePoints = overrideMovePoints ?? gameCard?.move ?? 0
  // move-points
  const unitWithMovePoints = {
    ...gameUnits[unitID],
    movePoints,
  }
  gameUnits[unitID] = unitWithMovePoints
}
