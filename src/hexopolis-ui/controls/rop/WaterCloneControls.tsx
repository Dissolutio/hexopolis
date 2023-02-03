import { usePlayContext } from '../../contexts'
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

export const WaterCloneControls = () => {
  const { killedUnits, boardHexes, waterCloneRoll, waterClonesPlaced } =
    useBgioG()
  const {
    moves: { waterClone, finishWaterCloningAndEndTurn },
  } = useBgioMoves()
  const { playerID } = useBgioClientInfo()
  const { events } = useBgioEvents()
  const { revealedGameCard, revealedGameCardUnits } = usePlayContext()
  const deadUnitsThatCanBeCloned = Object.values(killedUnits).filter(
    (killedUnit) =>
      killedUnit.playerID === playerID &&
      killedUnit.gameCardID === revealedGameCard?.gameCardID
  )
  const unitsCloning = revealedGameCardUnits.reduce(
    // can clone only with units that have a "tail" hex, which is just one that is adjacent and same-altitude (see ability description)
    (acc: UnitsCloning, u: GameUnit) => {
      const unitHexID = selectHexForUnit(u.unitID, boardHexes)?.id ?? ''
      const tails = selectValidTailHexes(unitHexID, boardHexes)
        .filter((h) => !h.occupyingUnitID)
        .map((h) => h.id)
      return [...acc, { unit: u, tails, unitHexID }]
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
  const clonesTotal = waterCloneRoll?.cloneCount ?? 0
  const clonesPlacedIDs = waterClonesPlaced ?? []
  const clonesPlaced = clonesPlacedIDs.length
  const clonesLeft = clonesTotal - clonesPlaced
  // 1. You rolled no clones, end your turn
  // 2. You rolled some clones, place them
  // 3. You haven't rolled yet, roll
  if (waterCloneRoll?.cloneCount === 0) {
    return (
      <>
        <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
        <StyledControlsP>{`None of your clones were successful.`}</StyledControlsP>
        <StyledControlsP>{`You rolled: ${waterCloneRoll.diceRolls.join(
          ','
        )}`}</StyledControlsP>
        <StyledButtonWrapper>
          <GreenButton onClick={finishWaterCloningAndEndTurn}>
            OK, end turn
          </GreenButton>
        </StyledButtonWrapper>
      </>
    )
  }
  if (waterCloneRoll) {
    return (
      <>
        <StyledControlsHeaderH2>
          Water Clone: place {clonesTotal} clones, {clonesLeft} remaining
        </StyledControlsHeaderH2>
        <StyledControlsP>{`${clonesTotal} of your clones were successful.`}</StyledControlsP>
      </>
    )
  }
  return (
    <>
      <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
      <StyledControlsP>{`Defeated units: ${deadUnitsThatCanBeCloned.length}`}</StyledControlsP>
      <StyledControlsP>{`Eligible to clone:${unitsCloning.length}`}</StyledControlsP>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Nevermind, go back to attack
        </GreenButton>
        <RedButton onClick={doWaterClone}>
          Water clone! {deadUnitsThatCanBeCloned.length} attempts to revive{' '}
          {unitsCloning.length} units
        </RedButton>
      </StyledButtonWrapper>
      <StyledControlsP
        style={{ color: 'var(--text-muted)' }}
      >{`${revealedGameCard?.abilities?.[0].name}: ${revealedGameCard?.abilities?.[0].desc}`}</StyledControlsP>
    </>
  )
}
