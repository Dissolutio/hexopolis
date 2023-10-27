import styled from 'styled-components'
import toast, { useToaster } from 'react-hot-toast/headless'
import { useBgioG } from 'bgio-contexts'
import { useEffect } from 'react'
import { useUIContext } from 'hexopolis-ui/contexts'
import { decodeGameLogMessage, gameLogTypes } from 'game/gamelog'
import { uniqBy } from 'lodash'
import { GameLogMsg } from 'hexopolis-ui/game-log/GameLogMsg'

export const Notifications = () => {
  const { toasts, handlers } = useToaster()
  const toastsInReverse = [...toasts].reverse()
  const { gameLog } = useBgioG()
  const { startPause, endPause } = handlers
  const { indexOfLastShownToast, setIndexOfLastShownToast } = useUIContext()

  // Effect: update toasts with all the latest game log entries
  useEffect(() => {
    if (gameLog.length > indexOfLastShownToast) {
      for (let i = indexOfLastShownToast; i < gameLog.length; i++) {
        const gameLogString = gameLog[i]
        const gameLogMessage = decodeGameLogMessage(gameLogString)
        if (!gameLogMessage) {
          continue
        }
        const { type } = gameLogMessage
        const defaultDuration = 20000
        switch (type) {
          case gameLogTypes.glyphReveal:
          case gameLogTypes.disengageSwipeFatal:
          case gameLogTypes.disengageSwipeNonFatal:
          case gameLogTypes.theDropRoll:
          case gameLogTypes.mindShackle:
          case gameLogTypes.chomp:
          case gameLogTypes.attack:
            toast(<GameLogMsg gameLogMessage={gameLogMessage} />, {
              duration: defaultDuration,
              id: gameLogMessage?.id,
            })
            break
          case gameLogTypes.move:
            // const moreRepetitiveMsgDuration = 5000
            // const duration =
            //   isFatal || (wounds ?? 0) > 0
            //     ? defaultDuration
            //     : moreRepetitiveMsgDuration
            toast(<GameLogMsg gameLogMessage={gameLogMessage} />, {
              duration: defaultDuration,
              id: gameLogMessage?.id,
            })
            break
          default:
            toast(<GameLogMsg gameLogMessage={gameLogMessage} />, {
              duration: defaultDuration,
              id: gameLogMessage?.id,
            })
        }
      }
    }
    setIndexOfLastShownToast(gameLog.length)
  }, [gameLog, indexOfLastShownToast, setIndexOfLastShownToast, toasts.length])

  // UNCOMMENT THIS FOR DEBUGGING: This will show all the game log messages from G
  // const gameLogMessages = gameLog.map((gameLogString) =>
  //   decodeGameLogMessage(gameLogString)
  // )
  // return (
  //   <StyledDiv onMouseEnter={startPause} onMouseLeave={endPause}>
  //     {gameLogMessages.map((gameLogObj) => {
  //       if (!gameLogObj) return null
  //       return (
  //         <div key={gameLogObj.id}>
  //           <GameLogDisplay gameLogMessage={gameLogObj} />
  //         </div>
  //       )
  //     })}
  //   </StyledDiv>
  // )

  // This will show disappearing toasts
  return (
    <StyledDiv onMouseEnter={startPause} onMouseLeave={endPause}>
      {uniqBy(toastsInReverse, (t) => t.id).map((toast) => {
        return (
          <div
            key={toast.id}
            style={{
              transition: 'all 0.5s ease-out',
              opacity: toast.visible ? 1 : 0,
            }}
          >
            {toast.message as string}
          </div>
        )
      })}
    </StyledDiv>
  )
}

const StyledDiv = styled.div`
  position: absolute;
  bottom: 12px;
  left: Min(10%, 600px);
  /* width: 300px; */
  font-size: 0.8rem;
  background-color: black;
  @media screen and (max-width: 1100px) {
    font-size: 0.7rem;
  }
`
