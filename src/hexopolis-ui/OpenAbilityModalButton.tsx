import { CardAbility, GameArmyCard } from 'game/types'
import { ImZoomIn } from 'react-icons/im'
import { useUIContext } from './contexts'
import { StyledBlueIconButton } from './layout/buttons'

export const OpenAbilityModalButton = ({
  cardAbility,
}: {
  cardAbility: CardAbility
}) => {
  const { openModalAbility } = useUIContext()
  return (
    <StyledBlueIconButton onClick={() => openModalAbility(cardAbility)}>
      <ImZoomIn
        size={'1rem'}
        style={{
          marginRight: '0.4rem ',
          marginLeft: '-1rem',
        }}
      />
      <span>{cardAbility.name}</span>
    </StyledBlueIconButton>
  )
}
export const OpenCardModalButton = ({ card }: { card: GameArmyCard }) => {
  const { openModalCard } = useUIContext()
  return (
    <StyledBlueIconButton onClick={() => openModalCard(card)}>
      <ImZoomIn
        size={'1rem'}
        style={{
          marginRight: '0.4rem ',
          marginLeft: '-1rem',
        }}
      />
      {/* <span>Card info</span> */}
    </StyledBlueIconButton>
  )
}
