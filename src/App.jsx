import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Signup from './pages/Signup.jsx'
import StockDetail from './pages/StockDetail.jsx'
import Trade from './pages/Trade.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="markets" element={<Dashboard />} />
        <Route path="stock/:symbol" element={<StockDetail />} />
        <Route path="trade" element={<Trade />} />
        <Route path="trade/:symbol" element={<Trade />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
