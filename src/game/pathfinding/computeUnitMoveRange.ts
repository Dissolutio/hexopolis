import { BoardHexes, GameUnits, MoveRange, GameArmyCard } from '../types'
import { generateBlankMoveRange } from '../constants'
import {
  selectHexForUnit,
  selectIfGameArmyCardHasFlying,
  selectIfGameArmyCardHasDisengage,
} from '../selectors'
import { computeWalkMoveRange } from './walk'
import { computeFlyMoveRange } from './fly'
import { compute2HexWalkMoveRange } from './two-hex-walk'

// This function splits on flying/walking/ghostwalking/disengage/stealth-flying
export function computeUnitMoveRange(
  unitID: string,
  isWalkingFlyer: boolean,
  boardHexes: BoardHexes,
  gameUnits: GameUnits,
  armyCards: GameArmyCard[]
): MoveRange {
  // 1. return blank move-range if we can't find the unit, its move points, or its start hex
  const initialMoveRange = generateBlankMoveRange()
  const unit = gameUnits[unitID]
  const is2Hex = unit?.is2Hex
  const unitGameCard = armyCards.find(
    (card) => card.gameCardID === unit?.gameCardID
  )
  const { hasFlying, hasStealth } = selectIfGameArmyCardHasFlying(unitGameCard)
  const { hasDisengage, hasGhostWalk } =
    selectIfGameArmyCardHasDisengage(unitGameCard)
  const isFlying = isWalkingFlyer ? false : hasFlying
  const playerID = unit?.playerID
  const initialMovePoints = unit?.movePoints ?? 0
  const startHex = selectHexForUnit(unit?.unitID ?? '', boardHexes)
  //*early out
  if (!unit || !startHex || !initialMovePoints) {
    return initialMoveRange
  }
  // 1 or 2 hex figure, flying or walking, with or without stealth/disengage/ghostwalk
  const moveRange = isFlying
    ? computeFlyMoveRange({
        unmutatedContext: {
          playerID,
          unit,
          hasStealth,
          boardHexes,
          armyCards,
          gameUnits,
        },
        startHex: startHex,
        movePoints: initialMovePoints,
        initialMoveRange,
      })
    : is2Hex
    ? compute2HexWalkMoveRange({
        unmutatedContext: {
          playerID,
          unit,
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
    : computeWalkMoveRange({
        unmutatedContext: {
          playerID,
          unit,
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
