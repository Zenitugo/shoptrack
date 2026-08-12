import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import Stock from "./pages/Stock"
import Expenses from "./pages/Expenses"
import Revenue from "./pages/Revenue"
import Navbar from "./components/Navbar"

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Navbar /><Products /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><Navbar /><Stock /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Navbar /><Expenses /></ProtectedRoute>} />
            <Route path="/revenue" element={<ProtectedRoute><Navbar /><Revenue /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App