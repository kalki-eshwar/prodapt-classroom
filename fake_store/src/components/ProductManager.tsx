import { useEffect, useState, type FormEvent } from 'react'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api/products'
import type { Product } from '../api/products'
import ProductList from './ProductList'

type ProductManagerProps = {
  userName: string
  onLogout: () => void
}

const ProductManager = ({ userName, onLogout }: ProductManagerProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [product, setProduct] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      setError('')
      const data = await getProducts()
      setProducts(data)
    } catch {
      setError('Failed to load products. Check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  function clearForm() {
    setProduct('')
    setPrice('')
    setCategory('')
    setEditingId(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const priceValue = Number(price)
    if (!product.trim() || !category.trim() || Number.isNaN(priceValue)) {
      setError('Please provide product, category, and a valid price.')
      return
    }

    try {
      setError('')
      if (editingId !== null) {
        const updated = await updateProduct(editingId, {
          product: product.trim(),
          price: priceValue,
          category: category.trim(),
        })
        setProducts((prev) => prev.map((item) => (item.id === editingId ? updated : item)))
      } else {
        const created = await createProduct({
          product: product.trim(),
          price: priceValue,
          category: category.trim(),
        })
        setProducts((prev) => [...prev, created])
      }
      clearForm()
    } catch {
      setError('Save failed. Check the API and try again.')
    }
  }

  function startEdit(item: Product) {
    setEditingId(item.id)
    setProduct(item.product)
    setPrice(String(item.price))
    setCategory(item.category)
  }

  async function handleDelete(id: number) {
    try {
      setError('')
      await deleteProduct(id)
      setProducts((prev) => prev.filter((item) => item.id !== id))
      if (editingId === id) {
        clearForm()
      }
    } catch {
      setError('Delete failed. Check the API and try again.')
    }
  }

  return (
    <main className="app">
      <h1>Fake Store</h1>
      <p className="hint">
        Logged in as <strong>{userName}</strong>. Product operations use FakeStoreAPI.
      </p>
      <button className="logout-button" type="button" onClick={onLogout}>
        Logout
      </button>

      <form className="crud-form" onSubmit={handleSubmit}>
        <input
          value={product}
          onChange={(event) => setProduct(event.target.value)}
          placeholder="Product name"
        />
        <input
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Price"
          type="number"
          min="0"
          step="0.01"
        />
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category"
        />
        <button type="submit">{editingId !== null ? 'Update' : 'Create'}</button>
        {editingId !== null && (
          <button type="button" onClick={clearForm}>
            Cancel
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ProductList products={products} onEdit={startEdit} onDelete={handleDelete} />
      )}
    </main>
  )
}

export default ProductManager
