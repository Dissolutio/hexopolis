import { SVG_HEX_RADIUS } from 'app/constants'
import * as React from 'react'
import styled from 'styled-components'

export type Props = {
  children: string | React.ReactNode | React.ReactNode[]
  hexSize: number
  x?: string | number
  y?: string | number
  className?: string
  style?: React.CSSProperties
} & React.SVGProps<SVGTextElement>

export function HexText(props: Props) {
  const { children, x, y, className, style } = props
  return (
    <StyledText
      hexSize={SVG_HEX_RADIUS}
      x={x !== undefined ? x : 0}
      y={y !== undefined ? y : '0.3em'}
      textAnchor="middle"
      className={className}
      style={style}
    >
      {children}
    </StyledText>
  )
}
type StyledTextProps = React.SVGProps<SVGTextElement> & {
  hexSize: number
}
const StyledText = styled.text<StyledTextProps>`
  font-size: ${(props) => `${props.hexSize / 75}rem`};
`
