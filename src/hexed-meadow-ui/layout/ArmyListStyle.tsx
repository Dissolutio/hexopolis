import styled from 'styled-components'

export const ArmyListStyle = styled.div`
  display: flex;
  flex-flow: column nowrap;
  color: var(--player-color);
  h2 {
    font-size: 1.3rem;
    margin: 0;
    text-align: center;
  }
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
  .order-marker__unplaced {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    flex-grow: 1;
    list-style-type: none;
    margin: 0;
    padding: 0;
    li {
      font-size: 2rem;
      padding: 0 1rem;
    }
  }
  .om-army-cards {
    display: flex;
    flex-flow: row wrap;
    flex-grow: 1;
    list-style-type: none;
    margin: 0;
    padding: 0;
    li {
      font-size: 2rem;
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
