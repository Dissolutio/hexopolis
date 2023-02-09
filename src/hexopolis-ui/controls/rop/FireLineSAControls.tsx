import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { CardAbility } from 'game/types'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { useSpecialAttackContext } from 'hexopolis-ui/contexts/special-attack-context'
import { uniqBy } from 'lodash'
import { selectGameCardByID, selectUnitForHex } from 'game/selectors'

export const FireLineControls = () => {
  const {
    moves: { rollForFireLineSpecialAttack },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { revealedGameCard: mimringsCard } = usePlayContext()
  const { boardHexes, gameArmyCards, gameUnits } = useBgioG()
  const {
    chosenFireLineAttack,
    selectedFireLinePathHexIDs,
    unitFireLining,
    selectSpecialAttack,
  } = useSpecialAttackContext()
  const affectedUnits = uniqBy(
    selectedFireLinePathHexIDs
      .map((id) => {
        const hex = boardHexes[id]
        const unit = selectUnitForHex(hex.id, boardHexes, gameUnits)
        const card = selectGameCardByID(gameArmyCards, unit?.gameCardID ?? '')
        if (!card || !unit || !hex) {
          return undefined
        }
        return { ...unit, singleName: card?.singleName }
      })
      .filter((unit) => !!unit),
    'unitID'
  )
  const friendlyAffectedUnitsCount = affectedUnits.filter((unit) => {
    return unit?.playerID === unitFireLining?.playerID
  }).length
  const affectedSelectedUnitNames = affectedUnits.map((unit) => {
    return unit?.singleName ?? ''
  })
  const affectedUnitNamesDisplay = `${affectedSelectedUnitNames.length} unit${
    affectedSelectedUnitNames.length !== 1 ? 's' : ''
  } ${
    affectedSelectedUnitNames.length > 0
      ? `(${affectedSelectedUnitNames.join(', ')})`
      : ''
  }
      `
  const goBackToAttack = () => {
    selectSpecialAttack('')
    events?.setStage?.(stageNames.attacking)
  }
  const affectedUnitIDs = affectedUnits.map((unit) => {
    return unit?.unitID ?? ''
  })
  const confirmChosenAttack = () => {
    rollForFireLineSpecialAttack({
      chosenFireLineAttack,
      affectedUnitIDs,
      attackerUnitID: unitFireLining?.unitID,
    })
  }

  return (
    <>
      <StyledControlsHeaderH2>Fire Line Special Attack</StyledControlsHeaderH2>
      <StyledControlsP>
        Select a green hex to choose that attack path.
      </StyledControlsP>
      <StyledControlsP>
        The current path will hit {affectedUnitNamesDisplay}
      </StyledControlsP>
      {friendlyAffectedUnitsCount > 0 && (
        <StyledControlsP style={{ color: 'var(--error-red)' }}>
          {`${friendlyAffectedUnitsCount} FRIENDLY UNIT${
            friendlyAffectedUnitsCount === 1 ? '' : 'S'
          } WILL BE HIT`}
        </StyledControlsP>
      )}
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Go back to normal attack
        </GreenButton>
        <RedButton
          onClick={confirmChosenAttack}
          disabled={!chosenFireLineAttack}
        >
          Flame on! (confirm selected attack path)
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
      style={{
        padding: '1rem 0.5rem',
        color: 'var(--text-muted)',
        maxWidth: '800px',
      }}
    >{`${cardAbility.name}: ${cardAbility.desc}`}</StyledControlsP>
  )
}
