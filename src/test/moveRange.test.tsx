import { computeUnitMoveRange2 } from 'game/computeUnitMoveRange2'
import { moveRangeTestHexIDs } from 'game/setup/moveRangeMap'
import { makeMoveRangeTestScenario } from 'game/setup/setup'

describe('MOVE RANGE TESTS: see if move range is working correctly on the moveRangeTest map', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    return makeMoveRangeTestScenario(numPlayers, withPrePlacedUnits)
  }
  const gameState = makeGameState()
  // this test assumes there are two players, and each has one unit, so 2 unitIDs: p0u0,p1u1
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
  test('adjacent safe hex, engaging no one', () => {
    expect(
      myMoveRange[moveRangeTestHexIDs.safeAdjacentSameLevel_id]?.isSafe
    ).toBe(true)
    expect(
      myMoveRange[moveRangeTestHexIDs.safeAdjacentSameLevel_id].engagedUnitIDs
        .length
    ).toBe(0)
  })
  test('adjacent engagement hex, engaging bad guy #1', () => {
    expect(
      myMoveRange[moveRangeTestHexIDs.engagedAdjacentSameLevel_id]?.isEngage
    ).toBe(true)
    expect(
      myMoveRange[moveRangeTestHexIDs.engagedAdjacentSameLevel_id]
        .engagedUnitIDs.length
    ).toBe(1)
  })
  test('go one hex next to bad guy #1, then disengage from bad guy #1', () => {
    expect(myMoveRange[moveRangeTestHexIDs.disengageOne_id]?.isDisengage).toBe(
      true
    )
    expect(
      myMoveRange[moveRangeTestHexIDs.disengageOne_id]?.disengagedUnitIDs.length
    ).toBe(1)
  })
})
