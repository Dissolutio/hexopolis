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
  const { boardHexes, gameUnits, gameArmyCards, unitsAttacked } = useBgioG()
  const { revealedGameCard: attackersCard } = usePlayContext()
  const { selectedUnit, revealedGameCardUnitIDs } = usePlayContext()
  const {
    selectSpecialAttack,
    chosenExplosionAttack,
    explosionAffectedHexIDs,
  } = useSpecialAttackContext()
  const unitsAliveCount = revealedGameCardUnitIDs.length
  const attacksUsed = Object.values(unitsAttacked).flat().length
  const isNoAttacksUsed = attacksUsed <= 0
  const unitAlreadyAttacked = Object.keys(unitsAttacked).includes(
    selectedUnit.unitID
  )
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
    return unit?.playerID === selectedUnit?.playerID
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
      attackerUnitID: selectedUnit.unitID,
      chosenExplosionAttack,
      grenadeThrowingGameCardID: attackersCard?.gameCardID ?? '',
      isStillAttacksLeft: attacksUsed + 1 < unitsAliveCount,
    })
  }
  return (
    <>
      <StyledControlsHeaderH2>Grenade Special Attack</StyledControlsHeaderH2>

      {unitAlreadyAttacked ? (
        <StyledControlsP>This unit already attacked.</StyledControlsP>
      ) : (
        <>
          <StyledControlsP>Select a target.</StyledControlsP>
          {chosenExplosionAttack && (
            <StyledControlsP>
              The current path will hit {affectedUnitNamesDisplay}
            </StyledControlsP>
          )}
          {friendlyAffectedUnitsCount > 0 && (
            <StyledControlsP style={{ color: 'var(--error-red)' }}>
              {`${friendlyAffectedUnitsCount} FRIENDLY UNIT${
                friendlyAffectedUnitsCount === 1 ? '' : 'S'
              } WILL BE HIT`}
            </StyledControlsP>
          )}
        </>
      )}

      <StyledButtonWrapper>
        {isNoAttacksUsed && (
          <GreenButton onClick={goBackToAttack}>
            Go back to movement stage
          </GreenButton>
        )}
        <RedButton
          onClick={confirmChosenAttack}
          disabled={!chosenExplosionAttack || unitAlreadyAttacked}
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
