import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { selectHexForUnit, selectValidTailHexes } from 'game/selectors'
import { GameUnit, UnitsCloning } from 'game/types'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { UndoRedoButtons } from './UndoRedoButtons'
import { useMemo } from 'react'

export const WaterCloneControls = () => {
  const { boardHexes, waterCloneRoll, waterClonesPlaced } = useBgioG()
  const {
    moves: { rollForWaterClone, finishWaterCloningAndEndTurn },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const {
    revealedGameCard,
    revealedGameCardUnits,
    revealedGameCardKilledUnits,
  } = usePlayContext()
  const revealedGameCardKilledUnitsCount = revealedGameCardKilledUnits.length
  // we do not want unitsCloning to update, it should keep its initial value when WaterCloneControls are rendered, so we use useMemo
  const unitsCloning = useMemo(
    () =>
      revealedGameCardUnits.reduce(
        // can clone only with units that have a "tail" hex, which is just one that is adjacent and same-altitude (see ability description)
        (acc: UnitsCloning, u: GameUnit) => {
          const clonerHexID = selectHexForUnit(u.unitID, boardHexes)?.id ?? ''
          const tails = selectValidTailHexes(clonerHexID, boardHexes)
            .filter((h) => !h.occupyingUnitID)
            .map((h) => h.id)
          const unitCloning =
            tails.length > 0 ? [{ clonerID: u.unitID, tails, clonerHexID }] : []
          return [...acc, ...unitCloning]
        },
        []
      ),
    []
  )
  const goBackToAttack = () => {
    events?.setStage?.(stageNames.attacking)
  }
  const doWaterClone = () => {
    rollForWaterClone({
      unitsCloning,
      unitName: revealedGameCard?.name ?? '',
    })
  }
  const cloningsWon = Object.values(waterCloneRoll?.placements ?? {}).length
  const clonesPlacedIDs = waterClonesPlaced.map((p) => p.clonedID)
  const clonesPlacedCount = clonesPlacedIDs.length
  const clonesLeftToPlaceCount = Math.min(
    cloningsWon - clonesPlacedCount,
    revealedGameCardKilledUnitsCount
  )
  const threshholds = unitsCloning.map((uc) => {
    const isOnWater = boardHexes[uc.clonerHexID].terrain === 'water'
    return isOnWater ? 10 : 15
  })
  const isCloneSuccess = (waterCloneRoll?.cloneCount ?? 0) > 0

  /* RENDER
    0. You have no dead units to clone
    1. You rolled some clones, place them
    3. You haven't rolled yet, roll
  */

  // 0. You have no dead units to clone
  if (!waterCloneRoll && revealedGameCardKilledUnits.length <= 0) {
    return (
      <>
        <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
        <StyledControlsP>{`You have no defeated units to clone back`}</StyledControlsP>
        <StyledButtonWrapper>
          <GreenButton onClick={goBackToAttack}>
            Nevermind, go back to attack
          </GreenButton>
        </StyledButtonWrapper>
        <StyledControlsP
          style={{ color: 'var(--text-muted)' }}
        >{`${revealedGameCard?.abilities?.[0].name}: ${revealedGameCard?.abilities?.[0].desc}`}</StyledControlsP>
      </>
    )
  }
  // 1. You rolled some clones, place them (or you rolled none, move on)
  if (waterCloneRoll) {
    return (
      <>
        <StyledControlsHeaderH2>Place your Water Clones</StyledControlsHeaderH2>
        <StyledControlsP>{`${cloningsWon} of your clones were successful.`}</StyledControlsP>
        <StyledControlsP>{`You rolled: ${Object.values(
          waterCloneRoll.diceRolls
        ).join(',')}`}</StyledControlsP>
        <StyledControlsP>{`You needed to roll: ${threshholds.join(
          ', '
        )}`}</StyledControlsP>
        {isCloneSuccess && (
          <StyledControlsP>{`${clonesLeftToPlaceCount} clones remaining to be placed`}</StyledControlsP>
        )}
        <UndoRedoButtons />
        {clonesLeftToPlaceCount < 1 && (
          <StyledButtonWrapper>
            <GreenButton onClick={() => finishWaterCloningAndEndTurn([])}>
              {isCloneSuccess
                ? `OK, all clones placed, end my turn`
                : `Perhaps they need more moisture, end my turn`}
            </GreenButton>
          </StyledButtonWrapper>
        )}
      </>
    )
  }
  // 3. You haven't rolled yet, roll
  return (
    <>
      <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
      <StyledControlsP>{`Defeated units: ${revealedGameCardKilledUnits.length}`}</StyledControlsP>
      <StyledControlsP>{`Eligible to clone: ${unitsCloning.length}`}</StyledControlsP>
      {/* The threshholds below are why we use a never-updating useMemo for UnitsCloning, so the threshholds-display doesn't change after you clone units */}
      <StyledControlsP>{`You need to roll: ${threshholds.join(
        ', '
      )}`}</StyledControlsP>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Nevermind, go back to attack
        </GreenButton>
        <RedButton onClick={doWaterClone}>
          Water clone! {unitsCloning.length} attempts to revive{' '}
          {revealedGameCardKilledUnits.length} units
        </RedButton>
      </StyledButtonWrapper>
      <StyledControlsP
        style={{ color: 'var(--text-muted)', maxWidth: '800px' }}
      >{`${revealedGameCard?.abilities?.[0].name}: ${revealedGameCard?.abilities?.[0].desc}`}</StyledControlsP>
    </>
  )
}
