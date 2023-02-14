import { useState } from 'react'
import { CreateMatchButton } from './CreateMatchButton'

export function CreateMatchForm() {
  const [matchName, setMatchName] = useState('')
  const [numPlayers, setNumPlayers] = useState(2)
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    alert(`The name you entered was: ${matchName}`)
  }

  return (
    <form onSubmit={handleSubmit} id="createMatchForm">
      <label>
        Enter your name:
        <input
          type="text"
          value={matchName}
          onChange={(e) => setMatchName(e.target.value)}
        />
      </label>

      <label htmlFor="numPlayersSelect">Number of players:</label>
      <select name="pets" id="numPlayersSelect">
        <option value={2}>2 players</option>
        {/* <option value={3}>3 players</option> */}
        <option value={4}>4 players</option>
        {/* <option value={5}>5 players</option> */}
        {/* <option value={6}>6 players</option> */}
      </select>
      <CreateMatchButton />
    </form>
  )
}
