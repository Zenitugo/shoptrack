import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/revenue/summary"),
      api.get("/products/low-stock")
    ]).then(([summaryRes, lowStockRes]) => {
      setSummary(summaryRes.data)
      setLowStock(lowStockRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Welcome back, {user?.name}! 👋
      </h1>
      <p className="text-gray-500 mb-8">
        {user?.business_name ? `${user.business_name} — ` : ""}Business Overview
      </p>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">
            ${summary?.total_revenue?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-red-500">
            ${summary?.total_expenses?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Net Profit</p>
          <p className={`text-3xl font-bold ${summary?.net_profit >= 0 ? "text-blue-600" : "text-red-600"}`}>
            ${summary?.net_profit?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            ⚠️ Low Stock Alerts
            {lowStock.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {lowStock.length} items
              </span>
            )}
          </h2>
          <Link to="/products" className="text-blue-600 text-sm hover:underline">
            View all products
          </Link>
        </div>

        {lowStock.length === 0 ? (
          <p className="text-gray-400 text-center py-4">✅ All stock levels are healthy</p>
        ) : (
          <div className="space-y-3">
            {lowStock.map(product => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-500 font-medium">{product.quantity_in_stock} left</p>
                  <p className="text-xs text-gray-400">Reorder at {product.reorder_level}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Add Product", to: "/products", color: "bg-blue-600" },
          { label: "Record Stock", to: "/stock", color: "bg-green-600" },
          { label: "Add Expense", to: "/expenses", color: "bg-orange-500" },
          { label: "Record Revenue", to: "/revenue", color: "bg-purple-600" },
        ].map(action => (
          <Link
            key={action.label}
            to={action.to}
            className={`${action.color} text-white text-center py-3 rounded-lg text-sm font-medium hover:opacity-90`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}