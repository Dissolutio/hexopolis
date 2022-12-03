import styled from 'styled-components'
import toast, { useToaster } from 'react-hot-toast/headless'
import { useBgioG } from 'bgio-contexts'
import { useEffect, useState } from 'react'

export const Notifications = () => {
  const { toasts, handlers } = useToaster()
  console.log('🚀 ~ file: Notifications.tsx:8 ~ Notifications ~ toasts', toasts)
  const { gameLog } = useBgioG()
  const { startPause, endPause } = handlers
  const [indexOfLastShownToast, setIndexOfLastShownToast] = useState(0)
  useEffect(() => {
    if (gameLog.length > indexOfLastShownToast) {
      for (let i = indexOfLastShownToast; i < gameLog.length; i++) {
        const element = gameLog[i]
        toast(element)
      }
    }
    setIndexOfLastShownToast(gameLog.length)
  }, [gameLog, indexOfLastShownToast, toasts.length])
  return (
    <StyledDiv onMouseEnter={startPause} onMouseLeave={endPause}>
      {toasts.map((toast) => {
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
  font-size: 0.6rem;
`
