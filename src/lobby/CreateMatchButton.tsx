import { useMultiplayerLobby } from './useMultiplayerLobby'

export function CreateMatchButton() {
  // NOTE: This will create a game with 2 players, for now, using a const named MYGAME_NUMPLAYERS
  const { createMatchError, handleCreateMatchButton } = useMultiplayerLobby()
  return (
    <div>
      {/* // NOTE: This will create a game with 2 players, for now, using a const named MYGAME_NUMPLAYERS */}
      <button onClick={handleCreateMatchButton}>Create 2-player match</button>
      {createMatchError && (
        <span style={{ color: 'red' }}>
          Sorry! Failed to create match: {`${createMatchError}`}
        </span>
      )}
    </div>
  )
}
