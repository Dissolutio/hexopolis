import { computeUnitMoveRange } from 'game/computeUnitMoveRange'
import { MAJOR_FALL_DAMAGE, MINOR_FALL_DAMAGE } from 'game/constants'
import { moveRange2HexWalkTestHexIDs } from 'game/setup/maps/moveRange2HexWalkMap'
import { makeMoveRange2HexWalkScenario } from 'game/setup/scenarios'

describe('2-hex units MOVE RANGE TESTS: see if move range is working correctly on the move range test map', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    return makeMoveRange2HexWalkScenario(numPlayers, withPrePlacedUnits)
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
  test('adjacent safe hex, engaging no one', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.safeAdjacentSameLevel_id]?.isSafe
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.safeAdjacentSameLevel_id]
        .engagedUnitIDs.length
    ).toBe(0)
  })
  test('2 hex unit takes major fall damage (jumping into a deep hole)', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.majorAdjacentFall_id]
        ?.isFallDamage
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.majorAdjacentFall_id].fallDamage
    ).toBe(MAJOR_FALL_DAMAGE)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.majorAdjacentFall_id]
        .movePointsLeft
      // TODO: 2hex flipping is free, so movePointsLeft below should be 1 more than current value (because even though a 2 hex unit cannot technically fall just one hex, once they step to the second hex over the ledge and can stop, they could turn around for free, not costing an extra move point as the current code imposes)
    ).toBe(2)

    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.majorFallOnly_id]?.isFallDamage
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.majorFallOnly_id].fallDamage
    ).toBe(MAJOR_FALL_DAMAGE)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.majorFallOnly_id].movePointsLeft
    ).toBe(3)
  })
  test('adjacent minor fall damage, engaging no one (jumping into a shallow hole)', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.basicAdjacentFall_id]
        ?.isFallDamage
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.basicAdjacentFall_id].fallDamage
    ).toBe(MINOR_FALL_DAMAGE)

    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.basicFall_id]?.isFallDamage
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.basicFall_id].fallDamage
    ).toBe(MINOR_FALL_DAMAGE)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.basicFall_id]?.movePointsLeft
    ).toBe(3)
  })
  test('adjacent engagement hex, engaging bad guy #1', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.engagedAdjacentSameLevel_id]
        ?.isEngage
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.engagedAdjacentSameLevel_id]
        .engagedUnitIDs.length
    ).toBe(1)
  })
  test('go one hex next to bad guy #1, then disengage from bad guy #1', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.disengageOne_id]?.isDisengage
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.disengageOne_id]
        ?.disengagedUnitIDs.length
    ).toBe(1)
  })
  test('fall damage AND disengage from bad guy #1', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.disengageOneAndFall_id]
        ?.isDisengage
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.disengageOneAndFall_id]
        ?.isFallDamage
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.disengageOneAndFall_id]
        ?.fallDamage
    ).toBe(MINOR_FALL_DAMAGE)
  })
  test('moving onto adjacent revealed glyph ends our move, and keeps us from reaching the hex beyond', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.revealedGlyph_id]?.movePointsLeft
    ).toBe(0)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.beyondRevealedGlyph_id]
    ).toBe(undefined)
  })
  test('moving onto one-hex wide ledge is not possible for 2-hex units', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.unstoppable1HexWideLedge]
    ).toBe(undefined)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.reachable2HexWideLedge1]?.isSafe
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.reachable2HexWideLedge2]?.isSafe
    ).toBe(true)
  })
  test('2-hex units do not have to stop their movement until they move into a second water space, so two water spaces are reachable and the third is not', () => {
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.reachableWater1]?.isSafe
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.reachableWater2]?.isSafe
    ).toBe(true)
    expect(
      myMoveRange[moveRange2HexWalkTestHexIDs.reachableWater2]?.movePointsLeft
    ).toBe(0)
    expect(myMoveRange[moveRange2HexWalkTestHexIDs.unreachableWater]).toBe(
      undefined
    )
  })
  // TODO: add test for stepping on an unrevealed glyph, should trigger a confirm state, and be a non-undoable move
})
