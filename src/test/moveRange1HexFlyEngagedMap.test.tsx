import { computeUnitMoveRange } from 'game/computeUnitMoveRange'
import { moveRange1HexFlyEngagedMapTestHexIDs } from 'game/setup/moveRange1HexFlyingEngagedMap'
import { makeMoveRange1HexFlyEngagedScenario } from 'game/setup/setup'

describe('1-hex flying unit without stealth, starting engaged to enemies', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    const withStealth = false
    return makeMoveRange1HexFlyEngagedScenario(
      withStealth,
      numPlayers,
      withPrePlacedUnits
    )
  }
  const gameState = makeGameState()
  // this test assumes there are two players, and p0 has 2 units while p1 has 1, so 3 unitIDs: p0u0,p0u1,p1u2
  const unitMovingID = 'p1u2'
  const gameUnit = gameState.gameUnits[unitMovingID]
  const unitMoving = {
    ...gameUnit,
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
  test('flying unit without stealth has to disengage from 2 enemies when beginning flight', () => {
    expect(
      myMoveRange[moveRange1HexFlyEngagedMapTestHexIDs.adjacentHex]
        ?.disengagedUnitIDs.length
    ).toBe(2)
  })
})

// describe('MOVE RANGE PASS THRU TESTS: test that a unit cannot move thru enemy units', () => {
//   const makeGameState = () => {
//     const numPlayers = 2
//     const withPrePlacedUnits = true
//     const withStealth = false
//     return makeMoveRangePassThruScenario(
//       withStealth,
//       numPlayers,
//       withPrePlacedUnits
//     )
//   }
//   const gameState = makeGameState()
//   // this test assumes there are two players, and each has one unit, so 2 unitIDs: p0u0,p1u1
//   const unitMovingID = 'p1u1'
//   const unitMoving = {
//     ...gameState.gameUnits[unitMovingID],
//     movePoints: 5,
//   }
//   const myMoveRange = computeUnitMoveRange({
//     isFlying: false,
//     isGrappleGun: false,
//     hasMoved: false,
//     unit: unitMoving,
//     boardHexes: gameState.boardHexes,
//     gameUnits: gameState.gameUnits,
//     armyCards: gameState.gameArmyCards,
//     glyphs: gameState.hexMap.glyphs,
//   })
//   test('moving thru enemy units should not be possible', () => {
//     expect(
//       myMoveRange[
//         moveRange1HexFlyEngagedMapTestHexIDs.unreachableWithoutGhostWalk
//       ]
//     ).toBe(undefined)
//   })
// })
