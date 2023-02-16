import { useBgioCtx } from 'bgio-contexts'
import { StyledControlsHeaderH2 } from 'hexopolis-ui/layout/Typography'
import React from 'react'

type Props = {}

export const DraftControls = (props: Props) => {
  const { isMyTurn, activePlayers } = useBgioCtx()
  console.log(
    '🚀 ~ file: DraftControls.tsx:9 ~ DraftControlsPicking ~ activePlayers',
    activePlayers
  )
  return <StyledControlsHeaderH2>DraftControls</StyledControlsHeaderH2>
}
