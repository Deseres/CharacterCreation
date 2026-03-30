import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { CharacterListPage } from './pages/CharacterListPage'
import { CharacterSheetPage } from './pages/CharacterSheetPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/characters"
        element={
          <ProtectedRoute>
            <CharacterListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/characters/:id"
        element={
          <ProtectedRoute>
            <CharacterSheetPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/characters" replace />} />
    </Routes>
  )
}

export default App
