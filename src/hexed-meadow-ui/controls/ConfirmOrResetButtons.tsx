import styled from 'styled-components'

type ConfirmOrResetButtonsProps = {
  confirm: () => void
  reset: () => void
}
export const ConfirmOrResetButtons = ({
  confirm,
  reset,
}: ConfirmOrResetButtonsProps) => {
  return (
    <StyledButtonWrapper>
      <GreenButton onClick={confirm}>Confirm</GreenButton>
      <RedButton onClick={reset}>Reset</RedButton>
    </StyledButtonWrapper>
  )
}
export const GreenButton = styled.button`
  font-size: 0.8rem;
  color: var(--success-green);
  border: 1px solid var(--success-green);
`
export const RedButton = styled.button`
  font-size: 0.8rem;
  color: var(--error-red);
  border: 1px solid var(--error-red);
`
export const StyledButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin-top: 20px;
`
