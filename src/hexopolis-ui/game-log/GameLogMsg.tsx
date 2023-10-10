import { GameLogMessageDecoded, gameLogTypes } from 'game/gamelog'
import { colors, playerColors } from 'hexopolis-ui/theme'
import { playerIDDisplay } from 'game/transformers'
import { powerGlyphs } from 'game/glyphs'

export const GameLogMsg = ({
  gameLogMessage,
}: {
  gameLogMessage: GameLogMessageDecoded
}) => {
  const {
    type,
    // for noUnitsOnTurn
    playerID,
    // attack logs below
    unitName,
    defenderUnitName,
    defenderSingleName,
    defenderPlayerID,
    attackRolled,
    defenseRolled,
    skulls,
    shields,
    wounds,
    isFatal,
    isFatalCounterStrike,
    isStealthDodge,
    counterStrikeWounds,
    // roundBegin
    // move logs
    unitSingleName,
    isGrappleGun,
    fallDamage,
    revealedGlyphID,
    reclaimedGlyphID,
    // berserker charge: most generic roll format
    roll,
    isRollSuccessful,
    rollThreshold,
    // chomp
    isChompSuccessful,
    unitChompedName,
    unitChompedSingleName,
    isChompedUnitSquad,
    msg,
  } = gameLogMessage
  const revealedGlyphName = revealedGlyphID
    ? powerGlyphs?.[revealedGlyphID]?.name
    : ''
  const recalimedGlyphName = reclaimedGlyphID
    ? powerGlyphs?.[reclaimedGlyphID]?.name
    : ''
  const revealedGlyphEffect = revealedGlyphID
    ? powerGlyphs?.[revealedGlyphID]?.effect
    : ''
  const reclaimedGlyphEffect = reclaimedGlyphID
    ? powerGlyphs?.[reclaimedGlyphID]?.effect
    : ''
  switch (type) {
    case gameLogTypes.glyphReveal:
      const glyphRevealMsg = revealedGlyphID
        ? `${unitSingleName} has revealed the ${revealedGlyphName}! (${revealedGlyphEffect})`
        : ''
      return (
        <span style={{ color: playerColors[playerID] }}>{glyphRevealMsg}</span>
      )
    case gameLogTypes.disengageSwipeFatal:
      const disengageSwipeFatalMsgText = `${defenderSingleName} was defeated while disengaging from `
      return (
        <>
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {disengageSwipeFatalMsgText}
            <span style={{ color: playerColors[playerID] }}>
              {unitSingleName}
            </span>
            !
          </span>
        </>
      )
    case gameLogTypes.disengageSwipeNonFatal:
      const disengageSwipeNonFatalMsgText = `${unitSingleName} took a swipe at `
      return (
        <>
          <span style={{ color: playerColors[playerID] }}>
            {disengageSwipeNonFatalMsgText}
            <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
              {defenderSingleName}
            </span>
            {`! (${wounds} wounds)`}
          </span>
        </>
      )
    case gameLogTypes.move:
      const revealedGlyphMsg = revealedGlyphID
        ? `${unitSingleName} has revealed the ${revealedGlyphName}! (${revealedGlyphEffect})`
        : ''
      const reclaimedGlyphMsg = reclaimedGlyphID
        ? `${unitSingleName} has reclaimed the ${recalimedGlyphName}! (${reclaimedGlyphEffect})`
        : ''
      const diedFallingMsg = `${unitSingleName} was destroyed from falling damage! (${wounds} / ${fallDamage} possible wounds)`
      const unwoundedFallMsg = `${unitSingleName} jumped down a great distance! (${wounds} / ${fallDamage} possible wounds)`
      const woundedFallMsg = `${unitSingleName} took falling damage while moving! (${wounds} wounds)`
      const grappleGunMoveMsg = `${unitSingleName} has moved with Grapple Gun`
      const moveMsgText = `${unitSingleName} is on the move`
      const fallingDamageMsg = isFatal
        ? diedFallingMsg
        : (wounds ?? 0) > 0
        ? woundedFallMsg
        : (fallDamage ?? 0) > 0 && wounds === 0
        ? unwoundedFallMsg
        : ''
      const moveMsg = isGrappleGun ? grappleGunMoveMsg : moveMsgText
      return (
        <span style={{ color: playerColors[playerID] }}>
          <div>{moveMsg}</div>
          {fallingDamageMsg && <div>{fallingDamageMsg}</div>}
          {revealedGlyphMsg && <div>{revealedGlyphMsg}</div>}
          {reclaimedGlyphMsg && <div>{reclaimedGlyphMsg}</div>}
        </span>
      )
    case gameLogTypes.theDropRoll:
      const theDropRollMsg = isRollSuccessful ? (
        <span style={{ color: playerColors[playerID] }}>
          {playerIDDisplay(playerID)} rolled for The Drop and succeeded! ({roll}{' '}
          / {rollThreshold}){' '}
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          {playerIDDisplay(playerID)} failed their roll for The Drop ({roll} /{' '}
          {rollThreshold}){' '}
        </span>
      )
      return theDropRollMsg
    case gameLogTypes.mindShackle:
      const msgMindShackle = isRollSuccessful ? (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} has Mind Shackled{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderUnitName}
          </span>
          ! (rolled a {roll})
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attempted to Mind Shackle{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderUnitName}
          </span>{' '}
          but only rolled a {roll} / {rollThreshold}
        </span>
      )
      return msgMindShackle
    case gameLogTypes.chomp:
      const chompMsg = isChompSuccessful ? (
        <span style={{ color: playerColors[playerID] }}>
          Grimnak Chomped{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {isChompedUnitSquad ? unitChompedSingleName : unitChompedName}
          </span>
          ! {isChompedUnitSquad ? '' : `(rolled a ${roll})`}
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          Grimnak attempted to Chomp{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {unitChompedName}
          </span>{' '}
          but only rolled a {roll} / {rollThreshold}
        </span>
      )
      return chompMsg
    case gameLogTypes.attack:
      const isCounterStrike = (counterStrikeWounds ?? 0) > 0
      const counterStrikeMsg = isFatalCounterStrike ? (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attacked{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled} shields)
          and was defeated by counter strike!
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attacked{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled} shields)
          and was hit by counter strike for {counterStrikeWounds} wounds!
        </span>
      )
      const stealthDodgeMsgText = (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attacked{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled} shields),
          but the attack was evaded with Stealth Dodge!
        </span>
      )

      const attackMsgText = isFatal ? (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} destroyed{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          with a {wounds}-wound attack ({skulls}/{attackRolled} skulls,{' '}
          {shields}/{defenseRolled} shields)
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attacked{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          for {wounds} wounds ({skulls}/{attackRolled} skulls, {shields}/
          {defenseRolled} shields)
        </span>
      )
      const attackToast = isCounterStrike
        ? counterStrikeMsg
        : isStealthDodge
        ? stealthDodgeMsgText
        : attackMsgText
      return attackToast
    default:
      return <span style={{ color: colors.gray }}>{`${msg}`}</span>
  }
}
