import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import TipPage from './pages/TipPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ThankYouPage from './pages/ThankYouPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            fontFamily: 'Outfit, sans-serif',
          },
          success: {
            iconTheme: { primary: '#8b5cf6', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<TipPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
