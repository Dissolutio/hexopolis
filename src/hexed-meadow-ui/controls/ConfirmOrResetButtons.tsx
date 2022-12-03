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
          display: 'inline-block',
          marginTop: '20px',
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
          display: 'inline-block',
          marginTop: '20px',
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
  max-width: 300px;
  margin: 0 auto;
`
