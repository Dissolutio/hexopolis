import { ArmyCard, CardAbility, GameArmyCard } from 'game/types'
import * as React from 'react'

type ModalState = {
  modalState: string
  modalAbility?: CardAbility
  modalCard?: GameArmyCard | ArmyCard
}

type UIContextProviderProps = {
  children: React.ReactNode
}

export const modalStates = { off: 'off', ability: 'ability', card: 'card' }

const UIContext = React.createContext<
  | (ModalState & {
      closeModal: () => void
      backModal: () => void
      openModalAbility: (ability: CardAbility) => void
      openModalCard: (card: GameArmyCard | ArmyCard) => void
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
  const initialModalState: ModalState = {
    modalState: modalStates.off,
    modalCard: undefined,
    modalAbility: undefined,
  }
  const [modalState, setModalState] =
    React.useState<ModalState>(initialModalState)
  const closeModal = () => {
    setModalState((s) => ({ ...s, modalState: modalStates.off }))
  }
  const backModal = () => {
    // the idea is that a user would open a card, and THEN open an ability, so back just needs to go from ability to card
    setModalState((s) =>
      s.modalCard ? { ...s, modalState: modalStates.card } : initialModalState
    )
  }
  const openModalAbility = (ability: CardAbility) => {
    setModalState((s) => ({
      ...s,
      modalState: modalStates.ability,
      modalAbility: ability,
    }))
  }
  const openModalCard = (card: GameArmyCard | ArmyCard) => {
    setModalState((s) => ({
      ...s,
      modalState: modalStates.card,
      modalCard: card,
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
        modalState: modalState.modalState,
        modalAbility: modalState.modalAbility,
        modalCard: modalState.modalCard,
        closeModal,
        backModal,
        openModalAbility,
        openModalCard,
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
