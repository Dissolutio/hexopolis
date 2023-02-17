export const scenarioNames = {
  clashingFrontsAtTableOfTheGiants2: 'clashingFrontsAtTableOfTheGiants2',
  clashingFrontsAtTableOfTheGiants4: 'clashingFrontsAtTableOfTheGiants4',
  theBigHexagon2: 'theBigHexagon2',
  theBigHexagon3: 'theBigHexagon3',
  theBigHexagon4: 'theBigHexagon4',
  theBigHexagon5: 'theBigHexagon5',
  theBigHexagon6: 'theBigHexagon6',
}

export const hexoscapeScenarios = {
  [scenarioNames.clashingFrontsAtTableOfTheGiants2]: {
    numPlayers: 2,
    description: `The Table of the Giants has long been a meeting place-but this one was unexpected. Two enemy Valkerie Gernerals' armies have been marching in this direction all winter, unknowingly on a major collision course. In the end, which side will be left to march on to their destination?`,
    armyPoints: 400,
    maxRounds: 12,
  },
  [scenarioNames.theBigHexagon2]: {
    numPlayers: 2,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.theBigHexagon3]: {
    numPlayers: 3,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.theBigHexagon4]: {
    numPlayers: 4,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.theBigHexagon5]: {
    numPlayers: 5,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.theBigHexagon6]: {
    numPlayers: 6,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.clashingFrontsAtTableOfTheGiants4]: {
    numPlayers: 4,
    // naming like this, so that in future we might have two team types, like a team of 1 player versus a team of 3 players [1, 3]
    teams: [2, 2],
    description: `The Table of the Giants has long been a meeting place-but this one was unexpected. Two enemy Valkerie Gernerals' armies have been marching in this direction all winter, unknowingly on a major collision course. In the end, which side will be left to march on to their destination?`,
    armyPoints: 300,
    maxRounds: 12,
  },
}
