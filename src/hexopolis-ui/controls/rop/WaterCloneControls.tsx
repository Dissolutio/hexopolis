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

export const WaterCloneControls = () => {
  const { killedUnits, myUnits, boardHexes } = useBgioG()
  const { moves } = useBgioMoves()
  const { playerID } = useBgioClientInfo()
  const { events } = useBgioEvents()
  const { endCurrentPlayerTurn } = moves
  const { revealedGameCard, revealedGameCardUnits } = usePlayContext()

  const deadUnitsThatCanBeCloned = Object.values(killedUnits).filter(
    (killedUnit) =>
      killedUnit.playerID === playerID &&
      killedUnit.gameCardID === revealedGameCard?.gameCardID
  )
  const unitsWithValidSpotForClones = myUnits
    .filter(
      // get my surviving marro warriors
      (u) => u.gameCardID === revealedGameCard?.gameCardID
    )
    .filter(
      // can clone only with units that have a "tail" hex, which is just one that is adjacent same level (see ability description)
      (u) =>
        selectValidTailHexes(
          selectHexForUnit(u.unitID, boardHexes)?.id ?? '',
          boardHexes
        ).length > 0
    )
  const goBackToAttack = () => {
    events?.setStage?.(stageNames.attacking)
  }
  const doWaterClone = () => {
    console.log('CLONING')
  }
  return (
    <>
      <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
      <StyledControlsP>{`Defeated units: ${deadUnitsThatCanBeCloned.length}`}</StyledControlsP>
      <StyledControlsP>{`Eligible to clone:${unitsWithValidSpotForClones.length}`}</StyledControlsP>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Nevermind, go back to attack
        </GreenButton>
        <RedButton onClick={doWaterClone}>
          Water clone! Attempt to clone back {deadUnitsThatCanBeCloned.length}{' '}
          out of {unitsWithValidSpotForClones.length} units
        </RedButton>
      </StyledButtonWrapper>
      <StyledControlsP
        style={{ color: 'var(--text-muted)' }}
      >{`${revealedGameCard?.abilities?.[0].name}: ${revealedGameCard?.abilities?.[0].desc}`}</StyledControlsP>
    </>
  )
}
