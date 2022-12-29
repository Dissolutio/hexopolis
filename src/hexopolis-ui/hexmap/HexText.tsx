import * as React from 'react'

export type Props = {
  children: string | React.ReactNode | React.ReactNode[]
  x?: string | number
  y?: string | number
  className?: string
} & React.SVGProps<SVGTextElement>

export function HexText(props: Props) {
  const { children, x, y, ...rest } = props
  return (
    <text x={x || 0} y={y ? y : '0.3em'} textAnchor="middle" {...rest}>
      {children}
    </text>
  )
}
