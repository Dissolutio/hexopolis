import { useBgioMoves } from 'bgio-contexts'
import {
  HiOutlineArrowCircleLeft,
  HiOutlineArrowCircleRight,
} from 'react-icons/hi'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'

export const UndoRedoButtons = () => {
  const { undo, redo } = useBgioMoves()
  return (
    <StyledButtonWrapper>
      <button onClick={undo}>
        <HiOutlineArrowCircleLeft />
        <span>Undo</span>
      </button>
      <button onClick={redo}>
        <HiOutlineArrowCircleRight />
        Redo
      </button>
    </StyledButtonWrapper>
  )
}
