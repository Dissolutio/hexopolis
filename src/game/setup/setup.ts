import {
  makeDefaultScenario,
  makeForsakenWaters2PlayerScenario,
  makeGiantsTable2PlayerScenario,
  makeMoveRange1HexFlyEngagedScenario,
  makeMoveRange1HexFlyScenario,
  makeMoveRange1HexWalkScenario,
  makeMoveRange2HexFlyEngagedScenario,
  makeMoveRange2HexFlyScenario,
  makeMoveRange2HexWalkScenario,
  makeMoveRangePassThruScenario,
  scenarioNames,
} from './scenarios'

//!! TEST SCENARIO
export const gameSetupInitialGameState = ({
  numPlayers,
  isLocalOrDemoGame,
  scenarioName,
  withPrePlacedUnits,
}: {
  numPlayers: number
  isLocalOrDemoGame: boolean
  scenarioName?: string
  withPrePlacedUnits?: boolean
}) => {
  const isDemoGame =
    numPlayers === 2 &&
    isLocalOrDemoGame &&
    process.env.NODE_ENV === 'production'
  if (scenarioName === scenarioNames.clashingFrontsAtTableOfTheGiants2) {
    return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.forsakenWaters2) {
    return makeForsakenWaters2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.makeMoveRange1HexWalkScenario) {
    return makeMoveRange1HexWalkScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.makeMoveRange1HexFlyEngagedScenario) {
    const withStealth = false
    return makeMoveRange1HexFlyEngagedScenario(
      withStealth,
      numPlayers,
      withPrePlacedUnits
    )
  }
  if (scenarioName === scenarioNames.makeMoveRange2HexFlyEngagedScenario) {
    const withStealth = true
    return makeMoveRange2HexFlyEngagedScenario(
      withStealth,
      numPlayers,
      withPrePlacedUnits
    )
  }
  if (scenarioName === scenarioNames.makeMoveRange2HexWalkScenario) {
    return makeMoveRange2HexWalkScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.makeMoveRangePassThruScenario) {
    const withGhostWalk = true
    return makeMoveRangePassThruScenario(
      withGhostWalk,
      numPlayers,
      withPrePlacedUnits
    )
  }
  if (
    scenarioName === scenarioNames.makeMoveRange1HexFlyEngagedStealthScenario
  ) {
    const withStealth = true
    return makeMoveRange1HexFlyEngagedScenario(
      withStealth,
      numPlayers,
      withPrePlacedUnits
    )
  }
  if (scenarioName === scenarioNames.makeMoveRange1HexFlyScenario) {
    return makeMoveRange1HexFlyScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.makeMoveRange2HexFlyScenario) {
    return makeMoveRange2HexFlyScenario(numPlayers, withPrePlacedUnits)
  }
  if (isDemoGame) {
    return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  // DEFAULT RETURN BELOW::
  return makeDefaultScenario(numPlayers, withPrePlacedUnits)
}
