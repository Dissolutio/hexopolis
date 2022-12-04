export type GameLogMessage = {
  type: string // 'move' 'attack'
  id: string // round1:orderMarker1:unit1:attack3 => r1:om1:p1u1_hs1008:a3
  // attack related ones below
  unitID?: string
  unitName?: string
  targetHexID?: string
  defenderUnitName?: string
  attackRolled?: number
  defenseRolled?: number
  skulls?: number
  shields?: number
  wounds?: number
  isFatal?: boolean
}
export type GameLogMessageDecoded = GameLogMessage & {
  msg: string
}

export const encodeGameLogMessage = (gameLog: GameLogMessage): string => {
  try {
    switch (gameLog.type) {
      case 'attack':
        return JSON.stringify(gameLog)
      case 'move':
        return ''
      default:
        return ''
    }
  } catch (error) {
    console.error('🚀 ~ file: gamelog.ts ~ encodeGameLogMessage ~ error', error)
    return ''
  }
}
export const decodeGameLogMessage = (
  logMessage: string
): GameLogMessageDecoded | undefined => {
  try {
    const gameLog = JSON.parse(logMessage)
    const {
      type,
      id,
      unitID,
      unitName,
      targetHexID,
      defenderUnitName,
      attackRolled,
      defenseRolled,
      skulls,
      shields,
      wounds,
      isFatal,
    } = gameLog
    const gameLogHumanFriendly = `${unitName} attacked ${defenderUnitName} for ${wounds} wounds (${skulls} skulls, ${shields} shields)`
    return {
      type,
      id,
      unitID,
      unitName,
      targetHexID,
      defenderUnitName,
      attackRolled,
      defenseRolled,
      skulls,
      shields,
      wounds,
      isFatal,
      msg: gameLogHumanFriendly,
    }
  } catch (error) {
    console.error('🚀 ~ file: gamelog.ts ~ decodeGameLogMessage ~ error', error)
    return undefined
  }
}
