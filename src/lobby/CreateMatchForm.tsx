import { scenarioNames } from 'game/setup/scenarios'
import { useState } from 'react'
import { useMultiplayerLobby } from './useMultiplayerLobby'

export function CreateMatchForm() {
  const { handleCreateMatch } = useMultiplayerLobby()
  //   const [matchName, setMatchName] = useState('')
  const [scenarioName, setScenarioName] = useState(
    scenarioNames.forsakenWaters2
  )
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    handleCreateMatch(scenarioName)
    event.preventDefault()
  }
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setScenarioName(event.target.value)
  }
  return (
    <form onSubmit={handleSubmit} id="createMatchForm">
      {/* <label>
        Enter a name for your match:
        <input
          type="text"
          value={matchName}
          onChange={(e) => setMatchName(e.target.value)}
        />
      </label> */}
      <label htmlFor="numPlayersSelect">Select map/scenario:</label>
      <select
        name="numPlayersSelect"
        value={scenarioName}
        onChange={handleChange}
        id="numPlayersSelect"
      >
        <option value={scenarioNames.forsakenWaters2}>
          2 players: Forsaken Waters
        </option>
        <option value={scenarioNames.clashingFrontsAtTableOfTheGiants2}>
          2 players: Clashing Fronts at The Table of the Giants
        </option>
        {/* <option value={scenarioNames.theBigHexagon2}>
          2 players: The Big Hexagon
        </option>
        <option value={scenarioNames.theBigHexagon3}>
          3 players: The Big Hexagon
        </option>
        <option value={scenarioNames.theBigHexagon4}>
          4 players: The Big Hexagon
        </option>
        <option value={scenarioNames.theBigHexagon5}>
          5 players: The Big Hexagon
        </option>
        <option value={scenarioNames.theBigHexagon6}>
          6 players: The Big Hexagon
        </option> */}
      </select>
      <button type="submit">Create Match</button>
    </form>
  )
}
