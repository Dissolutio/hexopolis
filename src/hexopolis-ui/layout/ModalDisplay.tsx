import { GameArmyCard } from 'game/types'
import { modalStates, useUIContext } from 'hexopolis-ui/contexts'
import { OpenAbilityModalButton } from 'hexopolis-ui/OpenAbilityModalButton'
import { UnitIcon } from 'hexopolis-ui/unit-icons'
import React from 'react'
import styled from 'styled-components'
import { CardGridStyle } from './CardGridStyle'
type Props = {}

export const ModalDisplay = (props: Props) => {
  const { modalAbility, modalState, modalCard, closeModal, backModal } =
    useUIContext()
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
  if (modalState === modalStates.ability && modalAbility) {
    return (
      <>
        <StyledModalBackdrop onClick={closeModal} />
        <StyledModalDiv>
          {modalCard && (
            <StyledModalNavButton
              style={{ right: '110px' }}
              onClick={backModal}
            >
              Back
            </StyledModalNavButton>
          )}
          <StyledModalNavButton style={{ right: '20px' }} onClick={closeModal}>
            Close
          </StyledModalNavButton>
          <div className="modal-guts">
            <h2 style={{ fontSize: '1.4rem' }}>{modalAbility.name}</h2>
            <p style={{ fontSize: '1rem' }}>{modalAbility.desc}</p>
          </div>
        </StyledModalDiv>
      </>
    )
  } else if (modalState === modalStates.card && modalCard) {
    const {
      name,
      image,
      type,
      singleName,
      general,
      race,
      cardClass,
      personality,
      height,
      heightClass,
      life,
      move,
      range,
      attack,
      defense,
      points,
      figures,
      hexes,
    } = modalCard
    return (
      <>
        <StyledModalBackdrop onClick={closeModal} />
        <StyledModalDiv>
          <StyledModalNavButton style={{ right: '20px' }} onClick={closeModal}>
            Close
          </StyledModalNavButton>
          <div className="modal-guts">
            <h2 style={{ fontSize: '1.7rem' }}>{modalCard.name}</h2>
            <CardGridStyle>
              <div className="cardgrid_portrait">
                <img
                  src={`/heroscape-portraits/${image}`}
                  alt={'Portrait of ' + name}
                  style={{ textAlign: 'center', height: '100%' }}
                />
              </div>

              <div className="cardgrid_points" style={{ fontSize: '0.8rem' }}>
                <div style={{ textTransform: 'capitalize' }}>{type}</div>
                <div>
                  {points}
                  <span>{` points`}</span>
                </div>
                {type.includes('hero') && (
                  <div>
                    {life}
                    <span>{` life`}</span>
                  </div>
                )}
                {type.includes('squad') && (
                  <div>
                    <span>
                      {figures}
                      <span>{` figures`}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="cardgrid_stats">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    maxWidth: '300px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{race}</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {cardClass}
                    </span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {personality}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}
                  >
                    <span>Move: {move}</span>

                    <span>Range: {range}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}
                  >
                    <span>Attack: {attack}</span>

                    <span>Defense: {defense}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}
                  >
                    <span>
                      Height: {height}{' '}
                      <span style={{ textTransform: 'capitalize' }}>
                        {heightClass}
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ paddingRight: '20px' }}>Icon:</span>
                    <UnitIcon
                      hexSize={40}
                      armyCardID={modalCard.armyCardID}
                      iconPlayerID={modalCard.playerID}
                    />
                  </div>
                </div>
              </div>
              <div className="cardgrid_abilities">
                <h4 style={{ borderBottom: '1px solid var(--gray)' }}>
                  Abilities
                </h4>
                {/* <AbilitiesBadges card={card} /> */}
                {modalCard.abilities.map((ability) => {
                  return <OpenAbilityModalButton cardAbility={ability} />
                })}
              </div>
              {/* <div className="cardgrid_buttons"> */}
              {/* <AddRemoveButtonToolbar card={card} /> */}
              {/* <button>And and remove stuff</button>
              </div> */}
            </CardGridStyle>
          </div>
        </StyledModalDiv>
      </>
    )
  } else return null
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
    background: var(--black);
  }
`
const StyledModalNavButton = styled.button`
  position: absolute;
  top: 10px;
  padding: 5px 10px;
  color: white;
  background: black;
  font-size: 1.1rem;
  z-index: 1;
`
