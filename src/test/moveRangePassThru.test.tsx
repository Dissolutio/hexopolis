import { computeUnitMoveRange } from 'game/computeUnitMoveRange'
import { moveRangePassThruTestHexIDs } from 'game/setup/maps/moveRangePassThruMap'
import { makeMoveRangePassThruScenario } from 'game/setup/scenarios'

describe('phantom walking unit should be able to move thru an enemy unit', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    const withGhostWalk = true
    return makeMoveRangePassThruScenario(
      withGhostWalk,
      numPlayers,
      withPrePlacedUnits
    )
  }
  const gameState = makeGameState()
  // this test assumes there are two players, and each has one unit, so 2 unitIDs: p0u0,p1u1
  const unitMovingID = 'p1u1'
  // const unitMovingID = 'p1u3'
  const gameUnit = gameState.gameUnits[unitMovingID]
  const unitMoving = {
    ...gameUnit,
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
  test('moving thru the enemy unit should be possible with ghost walk', () => {
    expect(
      myMoveRange[moveRangePassThruTestHexIDs.unreachableWithoutGhostWalk]
        ?.movePointsLeft
    ).toBe(3)
    expect(
      myMoveRange[moveRangePassThruTestHexIDs.unreachableWithoutGhostWalk]
        ?.isSafe
    ).toBe(true)
  })
})

describe('MOVE RANGE PASS THRU TESTS: test that a unit cannot move thru enemy units', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    const withGhostWalk = false
    return makeMoveRangePassThruScenario(
      withGhostWalk,
      numPlayers,
      withPrePlacedUnits
    )
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
  test('moving thru enemy units should not be possible', () => {
    expect(
      myMoveRange[moveRangePassThruTestHexIDs.unreachableWithoutGhostWalk]
    ).toBe(undefined)
  })
})
