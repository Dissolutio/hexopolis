import { HEXGRID_SPACING } from 'app/constants'
import { HexMap } from 'game/types'
import * as React from 'react'

type MapContextProviderProps = {
  children: React.ReactNode
  hexMap: HexMap
}

const MapContext = React.createContext<
  | {
      selectedMapHex: string
      selectMapHex: (hexID: string) => void
      viewBoxLength: number
      viewBoxHeight: number
      viewBoxX: number
      viewBoxY: number
      viewBox: string
      scale: number
      onIncrementX: () => void
      onDecrementX: () => void
      onIncrementY: () => void
      onDecrementY: () => void
      onIncreaseLength: () => void
      onDecreaseLength: () => void
      onIncreaseHeight: () => void
      onDecreaseHeight: () => void
      onIncrementScale: () => void
      onDecrementScale: () => void
      // altitudeViewer: number
      // goUpAltitudeViewer: () => void
      // goDownAltitudeViewer: () => void
    }
  | undefined
>(undefined)

export function MapContextProvider({
  children,
  hexMap,
}: MapContextProviderProps) {
  const [selectedMapHex, setSelectedMapHex] = React.useState('')
  const { mapSize, hexSize, mapShape, mapWidth, mapHeight } = hexMap
  const viewbox = calculateViewbox(
    mapShape,
    mapSize,
    mapHeight,
    mapWidth,
    hexSize
  )
  // Map Display
  const [viewBoxLength, setViewBoxLength] = React.useState(viewbox.width)
  const [viewBoxHeight, setViewBoxHeight] = React.useState(viewbox.height)
  const [viewBoxX, setViewBoxX] = React.useState(viewbox.minX)
  const [viewBoxY, setViewBoxY] = React.useState(viewbox.minY)
  const [scale, setScale] = React.useState(10)
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxLength} ${viewBoxHeight}`
  const incrementor = mapSize * scale
  const onIncrementX = () => {
    setViewBoxX((s) => s + incrementor)
  }
  const onDecrementX = () => {
    setViewBoxX((s) => s - incrementor)
  }
  const onIncrementY = () => {
    setViewBoxY((s) => s + incrementor)
  }
  const onDecrementY = () => {
    setViewBoxY((s) => s - incrementor)
  }
  const onIncreaseLength = () => {
    setViewBoxLength((s) => s + incrementor)
  }
  const onDecreaseLength = () => {
    setViewBoxLength((s) => s - incrementor)
  }
  const onIncreaseHeight = () => {
    setViewBoxHeight((s) => s + incrementor)
  }
  const onDecreaseHeight = () => {
    setViewBoxHeight((s) => s - incrementor)
  }
  const onIncrementScale = () => {
    setScale((s) => s * 10)
  }
  const onDecrementScale = () => {
    setScale((s) => s / 10)
  }
  // Altitude viewer
  // const [altitudeViewer, setAltitudeViewer] = React.useState(0)
  // const goUpAltitudeViewer = () => {
  //   setAltitudeViewer((s) => s + 1)
  // }
  // const goDownAltitudeViewer = () => {
  //   if (altitudeViewer > 0) {
  //     setAltitudeViewer((s) => s - 1)
  //   }
  // }

  const selectMapHex = (hexID: string) => {
    setSelectedMapHex(hexID)
  }
  return (
    <MapContext.Provider
      value={{
        selectedMapHex,
        selectMapHex,
        viewBox,
        viewBoxLength,
        viewBoxHeight,
        viewBoxX,
        viewBoxY,
        scale,
        onIncrementX,
        onDecrementX,
        onIncrementY,
        onDecrementY,
        onIncreaseLength,
        onDecreaseLength,
        onIncreaseHeight,
        onDecreaseHeight,
        onIncrementScale,
        onDecrementScale,
        // altitudeViewer,
        // goUpAltitudeViewer,
        // goDownAltitudeViewer,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}
export function useMapContext() {
  const context = React.useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapContextProvider')
  }
  return context
}

const calculateViewbox = (
  mapShape: string,
  mapSize: number,
  mapHeight: number,
  mapWidth: number,
  hexSize: number
): {
  height: number
  minY: number
  width: number
  minX: number
} => {
  const a = (hexSize * Math.sqrt(3)) / 2 // apothem
  let height: number = 100
  let minY: number = -50
  let width: number = 100
  let minX: number = -50
  switch (mapShape) {
    case 'rectangle':
      height = (2 * hexSize + (mapHeight - 1) * 1.5 * hexSize) * HEXGRID_SPACING // 2r+(n-1)1.5r
      minY = -1 * hexSize // -r
      width = (2 * a * mapWidth + (mapHeight > 1 ? a : 0)) * HEXGRID_SPACING // 2an + odd-row shift (a second row of hexes will be shifted further right than the first row)
      minX = -1 * a // -a
      return { minX, minY, width, height }
    case 'hexagon':
      height = 2 * (hexSize + 1.5 * (mapSize * hexSize)) * HEXGRID_SPACING // 2(r + 1.5nr) * (hexgrid spacing)
      minY = (-1 * height) / 2
      width = 2 * a * (2 * mapSize + 1) * HEXGRID_SPACING // 2a(2n+1)
      minX = -1 * a * (2 * mapSize + 1) * HEXGRID_SPACING // -a(1+2n)
      return { minX, minY, width, height }
    case 'shiftedHexagon':
      height = 2 * (hexSize + 1.5 * (mapSize * hexSize)) // 2(r + 1.5nr)
      minY = (-1 * height) / 2
      width = 2 * a * (2 * mapSize + 1) // 2a(2n+1)
      minX = -1 * a // -a
      return { minX, minY, width, height }
    default:
      return { minX, minY, width, height }
  }
}
