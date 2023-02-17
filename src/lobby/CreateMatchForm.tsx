import { scenarioNames } from 'game/setup/scenarios'
import { useState } from 'react'
import { useMultiplayerLobby } from './useMultiplayerLobby'

export function CreateMatchForm() {
  const { handleCreateMatch } = useMultiplayerLobby()
  //   const [matchName, setMatchName] = useState('')
  const [scenarioName, setScenarioName] = useState(
    scenarioNames.clashingFrontsAtTableOfTheGiants2
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
      <p>Currently there is only one map/scenario, and it is for 2 players</p>
      These are the available characters:
      <ul>
        <li>Krav Maga Agents</li>
        <li>Tarn Viking Warriors</li>
        <li>Airborn Elite</li>
        <li>Izumi Samurari</li>
        <li>Marro Warriors</li>
        <li>Zettian Guards</li>
        <li>Grimnak</li>
        <li>Ne-Gok-Sa</li>
        <li>Agent Carr</li>
        <li>Thorgrim</li>
        <li>Syvarris</li>
        <li>Sgt. Drake Alexander</li>
        <li>Deathwalker 9000</li>
        <li>Mimring</li>
        <li>Finn the Viking Champion</li>
        <li>Raelin the Kyrie Warrior</li>
      </ul>
      <label htmlFor="numPlayersSelect">Select map/scenario:</label>
      <select
        name="numPlayersSelect"
        value={scenarioName}
        onChange={handleChange}
        id="numPlayersSelect"
      >
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
