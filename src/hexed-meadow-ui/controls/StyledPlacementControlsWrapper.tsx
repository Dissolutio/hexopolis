import styled from 'styled-components'

export const StyledPlacementControlsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  color: var(--player-color);
  button {
    color: var(--player-color);
  }
  ul {
    display: flex;
    flex-flow: row wrap;
    flex-grow: 1;
    list-style-type: none;
    margin: 0;
    padding: 0;
    li {
      padding: 0.3rem;
    }
  }
  button {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-content: center;
    background: var(--black);
    width: 100%;
    height: 100%;
    color: var(--player-color);
    border: 0.1px solid var(--player-color);
  }
  img {
    width: auto;
  }
`
