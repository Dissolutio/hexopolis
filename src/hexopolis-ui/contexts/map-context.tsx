import * as React from 'react'

type MapContextProviderProps = {
  children: React.ReactNode
  mapSize: number
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
  mapSize,
}: MapContextProviderProps) {
  const [selectedMapHex, setSelectedMapHex] = React.useState('')
  // Map Display
  // TODO these initial viewBox values should be calculated much better: something that grasps the map's size, draws a rectangle around it, and then scales it to fit the screen
  // -100 0 3000 1000 this is good default for giants table on 500x500 screen
  const [viewBoxLength, setViewBoxLength] = React.useState(mapSize * 100)
  const [viewBoxHeight, setViewBoxHeight] = React.useState(mapSize * 100)
  const [viewBoxX, setViewBoxX] = React.useState(mapSize * -40)
  const [viewBoxY, setViewBoxY] = React.useState(mapSize * -40)
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
