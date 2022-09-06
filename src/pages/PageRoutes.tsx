import React from 'react'
import { Routes, Route } from 'react-router-dom'

import { FeedbackPage, HelpPage, RulesPage } from './'

export const PageRoutes = () => {
  return (
    <Routes>
      <Route path="/help" element={<HelpPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/rules" element={<RulesPage />} />
    </Routes>
  )
}
