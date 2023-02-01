import {
  BoardHexes,
  BoardHex,
  GameUnits,
  GameUnit,
  GameArmyCard,
} from '../types'
import {
  selectEngagementsForHex,
  selectIsMoveCausingDisengagements,
  selectIsMoveCausingEngagements,
  selectIsClimbable,
} from '../selectors'

type ExtractParams = {
  startHex: BoardHex
  endHex: BoardHex
  movePointsLeft: number
  // unmutated context below
  playerID: string
  unit: GameUnit
  hasDisengage: boolean
  hasGhostWalk: boolean
  boardHexes: BoardHexes
  armyCards: GameArmyCard[]
  gameUnits: GameUnits
}
export const extractMoveInfo = ({
  startHex,
  endHex,
  movePointsLeft,
  playerID,
  unit,
  hasDisengage,
  hasGhostWalk,
  boardHexes,
  armyCards,
  gameUnits,
}: ExtractParams) => {
  const { id: endHexID, occupyingUnitID: endHexUnitID } = endHex
  const isCausingEngagement = selectIsMoveCausingEngagements({
    unit,
    endHexID,
    boardHexes,
    gameUnits,
    armyCards,
  })
  const isCausingDisengagement = hasDisengage
    ? false
    : selectIsMoveCausingDisengagements({
        unit,
        endHexID,
        boardHexes,
        gameUnits,
        armyCards,
      })
  const endHexUnit = { ...gameUnits[endHexUnitID] }
  const endHexUnitPlayerID = endHexUnit.playerID
  const isEndHexUnoccupied = !Boolean(endHexUnitID)
  const isTooCostly = movePointsLeft < 0

  const isEndHexEnemyOccupied =
    !isEndHexUnoccupied && endHexUnitPlayerID !== playerID
  const isEndHexUnitEngaged =
    selectEngagementsForHex({
      hexID: endHex.id,
      boardHexes,
      gameUnits,
      armyCards,
    }).length > 0
  const isTooTallOfClimb = !selectIsClimbable(unit, armyCards, startHex, endHex)
  const isUnpassable =
    isTooCostly ||
    // ghost walk can move through enemy occupied hexes, or hexes with engaged units
    (hasGhostWalk ? false : isEndHexEnemyOccupied) ||
    (hasGhostWalk ? false : isEndHexUnitEngaged) ||
    isTooTallOfClimb
  return {
    isCausingEngagement,
    isCausingDisengagement,
    isEndHexUnoccupied,
    isTooCostly,
    isEndHexEnemyOccupied,
    isEndHexUnitEngaged,
    isUnpassable,
  }
}
