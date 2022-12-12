export type Roll = {
  playerID: string
  roll: number
}

type InitiativeResult = {
  rolls: Roll[][]
  initiative: string[]
}

export function rollD20Initiative(playerIDs: string[]): InitiativeResult {
  const initialRolls: Roll[] = genRolls(playerIDs)
  return initialRolls.reduce(rollsToInitiative, {
    rolls: [initialRolls],
    initiative: [],
  })
}

function rollsToInitiative(
  result: InitiativeResult,
  curr: Roll,
  i: number,
  arr: Roll[]
): InitiativeResult {
  // Player already in initiative result? Move on
  if (result.initiative.find((elem) => elem === curr.playerID)) {
    return result
  }
  // Player has tied other player(s) ? Settle tie, add all involved to initiative
  const tiedRolls = arr.filter((rollObj) => rollObj.roll === curr.roll)
  if (tiedRolls.length >= 2) {
    const tiedPlayers = tiedRolls.map((rollObj) => rollObj.playerID)
    const newRollsForTiedPlayers = genRolls(tiedPlayers)
    const initiativeFromTieBreaker = newRollsForTiedPlayers.reduce(
      rollsToInitiative,
      { rolls: [...result.rolls, newRollsForTiedPlayers], initiative: [] }
    )
    return {
      ...result,
      initiative: [
        ...result.initiative,
        ...initiativeFromTieBreaker.initiative,
      ],
    }
  } else {
    return { ...result, initiative: [...result.initiative, curr.playerID] }
  }
}
function genRolls(players: string[]): Roll[] {
  const rolls = players.map(function (playerID) {
    return { playerID: playerID, roll: rollDie(20) }
  })
  return rolls.sort(highToLow)
}

function highToLow(a: Roll, b: Roll) {
  if (a.roll > b.roll) {
    return -1
  }
  if (a.roll < b.roll) {
    return 1
  }
  // a.roll === b.roll
  return 0
}
function rollDie(sides = 6) {
  return 1 + Math.floor(Math.random() * sides)
}
