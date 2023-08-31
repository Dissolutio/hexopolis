import { computeUnitMoveRange } from 'game/computeUnitMoveRange'
import { moveRange2HexFlyTestHexIDs } from 'game/setup/moveRange2HexFlyMap'
import { makeMoveRange2HexFlyScenario } from 'game/setup/setup'

describe('Move range, 2-hex fly: see if move range is working correctly on the moveRangeTest map', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    return makeMoveRange2HexFlyScenario(numPlayers, withPrePlacedUnits)
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
      myMoveRange[moveRange2HexFlyTestHexIDs.safeAdjacentSameLevel_id]?.isSafe
    ).toBe(true)
  })
  test('no fall damage when flying down a great height', () => {
    expect(
      myMoveRange[moveRange2HexFlyTestHexIDs.noFallDamage_id]?.isFallDamage
    ).toBeFalsy() // undefined or false
    expect(
      myMoveRange[moveRange2HexFlyTestHexIDs.noFall2Damage_id]?.isFallDamage
    ).toBeFalsy() // undefined or false
    expect(
      myMoveRange[moveRange2HexFlyTestHexIDs.noFallDamage_id].fallDamage
    ).toBeFalsy() // 0 or undefined
    expect(
      myMoveRange[moveRange2HexFlyTestHexIDs.noFall2Damage_id].fallDamage
    ).toBeFalsy() // 0 or undefined
  })
  //   test('can fly onto a peak of great height, beyond a chasm', () => {
  //     expect(myMoveRange[moveRange2HexFlyTestHexIDs.peak_id]?.isSafe).toBe(true)
  //   })
  //   test('can fly beyond peak of great height', () => {
  //     expect(
  //       myMoveRange[moveRange2HexFlyTestHexIDs.beyondPeak_id]?.movePointsLeft
  //     ).toBe(1)
  //   })
  //   test('adjacent engagement hex, engaging bad guy #1', () => {
  //     expect(
  //       myMoveRange[moveRange2HexFlyTestHexIDs.engagedAdjacentSameLevel_id]
  //         ?.isEngage
  //     ).toBe(true)
  //     expect(
  //       myMoveRange[moveRange2HexFlyTestHexIDs.engagedAdjacentSameLevel_id]
  //         .engagedUnitIDs.length
  //     ).toBe(1)
  //   })
  //   test('flying over enemy unit, engaging bad guy #1', () => {
  //     expect(myMoveRange[moveRange2HexFlyTestHexIDs.overEnemy_id]?.isEngage).toBe(
  //       true
  //     )
  //     expect(
  //       myMoveRange[moveRange2HexFlyTestHexIDs.engagedAdjacentSameLevel_id]
  //         .engagedUnitIDs.length
  //     ).toBe(1)
  //   })
  //   test('moving onto adjacent revealed glyph costs all of our move points', () => {
  //     expect(
  //       myMoveRange[moveRange2HexFlyTestHexIDs.revealedGlyph_id]?.movePointsLeft
  //     ).toBe(0)
  //   })
  //   test('can fly over the glyph, not having to stop or lose all move points', () => {
  //     expect(myMoveRange[moveRange2HexFlyTestHexIDs.beyondGlyph_id]?.isSafe).toBe(
  //       true
  //     )
  //     expect(
  //       myMoveRange[moveRange2HexFlyTestHexIDs.beyondGlyph_id]?.movePointsLeft
  //     ).toBe(3)
  //   })
  // TODO: add test for stepping on an unrevealed glyph, should trigger a confirm state, and be an non-undoable move
})
