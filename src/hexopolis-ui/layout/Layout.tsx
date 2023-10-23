import { useBgioClientInfo } from 'bgio-contexts'
import { modalStates, useUIContext } from 'hexopolis-ui/contexts'
import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { LayoutContainer } from './LayoutContainerBrokenLint'
import { ModalDisplay } from './ModalDisplay'

export const Layout = ({
  children,
  mapWrapperRef,
}: {
  children: ReactNode[]
  mapWrapperRef: React.RefObject<HTMLDivElement>
}) => {
  const { playerID } = useBgioClientInfo()
  const { modalState } = useUIContext()
  return (
    <>
      {modalState !== modalStates.off && <ModalDisplay />}
      <LayoutContainer
        id={`player${playerID}`} // for linking to this player view (useful in local dev, implemented in HeaderNav logo link)
        playerID={playerID}
      >
        <LayoutTop>{children[0]}</LayoutTop>
        <LayoutMiddle ref={mapWrapperRef}>{children[1]}</LayoutMiddle>
        <LayoutBottom>{children[2]}</LayoutBottom>
      </LayoutContainer>
    </>
  )
}

const LayoutTop = styled.div`
  width: 100%;
  height: var(--navbar-height);
  background: var(--black);
`
const LayoutMiddle = styled.div`
  width: 100%;
  height: var(--middle-size);
  /* position: relative; */
  /* overflow: auto; */
`
const LayoutBottom = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: calc(100vh - var(--middle-size) - var(--navbar-height));
  padding: 4px 16px;
  margin: 0;
  box-sizing: border-box;
  background: var(--black);
  overflow: scroll;
`
