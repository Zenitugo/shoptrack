import { useState, useEffect } from "react"
import api from "../services/api"

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: "", category: "", unit_price: "",
    quantity_in_stock: "", reorder_level: "10", description: ""
  })

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const res = await api.get("/products/")
    setProducts(res.data)
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await api.post("/products/", {
      ...form,
      unit_price: parseFloat(form.unit_price),
      quantity_in_stock: parseInt(form.quantity_in_stock) || 0,
      reorder_level: parseInt(form.reorder_level) || 10
    })
    setForm({ name: "", category: "", unit_price: "", quantity_in_stock: "", reorder_level: "10", description: "" })
    setShowForm(false)
    fetchProducts()
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return
    await api.delete(`/products/${id}`)
    fetchProducts()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Product</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Product name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="text" placeholder="Category" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input type="number" placeholder="Unit price" value={form.unit_price}
                onChange={e => setForm({ ...form, unit_price: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="number" placeholder="Quantity in stock" value={form.quantity_in_stock}
                onChange={e => setForm({ ...form, quantity_in_stock: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Reorder level" value={form.reorder_level}
                onChange={e => setForm({ ...form, reorder_level: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <textarea placeholder="Description (optional)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Save Product
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading products...</p>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-400 text-lg">No products yet</p>
          <p className="text-gray-300 text-sm mt-2">Add your first product above</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Category", "Price", "Stock", "Reorder Level", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-sm font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500">{product.category || "—"}</td>
                  <td className="px-4 py-3 text-gray-800">${product.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-800">{product.quantity_in_stock}</td>
                  <td className="px-4 py-3 text-gray-500">{product.reorder_level}</td>
                  <td className="px-4 py-3">
                    {product.is_low_stock ? (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-600 text-sm">Delete</button>
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