import { Navigate, Route, Routes } from 'react-router-dom'
import { AdmissionPage } from '../features/admissions/pages/AdmissionPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdmissionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

