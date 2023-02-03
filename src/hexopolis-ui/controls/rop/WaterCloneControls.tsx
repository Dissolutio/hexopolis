import {
  useBgioClientInfo,
  useBgioEvents,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
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

export const WaterCloneControls = () => {
  const { killedUnits, boardHexes, waterCloneRoll } = useBgioG()
  const {
    moves: { waterClone, finishWaterCloningAndEndTurn },
  } = useBgioMoves()
  const { playerID } = useBgioClientInfo()
  const { events } = useBgioEvents()
  const { revealedGameCard, revealedGameCardUnits, waterClonePlacement } =
    usePlayContext()
  const deadUnitsThatCanBeCloned = Object.values(killedUnits).filter(
    (killedUnit) =>
      killedUnit.playerID === playerID &&
      killedUnit.gameCardID === revealedGameCard?.gameCardID
  )
  const deadUnitsThatCanBeClonedCount = deadUnitsThatCanBeCloned.length
  const unitsCloning = revealedGameCardUnits.reduce(
    // can clone only with units that have a "tail" hex, which is just one that is adjacent and same-altitude (see ability description)
    (acc: UnitsCloning, u: GameUnit) => {
      const unitHexID = selectHexForUnit(u.unitID, boardHexes)?.id ?? ''
      const tails = selectValidTailHexes(unitHexID, boardHexes)
        .filter((h) => !h.occupyingUnitID)
        .map((h) => h.id)
      const unitCloning =
        tails.length > 0 ? [{ unit: u, tails, unitHexID }] : []
      return [...acc, ...unitCloning]
    },
    []
  )
  const goBackToAttack = () => {
    events?.setStage?.(stageNames.attacking)
  }
  const doWaterClone = () => {
    waterClone({
      unitsCloning,
    })
  }
  const cloningsWon = Object.values(waterCloneRoll?.placements ?? {}).length
  const clonesPlacedIDs = waterClonePlacement ?? []
  const clonesPlacedCount = clonesPlacedIDs.length
  const clonesLeftToPlaceCount =
    Math.min(cloningsWon, deadUnitsThatCanBeClonedCount) - clonesPlacedCount
  const threshholds = unitsCloning.map((uc) => {
    const isOnWater = boardHexes[uc.unitHexID].terrain === 'water'
    return isOnWater ? 10 : 15
  })

  /* RENDER
    0. You have no dead units to clone
    1. You rolled no clones, end your turn
    2. You rolled some clones, place them
    3. You have placed all your clones, end your turn
    4. You haven't rolled yet, roll
  */

  if (deadUnitsThatCanBeCloned.length <= 0) {
    // 0. You have no dead units to clone
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
  if (waterCloneRoll?.cloneCount === 0) {
    // 1. You rolled no clones, end your turn
    return (
      <>
        <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
        <StyledControlsP>{`None of your clones were successful.`}</StyledControlsP>
        <StyledControlsP>{`You rolled: ${Object.values(
          waterCloneRoll.diceRolls
        ).join(',')}`}</StyledControlsP>
        <StyledButtonWrapper>
          <GreenButton onClick={() => finishWaterCloningAndEndTurn([])}>
            OK, end turn
          </GreenButton>
        </StyledButtonWrapper>
      </>
    )
  }
  if (waterCloneRoll) {
    // 2. You rolled some clones, place them
    return (
      <>
        <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
        <StyledControlsP>{`${cloningsWon} of your clones were successful.`}</StyledControlsP>
        <StyledControlsP>{`You rolled: ${Object.values(
          waterCloneRoll.diceRolls
        ).join(',')}`}</StyledControlsP>
        <StyledControlsP>{`You needed to roll: ${threshholds.join(
          ', '
        )}`}</StyledControlsP>
        <StyledControlsP>{`${clonesLeftToPlaceCount} clones remaining to be placed`}</StyledControlsP>
      </>
    )
  }
  if (waterCloneRoll) {
    // 3. You have placed all your clones, end your turn
    return (
      <>
        <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
        <StyledControlsP>All of your clones have been placed.</StyledControlsP>
        <StyledButtonWrapper>
          {/* TODO pass the real WaterClonePlacement */}
          <GreenButton onClick={() => finishWaterCloningAndEndTurn([])}>
            OK, end turn
          </GreenButton>
        </StyledButtonWrapper>
      </>
    )
  }
  // 4. You haven't rolled yet, roll
  return (
    <>
      <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
      <StyledControlsP>{`Defeated units: ${deadUnitsThatCanBeCloned.length}`}</StyledControlsP>
      <StyledControlsP>{`Eligible to clone: ${unitsCloning.length}`}</StyledControlsP>
      <StyledControlsP>{`You need to roll: ${threshholds.join(
        ', '
      )}`}</StyledControlsP>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Nevermind, go back to attack
        </GreenButton>
        <RedButton onClick={doWaterClone}>
          Water clone! {unitsCloning.length} attempts to revive{' '}
          {deadUnitsThatCanBeCloned.length} units
        </RedButton>
      </StyledButtonWrapper>
      <StyledControlsP
        style={{ color: 'var(--text-muted)' }}
      >{`${revealedGameCard?.abilities?.[0].name}: ${revealedGameCard?.abilities?.[0].desc}`}</StyledControlsP>
    </>
  )
}
