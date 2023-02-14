import { CardAbility } from 'game/types'
import * as React from 'react'

type UIState = {
  modalState: string
  modalAbility: CardAbility
}

type UIContextProviderProps = {
  children: React.ReactNode
}

export const modalStates = { off: 'off', ability: 'ability' }

const UIContext = React.createContext<
  | (UIState & {
      closeModal: () => void
      openModalAbility: (ability: CardAbility) => void
      selectedUnitID: string
      setSelectedUnitID: React.Dispatch<React.SetStateAction<string>>
      selectedGameCardID: string
      setSelectedGameCardID: React.Dispatch<React.SetStateAction<string>>
      indexOfLastShownToast: number
      setIndexOfLastShownToast: React.Dispatch<React.SetStateAction<number>>
    })
  | undefined
>(undefined)

export function UIContextProvider({ children }: UIContextProviderProps) {
  const [indexOfLastShownToast, setIndexOfLastShownToast] = React.useState(0)
  const [selectedUnitID, setSelectedUnitID] = React.useState('')
  const [selectedGameCardID, setSelectedGameCardID] = React.useState('')
  // modal state
  const initialModalState = {
    modalState: modalStates.off,
    modalAbility: {
      name: '',
      desc: '',
    },
  }
  const [clientState, setClientState] = React.useState(initialModalState)
  const closeModal = () => {
    setClientState((s) => ({ ...s, modalState: modalStates.off }))
  }
  const openModalAbility = (ability: CardAbility) => {
    setClientState((s) => ({
      ...s,
      modalState: modalStates.ability,
      modalAbility: ability,
    }))
  }
  return (
    <UIContext.Provider
      value={{
        selectedUnitID,
        setSelectedUnitID,
        selectedGameCardID,
        setSelectedGameCardID,
        indexOfLastShownToast,
        setIndexOfLastShownToast,
        modalState: clientState.modalState,
        modalAbility: clientState.modalAbility,
        closeModal,
        openModalAbility,
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
