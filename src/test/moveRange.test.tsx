import { computeUnitMoveRange2 } from 'game/computeUnitMoveRange2'
import { MAJOR_FALL_DAMAGE, MINOR_FALL_DAMAGE } from 'game/constants'
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
  test('cannot climb to this hex, not enough move points / height', () => {
    expect(myMoveRange[moveRangeTestHexIDs.cannotClimbOver_id]).toBe(undefined)
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
  test('adjacent fall damage, engaging no one (jumping into a shallow hole)', () => {
    expect(
      myMoveRange[moveRangeTestHexIDs.basicAdjacentFall_id]?.isFallDamage
    ).toBe(true)
    expect(
      myMoveRange[moveRangeTestHexIDs.basicAdjacentFall_id].fallDamage
    ).toBe(MINOR_FALL_DAMAGE)
  })
  test('adjacent major fall damage, engaging no one (jumping into a deep hole)', () => {
    expect(
      myMoveRange[moveRangeTestHexIDs.majorAdjacentFall_id]?.isFallDamage
    ).toBe(true)
    expect(
      myMoveRange[moveRangeTestHexIDs.majorAdjacentFall_id].fallDamage
    ).toBe(MAJOR_FALL_DAMAGE)
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
