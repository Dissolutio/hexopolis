import * as React from 'react'

type UIContextProviderProps = {
  children: React.ReactNode
}

export const modalStates = { off: 'off', ability: 'ability' }

const UIContext = React.createContext<
  | {
      selectedUnitID: string
      setSelectedUnitID: React.Dispatch<React.SetStateAction<string>>
      selectedGameCardID: string
      setSelectedGameCardID: React.Dispatch<React.SetStateAction<string>>
      indexOfLastShownToast: number
      setIndexOfLastShownToast: React.Dispatch<React.SetStateAction<number>>
    }
  | undefined
>(undefined)

export function UIContextProvider({ children }: UIContextProviderProps) {
  const [indexOfLastShownToast, setIndexOfLastShownToast] = React.useState(0)
  const [selectedUnitID, setSelectedUnitID] = React.useState('')
  const [selectedGameCardID, setSelectedGameCardID] = React.useState('')
  return (
    <UIContext.Provider
      value={{
        selectedUnitID,
        setSelectedUnitID,
        selectedGameCardID,
        setSelectedGameCardID,
        indexOfLastShownToast,
        setIndexOfLastShownToast,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUIContext() {
  const context = React.useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIContextProvider')
  }
  return context
}
