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
import { selectGameCardByID, selectUnitForHex } from 'game/selectors'
import { uniqBy } from 'lodash'
import { OpenAbilityModalButton } from 'hexopolis-ui/OpenAbilityModalButton'

export const ExplosionSAControls = () => {
  const {
    moves: { rollForExplosionSpecialAttack },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { revealedGameCard } = usePlayContext()
  const ability = revealedGameCard?.abilities[0]
  const { boardHexes, gameArmyCards, gameUnits } = useBgioG()
  const {
    selectSpecialAttack,
    singleUnitOfRevealedGameCard: deathwalker9000Unit,
    explosionAffectedHexIDs,
    chosenExplosionAttack,
  } = useSpecialAttackContext()

  const affectedUnits = uniqBy(
    explosionAffectedHexIDs
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
    return unit?.playerID === deathwalker9000Unit?.playerID
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
  const confirmChosenAttack = () => {
    rollForExplosionSpecialAttack({
      attackerUnitID: deathwalker9000Unit?.unitID ?? '',
      chosenExplosionAttack,
    })
  }

  return (
    <>
      <StyledControlsHeaderH2>Explosion Special Attack</StyledControlsHeaderH2>
      <StyledControlsP>Select a target.</StyledControlsP>
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
          //   disabled={!chosenExplosionAttack}
        >
          Launch payload! (confirm selected target)
        </RedButton>
      </StyledButtonWrapper>
      {ability && (
        <StyledButtonWrapper>
          <OpenAbilityModalButton cardAbility={ability} />
        </StyledButtonWrapper>
      )}
    </>
  )
}
