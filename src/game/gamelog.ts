type GameLogMessage = {
  type: string // 'move' 'attack'
  unitID?: string
  targetHexID?: string
}
export const encodeGameLogMessage = (gameLog: GameLogMessage): string => {
  const type = gameLog.type
  const unitID = gameLog?.unitID ?? ''
  const targetHexID = gameLog?.targetHexID ?? ''
  return `${type}:${unitID}:${targetHexID}:`
}
export const decodeGameLogMessage = (logMessage: string): GameLogMessage => {
  const arrOfStrings = logMessage.split(':')
  const type = arrOfStrings[0]
  const unitID = arrOfStrings[1]
  const targetHexID = arrOfStrings[2]
  return {
    type,
    unitID,
    targetHexID,
  }
}
