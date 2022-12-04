import { useBgioMoves } from 'bgio-contexts'
import {
  HiOutlineArrowCircleLeft,
  HiOutlineArrowCircleRight,
} from 'react-icons/hi'

export const UndoRedoButtons = () => {
  const { undo, redo } = useBgioMoves()
  return (
    <>
      <button onClick={undo}>
        <HiOutlineArrowCircleLeft />
        <span>UNDO</span>
      </button>
      <button onClick={redo}>
        <HiOutlineArrowCircleRight />
        REDO
      </button>
    </>
  )
}
