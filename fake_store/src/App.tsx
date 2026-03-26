import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from './api/products'
import type { Product } from './api/products'
import { loginUser, registerUser } from './api/auth'
import ProductList from './components/ProductList'
import './App.css'
import { useContext } from 'react'
import { AppContext } from './AppContext'

function App() {
  const { projectTitle } = useContext(AppContext)

  const [products, setProducts] = useState<Product[]>([])
  const [product, setProduct] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('fake_store_token'),
  )
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem('fake_store_user'),
  )

  useEffect(() => {
    if (token) {
      loadProducts()
    }
  }, [token])

  async function loadProducts() {
    setLoading(true)
    setError('')

    try {
      const data = await getProducts()
      setProducts(data)
    } catch {
      setError('Failed to load products. Make sure FakeStore API is reachable.')
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

    if (!token) {
      setError('You must be logged in to manage products.')
      return
    }

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

        setProducts((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        )
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

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }

    try {
      setError('')
      const result = await loginUser({ username: username.trim(), password })
      setToken(result.token)
      setUserName(username.trim())
      localStorage.setItem('fake_store_token', result.token)
      localStorage.setItem('fake_store_user', username.trim())
      setUsername('')
      setPassword('')
      setEmail('')
    } catch {
      setError('Login failed. Check credentials and try again.')
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please provide username, email and password.')
      return
    }

    try {
      setError('')
      await registerUser({ username: username.trim(), email: email.trim(), password })
      setAuthMode('login')
      setError('Registration successful. Please log in.')
      setUsername('')
      setPassword('')
      setEmail('')
    } catch {
      setError('Registration failed. Try a different username/email.')
    }
  }

  function handleLogout() {
    setToken(null)
    setUserName(null)
    localStorage.removeItem('fake_store_token')
    localStorage.removeItem('fake_store_user')
    setProducts([])
    setError('Logged out successfully.')
  }

  if (!token) {
    return (
      <main className="app">
        <h1>Fake Store - Auth</h1>

        <div className="auth-switch">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login')
              setError('')
            }}
            disabled={authMode === 'login'}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register')
              setError('')
            }}
            disabled={authMode === 'register'}
          >
            Register
          </button>
        </div>

        <form className="crud-form" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
          />
          {authMode === 'register' && (
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
            />
          )}
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
          />
          <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
        </form>

        {error && <p className="error">{error}</p>}
      </main>
    )
  }

  return (
    <main className="app">
      <h1>Fake Store</h1>
      <p className="hint">
        Logged in as <strong>{userName}</strong>. All product operations use FakeStoreAPI.
      </p>
      <button className="logout-button" type="button" onClick={handleLogout}>
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
        <ProductList
          products={products}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      )}
    </main>
  )
}

export default App
