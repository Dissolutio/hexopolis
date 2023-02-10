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
import { selectGameCardByID, selectUnitForHex } from 'game/selectors'
import { noop, uniqBy } from 'lodash'

export const GrenadeSAControls = () => {
  const {
    moves: { rollForExplosionSpecialAttack },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { revealedGameCard: attackersCard } = usePlayContext()
  const { selectedUnit } = usePlayContext()
  const { boardHexes, gameArmyCards, gameUnits } = useBgioG()
  const { selectSpecialAttack, chosenExplosionAttack } =
    useSpecialAttackContext()

  const goBackToAttack = () => {
    selectSpecialAttack('')
    events?.setStage?.(stageNames.attacking)
  }
  const confirmChosenAttack = () => {
    noop()
    rollForExplosionSpecialAttack({
      attackerUnitID: selectedUnit.unitID,
      chosenExplosionAttack,
      grenadeThrowingGameCardID: attackersCard?.gameCardID ?? '',
    })
  }

  return (
    <>
      <StyledControlsHeaderH2>Grenade Special Attack</StyledControlsHeaderH2>
      <StyledControlsP>
        Select an attacker, then select a target, then confirm.
      </StyledControlsP>

      {/* <StyledControlsP>
        The current path will hit {affectedUnitNamesDisplay}
      </StyledControlsP> */}

      {/* {friendlyAffectedUnitsCount > 0 && (
        <StyledControlsP style={{ color: 'var(--error-red)' }}>
          {`${friendlyAffectedUnitsCount} FRIENDLY UNIT${
            friendlyAffectedUnitsCount === 1 ? '' : 'S'
          } WILL BE HIT`}
        </StyledControlsP>
      )} */}

      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Go back to normal attack
        </GreenButton>
        <RedButton
          onClick={confirmChosenAttack}
          //   disabled={!chosenExplosionAttack}
          disabled={true}
        >
          Grenade out! (confirm selected target)
        </RedButton>
      </StyledButtonWrapper>
      {attackersCard?.abilities?.[0] && (
        <AbilityReadout cardAbility={attackersCard.abilities[0]} />
      )}
    </>
  )
}
