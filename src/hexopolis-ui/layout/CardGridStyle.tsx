import styled from 'styled-components'

export const CardGridStyle = styled.div`
  display: grid;
  grid-template-columns: 4rem auto;
  grid-template-rows: 4rem auto auto auto;
  gap: 10px;
  grid-template-areas:
    'portrait stats'
    'points stats'
    'abilities abilities'
    'buttons buttons';
  height: 100%;
  .nav-link.active {
    background-color: var(--bs-secondary);
  }
  .cardgrid_portrait {
    grid-area: portrait;
  }
  .cardgrid_points {
    grid-area: points;
  }
  .cardgrid_stats {
    grid-area: stats;
  }
  .cardgrid_abilities {
    grid-area: abilities;
  }
  .cardgrid_buttons {
    grid-area: buttons;
  }
`
