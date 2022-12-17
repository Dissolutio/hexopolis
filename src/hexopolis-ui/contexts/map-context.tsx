import * as React from 'react'

const MapContext = React.createContext<
  | {
      selectedMapHex: string
      setSelectedMapHex: React.Dispatch<React.SetStateAction<string>>
    }
  | undefined
>(undefined)

type MapContextProviderProps = {
  children: React.ReactNode
}

export function MapContextProvider({ children }: MapContextProviderProps) {
  const [selectedMapHex, setSelectedMapHex] = React.useState('')
  return (
    <MapContext.Provider value={{ selectedMapHex, setSelectedMapHex }}>
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
