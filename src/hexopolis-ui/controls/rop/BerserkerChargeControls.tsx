import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { useState } from 'react'
import { OpenAbilityModalButton } from 'hexopolis-ui/OpenAbilityModalButton'

export const BerserkerChargeControls = () => {
  const {
    moves: { rollForBerserkerCharge },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { revealedGameCard } = usePlayContext()
  const ability = revealedGameCard?.abilities?.[0]
  // The idea here is we render with isJustRolled=false, player rolls and succeeds (toggles to true), and then their unitsMoved will be empty, but we don't yet want to show the NoUnitsMoved view, so we have this toggle to keep the view on the JustRolled view and not yet the NoUnitsMoved view, but once they navigate to move/attack and come back, the toggle will be false and we'll show the NoUnitsMoved view if applicable
  const [isJustRolled, setIsJustRolled] = useState<boolean>(false)
  const { unitsMoved, berserkerChargeRoll, berserkerChargeSuccessCount } =
    useBgioG()
  const goBackToMove = () => {
    events?.setStage?.(stageNames.movement)
  }
  const goBackToAttack = () => {
    events?.setStage?.(stageNames.attacking)
  }
  const doRoll = () => {
    setIsJustRolled(true)
    rollForBerserkerCharge({ gameCardID: revealedGameCard?.gameCardID })
  }

  // 0. You have not moved anybody yet, no reason to roll (show this even if last roll was successful)
  if (
    (!berserkerChargeRoll ||
      (berserkerChargeRoll?.isSuccessful && !isJustRolled)) &&
    unitsMoved.length <= 0
  ) {
    return (
      // NO UNITS MOVED
      <>
        <StyledControlsHeaderH2>Berserker Charge</StyledControlsHeaderH2>
        <StyledControlsP>{`Your warriors have full move points, you do not need to roll for Berserker Charge yet.`}</StyledControlsP>
        {berserkerChargeSuccessCount > 0 && (
          <StyledControlsP>{`Total Berserker Charges succeeded this turn: ${berserkerChargeSuccessCount}`}</StyledControlsP>
        )}
        <StyledButtonWrapper>
          <GreenButton onClick={goBackToAttack}>Go to attack</GreenButton>
          <GreenButton onClick={goBackToMove}>Go to move</GreenButton>
        </StyledButtonWrapper>
        {ability && (
          <StyledButtonWrapper>
            <OpenAbilityModalButton cardAbility={ability} />
          </StyledButtonWrapper>
        )}
      </>
    )
  }
  // 1.You JUST rolled successfully, or you have already rolled and failed
  if (berserkerChargeRoll) {
    // 1.A Your last roll was unsuccessful, you can't roll again, go to attack
    if (!berserkerChargeRoll.isSuccessful) {
      return (
        <>
          <StyledControlsHeaderH2>Berserker Charge</StyledControlsHeaderH2>
          <StyledControlsP>{`Loki and his tricks! You rolled a ${berserkerChargeRoll.roll} but needed a 15. You may not roll again. Your warriors may not move any more.`}</StyledControlsP>
          {berserkerChargeSuccessCount > 0 && (
            <StyledControlsP>{`Total Berserker Charges succeeded this turn: ${berserkerChargeSuccessCount}`}</StyledControlsP>
          )}
          <StyledButtonWrapper>
            <GreenButton onClick={goBackToAttack}>
              I see, begin the raid! (go to attack)
            </GreenButton>
          </StyledButtonWrapper>
          {ability && (
            <StyledButtonWrapper>
              <OpenAbilityModalButton cardAbility={ability} />
            </StyledButtonWrapper>
          )}
        </>
      )
    }
    // 1.B You JUST ROLLED for the charge and got it! Now go back to move
    if (isJustRolled && berserkerChargeRoll.isSuccessful) {
      return (
        <>
          <StyledControlsHeaderH2>Berserker Charge</StyledControlsHeaderH2>
          <StyledControlsP>{`Charge! You rolled a ${berserkerChargeRoll.roll}.`}</StyledControlsP>
          <StyledButtonWrapper>
            <GreenButton onClick={goBackToMove}>Go to move</GreenButton>
          </StyledButtonWrapper>
        </>
      )
    }
  }
  // 2. You have units moved, and you are eligible to roll (whether for the first time, or after a successful roll or rolls)
  return (
    <>
      <StyledControlsHeaderH2>Berserker Charge</StyledControlsHeaderH2>
      <StyledControlsP>
        If your roll is successful, your will get to move your warriors again.
        If your roll fails, your movement is over and you may move onto
        attacking. You can move and roll for Berserker Charge as many times as
        you like, until you have an unsuccessful roll.
      </StyledControlsP>
      {berserkerChargeSuccessCount > 0 && (
        <StyledControlsP>{`Total Berserker Charges succeeded this turn: ${berserkerChargeSuccessCount}`}</StyledControlsP>
      )}
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>
          Nevermind, go back to attack
        </GreenButton>
        <RedButton onClick={doRoll}>Roll for Berserker Charge!</RedButton>
      </StyledButtonWrapper>
      {ability && (
        <StyledButtonWrapper>
          <OpenAbilityModalButton cardAbility={ability} />
        </StyledButtonWrapper>
      )}
    </>
  )
}
