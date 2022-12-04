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
        <span>Undo</span>
      </button>
      <button onClick={redo}>
        <HiOutlineArrowCircleRight />
        Redo
      </button>
    </>
  )
}
