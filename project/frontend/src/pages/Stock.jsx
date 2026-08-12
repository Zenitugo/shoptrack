import { useState, useEffect } from "react"
import api from "../services/api"

const MOVEMENT_TYPES = ["in", "out", "return"]

export default function Stock() {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    product_id: "", movement_type: "in", quantity: "", notes: ""
  })

  useEffect(() => {
    Promise.all([
      api.get("/stock/"),
      api.get("/products/")
    ]).then(([movRes, prodRes]) => {
      setMovements(movRes.data)
      setProducts(prodRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const fetchMovements = async () => {
    const res = await api.get("/stock/")
    setMovements(res.data)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post("/stock/", {
        ...form,
        product_id: parseInt(form.product_id),
        quantity: parseInt(form.quantity)
      })
      setForm({ product_id: "", movement_type: "in", quantity: "", notes: "" })
      setShowForm(false)
      fetchMovements()
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to record stock movement")
    }
  }

  const getMovementBadge = (type) => {
    const styles = {
      in: "bg-green-100 text-green-600",
      out: "bg-red-100 text-red-600",
      return: "bg-yellow-100 text-yellow-600"
    }
    const labels = { in: "Received", out: "Sold", return: "Return" }
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${styles[type]}`}>
        {labels[type]}
      </span>
    )
  }

  const getProductName = (id) => {
    const product = products.find(p => p.id === id)
    return product ? product.name : "Unknown"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Movements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Record Movement"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Record Stock Movement</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <select
                value={form.product_id}
                onChange={e => setForm({ ...form, product_id: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.quantity_in_stock})
                  </option>
                ))}
              </select>
              <select
                value={form.movement_type}
                onChange={e => setForm({ ...form, movement_type: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MOVEMENT_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t === "in" ? "Receive Stock" : t === "out" ? "Sell Stock" : "Return"}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
            </div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Record Movement
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading movements...</p>
      ) : movements.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-400 text-lg">No stock movements yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Product", "Type", "Quantity", "Notes", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-sm font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{getProductName(m.product_id)}</td>
                  <td className="px-4 py-3">{getMovementBadge(m.movement_type)}</td>
                  <td className="px-4 py-3 text-gray-800">{m.quantity}</td>
                  <td className="px-4 py-3 text-gray-500">{m.notes || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {new Date(m.created_at).toLocaleDateString()}
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