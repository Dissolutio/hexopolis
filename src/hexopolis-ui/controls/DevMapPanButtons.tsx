import styled from 'styled-components'
import { ImMinus, ImPlus } from 'react-icons/im'
import { useMapContext } from 'hexopolis-ui/contexts'

export const DevMapPanButtons = () => {
  const {
    viewBoxLength,
    viewBoxHeight,
    viewBoxX,
    viewBoxY,
    onIncrementX,
    onDecrementX,
    onIncrementY,
    onDecrementY,
    onIncreaseLength,
    onDecreaseLength,
    onIncreaseHeight,
    onDecreaseHeight,
  } = useMapContext()
  return (
    <StyledSection>
      <h4>Adjust the map:</h4>
      <StyledMapButton aria-label="- X" onClick={onDecrementX}>
        <ImMinus color="var(--white)" />
        <span>X</span>
      </StyledMapButton>
      <span>X: {viewBoxX}</span>
      <StyledMapButton aria-label="+ X" onClick={onIncrementX}>
        <ImPlus color="var(--white)" />
        <span>X</span>
      </StyledMapButton>
      <StyledMapButton aria-label="- Y" onClick={onDecrementY}>
        <ImMinus color="var(--white)" />
        <span>Y</span>
      </StyledMapButton>
      <span>Y: {viewBoxY}</span>
      <StyledMapButton aria-label="+ Y" onClick={onIncrementY}>
        <ImPlus color="var(--white)" />
        <span>Y</span>
      </StyledMapButton>
      <StyledMapButton aria-label="- length" onClick={onDecreaseLength}>
        <ImMinus color="var(--white)" />
        <span>Length</span>
      </StyledMapButton>
      <span>Length: {viewBoxLength}</span>
      <StyledMapButton aria-label="+ length" onClick={onIncreaseLength}>
        <ImPlus color="var(--white)" />
        <span>Length</span>
      </StyledMapButton>
      <StyledMapButton aria-label="- height" onClick={onDecreaseHeight}>
        <ImMinus color="var(--white)" />
        <span>Height</span>
      </StyledMapButton>
      <span>Height: {viewBoxHeight}</span>
      <StyledMapButton aria-label="+ height" onClick={onIncreaseHeight}>
        <ImPlus color="var(--white)" />
        <span>Height</span>
      </StyledMapButton>
    </StyledSection>
  )
}
const StyledSection = styled.section`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 1em 0;
  h4 {
    padding: 5px;
    margin: 0;
    font-size: 1rem;
  }
`
const StyledMapButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-size: 0.8rem;
  @media screen and (max-width: 1100px) {
    font-size: 0.6rem;
  }
  @media screen and (max-width: 600px) {
    font-size: 0.4rem;
  }
  svg {
    width: 20px;
    height: 20px;
    @media screen and (max-width: 1100px) {
      width: 18px;
      height: 18px;
    }
    @media screen and (max-width: 600px) {
      width: 14px;
      height: 14px;
    }
  }
`
