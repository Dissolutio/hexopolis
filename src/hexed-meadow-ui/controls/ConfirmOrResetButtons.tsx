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
      <button
        onClick={confirm}
        style={{
          fontSize: '0.8rem',
          color: 'var(--success-green)',
          border: '1px solid var(--success-green)',
        }}
      >
        Confirm
      </button>
      <button
        onClick={reset}
        style={{
          fontSize: '0.8rem',
          color: 'var(--error-red)',
          border: '1px solid var(--error-red)',
        }}
      >
        Reset
      </button>
    </StyledButtonWrapper>
  )
}
const StyledButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin-top: 20px;
`
