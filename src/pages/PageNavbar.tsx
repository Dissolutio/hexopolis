import React from 'react'
import { Link } from 'react-router-dom'
import { GiHexes } from 'react-icons/gi'
export const PageNavbar = () => {
  return (
    <nav>
      <Link to="/">
        <GiHexes style={{ fontSize: '35px' }} /> Hexed Meadow
      </Link>
    </nav>
  )
}
