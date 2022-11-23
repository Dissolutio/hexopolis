import { useBgioG } from 'bgio-contexts'
import React from 'react'
import { HexGrid, Layout } from 'react-hexgrid'

type ReactHexgridProps = {
  mapSize: number
  width: string | number
  height: string | number
  hexSize: number
  spacing: number
  children: any
}

export const ReactHexgrid = ({
  mapSize,
  width,
  height,
  hexSize,
  spacing,
  children,
}: ReactHexgridProps) => {
  const halfViewBox = mapSize * -50
  const fullViewBox = mapSize * 100
  const {
    hexMap: { flat },
  } = useBgioG()
  return (
    <HexGrid
      width={width}
      height={height}
      viewBox={`${halfViewBox} ${halfViewBox} ${fullViewBox} ${fullViewBox}`}
    >
      <Layout
        size={{
          x: hexSize,
          y: hexSize,
        }}
        flat={flat}
        origin={{ x: 0, y: 0 }}
        spacing={spacing}
      >
        {children}
      </Layout>
    </HexGrid>
  )
}