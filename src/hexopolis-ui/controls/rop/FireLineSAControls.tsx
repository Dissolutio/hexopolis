import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { BoardHex, CardAbility } from 'game/types'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { noop } from 'lodash'

export type PossibleAttack = {
  affectedUnitIDs: string[]
  clickableHexID: string
  direction: number
  line: BoardHex[]
}

export const FireLineControls = () => {
  const {
    moves: { rollForFireLineSpecialAttack },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { revealedGameCard: mimringsCard } = usePlayContext()

  const goBackToAttack = () => {
    events?.setStage?.(stageNames.attacking)
  }

  return (
    <>
      <StyledControlsHeaderH2>Fire Line Special Attack</StyledControlsHeaderH2>
      <></>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Go back to normal attack
        </GreenButton>
        {}
        <RedButton onClick={noop}>
          Flame on! (confirm selected attack)
        </RedButton>
      </StyledButtonWrapper>
      {mimringsCard?.abilities?.[0] && (
        <AbilityReadout cardAbility={mimringsCard.abilities[0]} />
      )}
    </>
  )
}

export const AbilityReadout = ({
  cardAbility,
}: {
  cardAbility: CardAbility
}) => {
  return (
    <StyledControlsP
      style={{ color: 'var(--text-muted)', maxWidth: '800px' }}
    >{`${cardAbility.name}: ${cardAbility.desc}`}</StyledControlsP>
  )
}
