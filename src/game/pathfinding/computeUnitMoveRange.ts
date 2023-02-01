import { BoardHexes, GameUnits, MoveRange, GameArmyCard } from '../types'
import { generateBlankMoveRange } from '../constants'
import {
  selectHexForUnit,
  selectIfGameArmyCardHasFlying,
  selectIfGameArmyCardHasDisengage,
  selectEngagementsForHex,
} from '../selectors'
import { computeWalkMoveRange } from './walk'

// This function splits on flying/walking/ghostwalking/disengage/stealth-flying
export function computeUnitMoveRange(
  unitID: string,
  isFlying: boolean,
  boardHexes: BoardHexes,
  gameUnits: GameUnits,
  armyCards: GameArmyCard[]
): MoveRange {
  // 1. return blank move-range if we can't find the unit, its move points, or its start hex
  const initialMoveRange = generateBlankMoveRange()
  const unit = gameUnits[unitID]
  const unitGameCard = armyCards.find(
    (card) => card.gameCardID === unit?.gameCardID
  )
  const { hasStealth } = selectIfGameArmyCardHasFlying(unitGameCard)
  const { hasDisengage, hasGhostWalk } =
    selectIfGameArmyCardHasDisengage(unitGameCard)
  const playerID = unit?.playerID
  const initialMovePoints = unit?.movePoints ?? 0
  const startHex = selectHexForUnit(unit?.unitID ?? '', boardHexes)
  const initialEngagements: string[] = selectEngagementsForHex({
    hexID: startHex?.id ?? '',
    boardHexes,
    gameUnits,
    armyCards,
  })
  const isUnitEngaged = initialEngagements.length > 0
  //*early out
  if (!unit || !startHex || !initialMovePoints) {
    return initialMoveRange
  }
  const moveRange = computeWalkMoveRange({
    unmutatedContext: {
      playerID,
      unit,
      isUnitEngaged,
      isFlying,
      hasStealth,
      hasDisengage,
      hasGhostWalk,
      boardHexes,
      armyCards,
      gameUnits,
    },
    startHex: startHex,
    movePoints: initialMovePoints,
    initialMoveRange,
  })
  return moveRange
}
