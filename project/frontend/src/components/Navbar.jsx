import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path
    ? "text-blue-600 font-semibold"
    : "text-gray-600 hover:text-blue-600"

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-blue-600">ShopTrack</span>
          {user?.business_name && (
            <span className="text-sm text-gray-400">— {user.business_name}</span>
          )}
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/" className={`text-sm ${isActive("/")}`}>Dashboard</Link>
          <Link to="/products" className={`text-sm ${isActive("/products")}`}>Products</Link>
          <Link to="/stock" className={`text-sm ${isActive("/stock")}`}>Stock</Link>
          <Link to="/expenses" className={`text-sm ${isActive("/expenses")}`}>Expenses</Link>
          <Link to="/revenue" className={`text-sm ${isActive("/revenue")}`}>Revenue</Link>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-600">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}





