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
      onIncrementX: () => void
      onDecrementX: () => void
      onIncrementY: () => void
      onDecrementY: () => void
      onIncreaseLength: () => void
      onDecreaseLength: () => void
      onIncreaseHeight: () => void
      onDecreaseHeight: () => void
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
  const [viewBoxLength, setViewBoxLength] = React.useState(mapSize * 100)
  const [viewBoxHeight, setViewBoxHeight] = React.useState(mapSize * 100)
  const [viewBoxX, setViewBoxX] = React.useState(mapSize * -40)
  const [viewBoxY, setViewBoxY] = React.useState(mapSize * -40)
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxLength} ${viewBoxHeight}`
  const onIncrementX = () => {
    setViewBoxX((s) => s + 100)
  }
  const onDecrementX = () => {
    setViewBoxX((s) => s - 100)
  }
  const onIncrementY = () => {
    setViewBoxY((s) => s + 100)
  }
  const onDecrementY = () => {
    setViewBoxY((s) => s - 100)
  }
  const onIncreaseLength = () => {
    setViewBoxLength((s) => s + 100)
  }
  const onDecreaseLength = () => {
    setViewBoxLength((s) => s - 100)
  }
  const onIncreaseHeight = () => {
    setViewBoxHeight((s) => s + 100)
  }
  const onDecreaseHeight = () => {
    setViewBoxHeight((s) => s - 100)
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
        onIncrementX,
        onDecrementX,
        onIncrementY,
        onDecrementY,
        onIncreaseLength,
        onDecreaseLength,
        onIncreaseHeight,
        onDecreaseHeight,
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
