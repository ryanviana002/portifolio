import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Preview from './pages/Preview.jsx'
import PreviewView from './pages/PreviewView.jsx'
import Admin from './pages/Admin.jsx'
import V2 from './pages/V2.jsx'
import NotFound from './components/NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<V2 />} />
        <Route path="/start" element={<App />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/r/:id" element={<PreviewView />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
