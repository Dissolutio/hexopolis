import { computeUnitMoveRange } from 'game/computeUnitMoveRange'
import { moveRange1HexFlyTestHexIDs } from 'game/setup/maps/moveRange1HexFlyMap'
import { makeMoveRange1HexFlyScenario } from 'game/setup/scenarios'

describe('Move range, 1-hex fly: see if move range is working correctly on the moveRangeTest map', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    return makeMoveRange1HexFlyScenario(numPlayers, withPrePlacedUnits)
  }
  const gameState = makeGameState()
  // this test assumes there are two players, and each has one unit, so 2 unitIDs: p0u0,p1u1
  const unitMovingID = 'p1u1'
  const unitMoving = {
    ...gameState.gameUnits[unitMovingID],
    movePoints: 5,
  }
  const myMoveRange = computeUnitMoveRange({
    isFlying: true,
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
      myMoveRange[moveRange1HexFlyTestHexIDs.safeAdjacentSameLevel_id]?.isSafe
    ).toBe(true)
    // TODO: moveRange: cleanup the return value such that all properties are defined
    // expect(
    //   myMoveRange[moveRange1HexFlyTestHexIDs.safeAdjacentSameLevel_id]
    //     .engagedUnitIDs.length
    // ).toBe(0)
    // expect(
    //   myMoveRange[moveRange1HexFlyTestHexIDs.safeAdjacentSameLevel_id]
    //     .disengagedUnitIDs.length
    // ).toBe(0)
    // expect(
    //   myMoveRange[moveRange1HexFlyTestHexIDs.safeAdjacentSameLevel_id]
    //     .isDisengage
    // ).toBe(false)
    // expect(
    //   myMoveRange[moveRange1HexFlyTestHexIDs.safeAdjacentSameLevel_id]
    //     .fallDamage
    // ).toBe(0)
    // expect(
    //   myMoveRange[moveRange1HexFlyTestHexIDs.safeAdjacentSameLevel_id]
    //     .isFallDamage
    // ).toBe(false)
  })
  test('no fall damage when flying down a great height', () => {
    expect(
      myMoveRange[moveRange1HexFlyTestHexIDs.noFallDamage_id]?.isFallDamage
    ).toBeFalsy() // undefined or false
    expect(
      myMoveRange[moveRange1HexFlyTestHexIDs.noFallDamage_id].fallDamage
    ).toBeFalsy() // 0 or undefined
  })
  test('can fly onto a peak of great height, beyond a chasm', () => {
    expect(myMoveRange[moveRange1HexFlyTestHexIDs.peak_id]?.isSafe).toBe(true)
  })
  test('can fly beyond peak of great height', () => {
    expect(
      myMoveRange[moveRange1HexFlyTestHexIDs.beyondPeak_id]?.movePointsLeft
    ).toBe(1)
  })
  test('adjacent engagement hex, engaging bad guy #1', () => {
    expect(
      myMoveRange[moveRange1HexFlyTestHexIDs.engagedAdjacentSameLevel_id]
        ?.isEngage
    ).toBe(true)
    expect(
      myMoveRange[moveRange1HexFlyTestHexIDs.engagedAdjacentSameLevel_id]
        .engagedUnitIDs.length
    ).toBe(1)
  })
  test('flying over enemy unit, engaging bad guy #1', () => {
    expect(myMoveRange[moveRange1HexFlyTestHexIDs.overEnemy_id]?.isEngage).toBe(
      true
    )
    expect(
      myMoveRange[moveRange1HexFlyTestHexIDs.engagedAdjacentSameLevel_id]
        .engagedUnitIDs.length
    ).toBe(1)
  })
  test('moving onto adjacent revealed glyph costs all of our move points', () => {
    expect(
      myMoveRange[moveRange1HexFlyTestHexIDs.revealedGlyph_id]?.movePointsLeft
    ).toBe(0)
  })
  test('can fly over the glyph, not having to stop or lose all move points', () => {
    expect(myMoveRange[moveRange1HexFlyTestHexIDs.beyondGlyph_id]?.isSafe).toBe(
      true
    )
    expect(
      myMoveRange[moveRange1HexFlyTestHexIDs.beyondGlyph_id]?.movePointsLeft
    ).toBe(3)
  })
  // TODO: add test for stepping on an unrevealed glyph, should trigger a confirm state, and be an non-undoable move
})
