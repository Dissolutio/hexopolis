import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { useSpecialAttackContext } from 'hexopolis-ui/contexts/special-attack-context'
import { AbilityReadout } from './FireLineSAControls'

export const ExplosionSAControls = () => {
  const {
    moves: { rollForExplosionSpecialAttack },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { revealedGameCard: attackersCard } = usePlayContext()
  const { boardHexes, gameArmyCards, gameUnits } = useBgioG()
  const {
    selectSpecialAttack,
    singleUnitOfRevealedGameCard: deathwalker9000Unit,
  } = useSpecialAttackContext()
  const goBackToAttack = () => {
    selectSpecialAttack('')
    events?.setStage?.(stageNames.attacking)
  }
  const confirmChosenAttack = () => {
    rollForExplosionSpecialAttack()
  }

  return (
    <>
      <StyledControlsHeaderH2>Explosion Special Attack</StyledControlsHeaderH2>
      <StyledControlsP>Select a target.</StyledControlsP>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Go back to normal attack
        </GreenButton>
        <RedButton
          onClick={confirmChosenAttack}
          //   disabled={!chosenExplosionAttack}
        >
          Launch payload! (confirm selected target)
        </RedButton>
      </StyledButtonWrapper>
      {attackersCard?.abilities?.[0] && (
        <AbilityReadout cardAbility={attackersCard.abilities[0]} />
      )}
    </>
  )
}
