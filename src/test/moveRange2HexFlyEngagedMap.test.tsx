import { computeUnitMoveRange } from 'game/computeUnitMoveRange'
import { moveRange2HexFlyEngagedMapTestHexIDs } from 'game/setup/moveRange2HexFlyingEngagedMap'
import { makeMoveRange2HexFlyEngagedScenario } from 'game/setup/scenarios'

describe('2-hex flying unit without stealth, starting engaged to 2 enemies', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    const withStealth = false
    return makeMoveRange2HexFlyEngagedScenario(
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
  test('has to disengage from 2 enemies when beginning flight', () => {
    expect(
      myMoveRange[moveRange2HexFlyEngagedMapTestHexIDs.adjacentHex]
        ?.disengagedUnitIDs.length
    ).toBe(2)
    expect(
      myMoveRange[moveRange2HexFlyEngagedMapTestHexIDs.adjacentHex]?.isDisengage
    ).toBe(true)
  })
})

describe('2-hex flying unit with stealth, starting engaged to 2 enemies', () => {
  const makeGameState = () => {
    const numPlayers = 2
    const withPrePlacedUnits = true
    const withStealth = true
    return makeMoveRange2HexFlyEngagedScenario(
      withStealth,
      numPlayers,
      withPrePlacedUnits
    )
  }
  const gameState = makeGameState()
  // this test assumes there are two players, and p0 has 2 units while p1 has 1, so 3 unitIDs: p0u0,p0u1,p1u2
  const unitMovingID = 'p1u2'
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
  test('can safely fly to adjacent hex', () => {
    expect(
      myMoveRange[moveRange2HexFlyEngagedMapTestHexIDs.adjacentHex]?.isSafe
    ).toBe(true)
  })
})
