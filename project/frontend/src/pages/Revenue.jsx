import { useState, useEffect } from "react"
import api from "../services/api"

export default function Revenue() {
  const [revenues, setRevenues] = useState([])
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    product_id: "", quantity_sold: "", unit_price: "",
    total_amount: "", description: ""
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [revRes, prodRes, sumRes] = await Promise.all([
      api.get("/revenue/"),
      api.get("/products/"),
      api.get("/revenue/summary")
    ])
    setRevenues(revRes.data)
    setProducts(prodRes.data)
    setSummary(sumRes.data)
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await api.post("/revenue/", {
      product_id: form.product_id ? parseInt(form.product_id) : null,
      quantity_sold: form.quantity_sold ? parseInt(form.quantity_sold) : null,
      unit_price: parseFloat(form.unit_price),
      total_amount: parseFloat(form.total_amount),
      description: form.description || null
    })
    setForm({ product_id: "", quantity_sold: "", unit_price: "", total_amount: "", description: "" })
    setShowForm(false)
    fetchData()
  }

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      setForm({
        ...form,
        product_id: productId,
        unit_price: product.unit_price.toString()
      })
    } else {
      setForm({ ...form, product_id: productId })
    }
  }

  const getProductName = (id) => {
    const product = products.find(p => p.id === id)
    return product ? product.name : "Service / Other"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Revenue</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Record Revenue"}
        </button>
      </div>

      {/* Financial Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">${summary.total_revenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-500">${summary.total_expenses.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Net Profit</p>
            <p className={`text-3xl font-bold ${summary.net_profit >= 0 ? "text-blue-600" : "text-red-600"}`}>
              ${summary.net_profit.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Record Revenue</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                value={form.product_id}
                onChange={e => handleProductSelect(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Service / Other (no product)</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity sold (optional)"
                value={form.quantity_sold}
                onChange={e => setForm({ ...form, quantity_sold: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Unit price"
                value={form.unit_price}
                onChange={e => setForm({ ...form, unit_price: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
              <input
                type="number"
                placeholder="Total amount"
                value={form.total_amount}
                onChange={e => setForm({ ...form, total_amount: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Save Revenue
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading revenue...</p>
      ) : revenues.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-400 text-lg">No revenue recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Product / Service", "Qty Sold", "Unit Price", "Total", "Description", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-sm font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenues.map(rev => (
                <tr key={rev.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {getProductName(rev.product_id)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{rev.quantity_sold || "—"}</td>
                  <td className="px-4 py-3 text-gray-800">${rev.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-3 font-medium text-green-600">${rev.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{rev.description || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}