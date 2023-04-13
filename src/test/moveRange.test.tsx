import { computeUnitMoveRange2 } from 'game/computeUnitMoveRange2'
import { makeMoveRangeTestScenario } from 'game/setup/setup'

test('see if move range is working correctly on the moveRangeTest map', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    return makeMoveRangeTestScenario(numPlayers, withPrePlacedUnits)
  }
  const gameState = makeGameState()
  // this test assumes there are two players, and each has one unit, so there's 'p0u1' and this one
  const unitMovingID = 'p1u1'
  const unitMoving = {
    ...gameState.gameUnits[unitMovingID],
    movePoints: 1,
  }
  const myMoveRange = computeUnitMoveRange2({
    isFlying: false,
    isGrappleGun: false,
    hasMoved: false,
    unit: unitMoving,
    boardHexes: gameState.boardHexes,
    gameUnits: gameState.gameUnits,
    armyCards: gameState.gameArmyCards,
    glyphs: gameState.hexMap.glyphs,
  })
  // 1. The hex adjacent to Us, same level, and not adjacent to Them, should be safe
  const safeAdjacentSameLevel_id = '1,0,-1'
  expect(myMoveRange[safeAdjacentSameLevel_id]?.isSafe).toBe(true)
  expect(myMoveRange[safeAdjacentSameLevel_id].engagedUnitIDs.length).toBe(0)

  const engagedAdjacentSameLevel_id = '0,0,0'
  expect(myMoveRange[engagedAdjacentSameLevel_id]?.isEngage).toBe(true)
  expect(myMoveRange[engagedAdjacentSameLevel_id].engagedUnitIDs.length).toBe(1)
})
