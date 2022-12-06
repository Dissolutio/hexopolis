import { GreenButton, RedButton } from 'hexed-meadow-ui/layout/buttons'
import styled from 'styled-components'

type ConfirmOrResetButtonsProps = {
  confirm?: () => void
  confirmText?: string
  reset?: () => void
  resetText?: string
  noResetButton?: boolean
  noConfirmButton?: boolean
}
export const ConfirmOrResetButtons = ({
  confirm,
  confirmText,
  noConfirmButton,
  reset,
  resetText,
  noResetButton,
}: ConfirmOrResetButtonsProps) => {
  return (
    <StyledButtonWrapper>
      {noConfirmButton ? null : (
        <GreenButton onClick={confirm}>
          {confirmText ? confirmText : 'Confirm'}
        </GreenButton>
      )}
      {noResetButton ? null : (
        <RedButton onClick={reset}>{resetText ? resetText : 'Reset'}</RedButton>
      )}
    </StyledButtonWrapper>
  )
}

export const StyledButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin-top: 20px;
`
