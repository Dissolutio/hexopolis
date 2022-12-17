import { useBgioMoves } from 'bgio-contexts'
import {
  HiOutlineArrowCircleLeft,
  HiOutlineArrowCircleRight,
} from 'react-icons/hi'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'

type Props = {
  noRedo?: boolean
  undoText?: string
}

export const UndoRedoButtons = ({ noRedo, undoText }: Props) => {
  const { undo, redo } = useBgioMoves()
  return (
    <StyledButtonWrapper>
      <button onClick={undo}>
        <HiOutlineArrowCircleLeft />
        <span>{undoText || 'Undo'}</span>
      </button>
      {!noRedo && (
        <button onClick={redo}>
          <HiOutlineArrowCircleRight />
          Redo
        </button>
      )}
    </StyledButtonWrapper>
  )
}
