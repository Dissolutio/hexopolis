import { GreenButton, RedButton } from 'hexed-meadow-ui/layout/buttons'
import styled from 'styled-components'

type ConfirmOrResetButtonsProps = {
  confirm: () => void
  reset?: () => void
  noResetButton?: boolean
  confirmText?: string
}
export const ConfirmOrResetButtons = ({
  confirm,
  reset,
  noResetButton,
  confirmText,
}: ConfirmOrResetButtonsProps) => {
  return (
    <StyledButtonWrapper>
      <GreenButton onClick={confirm}>
        {confirmText ? confirmText : 'Confirm'}
      </GreenButton>
      {noResetButton ? null : <RedButton onClick={reset}>Reset</RedButton>}
    </StyledButtonWrapper>
  )
}

export const StyledButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin-top: 20px;
`
