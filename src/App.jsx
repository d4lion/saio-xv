import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Panelistas from './pages/Panelistas'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/panelistas" element={<Panelistas />} />
    </Routes>
  )
}
