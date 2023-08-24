import { computeUnitMoveRange } from 'game/computeUnitMoveRange'
import { MAJOR_FALL_DAMAGE, MINOR_FALL_DAMAGE } from 'game/constants'
import { moveRangeTestHexIDs } from 'game/setup/moveRangeMap'
import { makeMoveRange1HexWalkScenario } from 'game/setup/setup'

describe('MOVE RANGE TESTS: see if move range is working correctly on the moveRangeTest map', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    return makeMoveRange1HexWalkScenario(numPlayers, withPrePlacedUnits)
  }
  const gameState = makeGameState()
  // this test assumes there are two players, and each has one unit, so 2 unitIDs: p0u0,p1u1
  const unitMovingID = 'p1u1'
  const unitMoving = {
    ...gameState.gameUnits[unitMovingID],
    movePoints: 5,
  }
  const myMoveRange = computeUnitMoveRange({
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
  test('fall damage AND disengage from bad guy #1', () => {
    expect(
      myMoveRange[moveRangeTestHexIDs.disengageOneAndFall_id]?.isDisengage
    ).toBe(true)
    expect(
      myMoveRange[moveRangeTestHexIDs.disengageOneAndFall_id]?.isFallDamage
    ).toBe(true)
    expect(
      myMoveRange[moveRangeTestHexIDs.disengageOneAndFall_id]?.fallDamage
    ).toBe(MINOR_FALL_DAMAGE)
  })
  test('moving onto adjacent revealed glyph ends our move, and keeps us from reaching the hex beyond', () => {
    expect(
      myMoveRange[moveRangeTestHexIDs.revealedGlyph_id]?.movePointsLeft
    ).toBe(0)
    expect(myMoveRange[moveRangeTestHexIDs.beyondRevealedGlyph_id]).toBe(
      undefined
    )
  })
  // TODO: add test for stepping on an unrevealed glyph, should trigger a confirm state, and be an non-undoable move
})
