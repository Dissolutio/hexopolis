import styled from 'styled-components'
const playerIdsTContourBackgroundFile: { [player: string]: string } = {
  '0': 'beesContourBG.svg',
  '1': 'purpleContourBG.svg',
}
type LayoutContainerProps = {
  playerID: string
}
export const LayoutContainer = styled.div<LayoutContainerProps>`
  // SET CSS VARS
  --player-color: ${(props) => props.theme.playerColor};
  --player-bg: ${(props) => playerIdsTContourBackgroundFile[props.playerID]};
  --navbar-height: 30px;
  --muted-text: ${(props) => props.theme.colors.gray};
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  color: var(--player-color);
  // formatting the line below breaks it, no idea why (You must cut the line below, save, then paste it back and save without formatting, only then will you have a working and formatted file)
  background-image: url("${props => playerIdsTContourBackgroundFile[props.playerID]}");
`
