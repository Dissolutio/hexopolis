import { useUIContext } from 'hexopolis-ui/contexts'
import React from 'react'
import styled from 'styled-components'
type Props = {}

export const ModalDisplay = (props: Props) => {
  const { modalAbility, closeModal } = useUIContext()
  React.useEffect(() => {
    const keyDownHandler = (event: {
      key: string
      preventDefault: () => void
    }) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeModal()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    // 👇️ clean up event listener
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [])
  return (
    <>
      <StyledModalBackdrop onClick={closeModal} />
      <StyledModalDiv>
        <button className="close-button" onClick={closeModal}>
          Close
        </button>
        <div className="modal-guts">
          <h1>{modalAbility.name}</h1>
          <p>{modalAbility.desc}</p>
        </div>
      </StyledModalDiv>
    </>
  )
}
// Thanks Chris Coyier, you're awesome: https://codepen.io/chriscoyier/pen/MeJWoM
const StyledModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 50;
  background: rgba(0, 0, 0, 0.6);
`
const StyledModalDiv = styled.div`
  /* This way it could be display flex or grid or whatever also. */
  display: block;
  /* Probably need media queries here */
  width: 600px;
  max-width: 100%;
  height: 400px;
  max-height: 100%;
  position: fixed;
  z-index: 100;
  left: 50%;
  top: 50%;
  /* Use this for centering if unknown width/height */
  transform: translate(-50%, -50%);
  /* If known, negative margins are probably better (less chance of blurry text). */
  /* margin: -200px 0 0 -200px; */
  background: var(--black);
  box-shadow: 0 0 60px 10px rgba(0, 0, 0, 0.9);
  .modal-guts {
    position: absolute;
    top: 0;
    left: 0;
    width: 95%;
    height: 100%;
    overflow: auto;
    padding: 20px 0px 20px 20px;
  }
  .close-button {
    position: absolute;
    top: 10px;
    /* needs to look OK with or without scrollbar */
    right: 20px;
    border: 0;
    padding: 5px 10px;
    color: white;
    background: black;
    font-size: 1.3rem;
    z-index: 1;
  }
`
