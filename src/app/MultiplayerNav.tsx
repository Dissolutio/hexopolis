import { useAuth } from 'hooks'
import { NavLink } from 'react-router-dom'

export const MultiplayerNav = () => {
  const { storedCredentials } = useAuth()
  const isJoinedInMatch = Boolean(storedCredentials.matchID)
  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/">Multiplayer Lobby</NavLink>
        </li>
        <li>
          <NavLink to="/demo">Demo Game</NavLink>
        </li>
        {isJoinedInMatch ? (
          <li>
            <NavLink to="/play" reloadDocument>
              Play
            </NavLink>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
