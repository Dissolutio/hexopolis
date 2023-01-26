import * as React from 'react'
import styled from 'styled-components'

export type Props = {
  children: string | React.ReactNode | React.ReactNode[]
  hexSize: number
  x?: string | number
  y?: string | number
  className?: string
} & React.SVGProps<SVGTextElement>

export function HexText(props: Props) {
  const { children, hexSize, x, y } = props
  return (
    <StyledText
      hexSize={hexSize}
      x={x || 0}
      y={y ? y : '0.3em'}
      textAnchor="middle"
    >
      {children}
    </StyledText>
  )
}
type StyledTextProps = React.SVGProps<SVGTextElement> & {
  hexSize: number
}
const StyledText = styled.text<StyledTextProps>`
  fill: var(--sub-white);
  font-size: ${(props) => `${props.hexSize / 75}rem`};
`
