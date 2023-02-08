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
import { useMemo, useState } from 'react'
import { noop } from 'lodash'
import { selectHexForUnit, selectTailHexForUnit } from 'game/selectors'

export const FireLineControls = () => {
  const { boardHexes } = useBgioG()
  const {
    moves: { rollForFireLineSpecialAttack },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { revealedGameCard: mimringsCard, revealedGameCardUnits } =
    usePlayContext()
  const [chosenAttack, setChosenAttack] = useState<string>('')

  const mimringUnit = revealedGameCardUnits?.[0]
  const possibleAttacks = useMemo(() => {
    // 0. This attack is illustrated in the ROTV 2nd Edition Rules(p. 15), it can affect stacked hexes in 3D (if this game ever gets that far)
    // 0.1 The affected path of the attack is 8 hexes projected out in a straight line, starting from either the head or tail of the unit
    // 1. Get the 8 neighboring hexes, 6 of them will simply have one path going through them, note their direction from their source
    // 2. Note the 2 neighbors that are abutting both head and tail, these special neighbors have 2 paths going through them, one from the head, one from the tail
    // 2.1. These 2 special neighbors will each have 2 paths, so making them the clickable hex would add a level of confusion, but move just one hex along both of those paths and now you have 2 unique hexes for clicking on and their associated single path
    // 2.2. If the projection outwards for the 2 special hexes is blocked (i.e. Mimring is along the edge of the map, or in a hallway of sorts) revert to just the special hex, because now it would have only one or maybe even zero paths going through it
    // 3. These 6 simple hexes and 4 extrapolated hexes are now clickable, and each is apart of a unique path away from Mimring, and the player can choose which path to attack with
    // 4. Get the units on the hexes for each path, for readout to user

    const headHex = selectHexForUnit(mimringUnit.unitID, boardHexes)
    const tailHex = selectTailHexForUnit(mimringUnit.unitID, boardHexes)
  }, [])

  // TODO revealedGameCard check higher up
  //   if (!mimringsCard || !mimringUnit) return null

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
