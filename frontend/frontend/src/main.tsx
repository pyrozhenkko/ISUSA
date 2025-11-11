import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import StudentPortal from './main-page.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StudentPortal />
  </StrictMode>,
)
