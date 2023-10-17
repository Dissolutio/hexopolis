import styled from 'styled-components'

type LayoutContainerProps = {
  playerID: string
}
export const LayoutContainer = styled.div<LayoutContainerProps>`
  // SET CSS VARS
  --player-color: ${(props) => props.theme.playerColor};
  --navbar-height: 30px;
  --muted-text: ${(props) => props.theme.colors.gray};
  /* position: relative; */
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  padding: 0;
  margin: 0;
  color: var(--player-color);
`
