import styled from 'styled-components'
export const GreenButton = styled.button`
  font-size: 0.8rem;
  color: var(--success-green);
  border: 1px solid var(--success-green);
`
export const BigGreenButton = styled(GreenButton)`
  display: block;
  font-size: 1.3rem;
  padding: 20px;
  margin: auto;
`

export const BlueButton = styled.button`
  font-size: 0.8rem;
  line-height: 0.8;
  color: var(--info-blue);
  border: 1px solid var(--info-blue);
`
export const StyledBlueIconButton = styled(BlueButton)`
  display: flex;
  flex-direction: row;
  align-items: center;
`
export const RedButton = styled.button`
  font-size: 0.8rem;
  color: var(--error-red);
  border: 1px solid var(--error-red);
`
