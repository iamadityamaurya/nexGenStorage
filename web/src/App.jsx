import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import TelegramLogin from './pages/TelegramLogin'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Telegram MTProto Login */}
        <Route path="/login" element={
          <TelegramLogin onLoginSuccess={() => window.location.href = '/drives'} />
        } />

        {/* Drives Directory & Views */}
        <Route path="/drives" element={<Home />} />
        <Route path="/drive/:chatId" element={<Home />} />
        <Route path="/drive/:chatId/file/:messageId" element={<Home />} />
        
        {/* Drive folder views */}
        <Route path="/drive/:chatId/folder/:folderId" element={<Home />} />
        <Route path="/drive/:chatId/folder/:folderId/file/:messageId" element={<Home />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
