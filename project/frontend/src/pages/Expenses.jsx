import { useState, useEffect } from "react"
import api from "../services/api"

const CATEGORIES = ["supplier", "rent", "utilities", "salaries", "equipment", "other"]

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: "supplier", amount: "", description: "" })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [expRes, sumRes] = await Promise.all([
      api.get("/expenses/"),
      api.get("/expenses/summary")
    ])
    setExpenses(expRes.data)
    setSummary(sumRes.data)
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await api.post("/expenses/", { ...form, amount: parseFloat(form.amount) })
    setForm({ category: "supplier", amount: "", description: "" })
    setShowForm(false)
    fetchData()
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {/* Total */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-sm text-gray-500">Total Expenses</p>
        <p className="text-3xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
      </div>

      {/* Summary by Category */}
      {summary.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">By Category</h2>
          <div className="grid grid-cols-3 gap-4">
            {summary.map(s => (
              <div key={s.category} className="border rounded p-3">
                <p className="text-sm text-gray-500 capitalize">{s.category}</p>
                <p className="text-lg font-semibold text-gray-800">${s.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Expense</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
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
              Save Expense
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-400 text-lg">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Category", "Amount", "Description", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-sm font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full capitalize">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-red-500">${expense.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{expense.description || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {new Date(expense.created_at).toLocaleDateString()}
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