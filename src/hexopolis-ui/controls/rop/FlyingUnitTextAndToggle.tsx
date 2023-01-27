import { usePlayContext } from 'hexopolis-ui/contexts'
import { StyledControlsP } from 'hexopolis-ui/layout/Typography'
import styled from 'styled-components'

type Props = {
  hasFlying: boolean
  hasStealth: boolean
  revealedGameCardName: string
}

export const FlyingUnitTextAndToggle = ({
  hasFlying,
  hasStealth,
  revealedGameCardName,
}: Props) => {
  const { isWalkingFlyer, toggleIsWalkingFlyer } = usePlayContext()
  const abilityText = hasFlying
    ? hasStealth
      ? 'Stealth Flying'
      : 'Flying'
    : ''
  if (hasFlying || hasStealth) {
    return (
      <>
        <StyledControlsP>{`${revealedGameCardName} has ${abilityText}, but may walk:`}</StyledControlsP>
        <StyledToggleWrapper>
          <span
            onChange={toggleIsWalkingFlyer}
            style={!isWalkingFlyer ? { color: 'var(--muted-text)' } : {}}
          >
            Walking
          </span>
          <div className="switch">
            <input
              type="checkbox"
              id="toggleAll"
              checked={!isWalkingFlyer}
              onChange={toggleIsWalkingFlyer}
            />
            <label htmlFor="toggleAll"></label>
          </div>
          <span style={isWalkingFlyer ? { color: 'var(--muted-text)' } : {}}>
            Flying
          </span>
        </StyledToggleWrapper>
      </>
    )
  }
  return null
}

const StyledToggleWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
  .switch {
    display: inline-flex;
    margin: 0 10px;
  }
  .switch input[type='checkbox'] {
    height: 0;
    width: 0;
    visibility: hidden;
  }
  .switch input[type='checkbox']:checked + label {
    background: green;
  }
  .switch input[type='checkbox']:checked + label::after {
    left: calc(100% - 4px);
    transform: translateX(-100%);
  }
  .switch label {
    cursor: pointer;
    width: 48px;
    height: 24px;
    background: grey;
    display: block;
    border-radius: 24px;
    position: relative;
  }
  .switch label::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 16px;
    transition: 0.3s;
  }
`
