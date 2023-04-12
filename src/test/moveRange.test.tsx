import { computeUnitMoveRange } from 'game/computeUnitMoveRange'
import { computeUnitMoveRange2 } from 'game/computeUnitMoveRange2'
import { makeMoveRangeTestScenario } from 'game/setup/setup'

test('see if move range is working correctly on the devHexagon map', () => {
  const numPlayers = 2
  const withPrePlacedUnits = true
  const gameState = makeMoveRangeTestScenario(numPlayers, withPrePlacedUnits)
  const unitToCheckMoveRangeFor = gameState.gameUnits['p1u5']
  // const myMoveRange = computeUnitMoveRange2({
  //   isFlying: false,
  //   isGrappleGun: false,
  //   hasMoved: false,
  //   unit: unitToCheckMoveRangeFor,
  //   boardHexes: gameState.boardHexes,
  //   gameUnits: gameState.gameUnits,
  //   armyCards: gameState.gameArmyCards,
  //   glyphs: gameState.hexMap.glyphs,
  // })
  const myMoveRange = computeUnitMoveRange(
    unitToCheckMoveRangeFor,
    false,
    false,
    false,
    gameState.boardHexes,
    gameState.gameUnits,
    gameState.gameArmyCards,
    gameState.hexMap.glyphs
  )
  console.log(
    '🚀 ~ file: moveRange.test.tsx:19 ~ test ~ myMoveRange:',
    myMoveRange
  )
  expect(1).toBe(3)
})
