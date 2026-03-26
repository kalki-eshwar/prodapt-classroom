import { useState, type FormEvent } from 'react'
import { loginUser, registerUser } from '../api/auth'

type AuthFormProps = {
  onLoginSuccess: (username: string, token: string) => void
}

const AuthForm = ({ onLoginSuccess }: AuthFormProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('Please provide username and password.')
      return
    }

    try {
      setError('')
      const result = await loginUser({ username: username.trim(), password })
      localStorage.setItem('fake_store_token', result.token)
      localStorage.setItem('fake_store_user', username.trim())
      onLoginSuccess(username.trim(), result.token)
      setUsername('')
      setPassword('')
      setEmail('')
    } catch (err) {
      setError('Login failed. Check credentials and try again.')
      console.error(err)
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
      const result = await registerUser({ username: username.trim(), email: email.trim(), password })
      setAuthMode('login')
      setError('Registration successful. Please log in.')
      setUsername('')
      setPassword('')
      setEmail('')
      console.log('Registered local user', result)
    } catch (err) {
      setError('Registration failed. Try a different username/email.')
      console.error(err)
    }
  }

  return (
    <main className="app">
      <h1>Fake Store Auth</h1>

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
        <label htmlFor="username-input">Username</label>
        <input
          id="username-input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
        />

        {authMode === 'register' && (
          <>
            <label htmlFor="email-input">Email</label>
            <input
              id="email-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
            />
          </>
        )}

        <label htmlFor="password-input">Password</label>
        <input
          id="password-input"
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

export default AuthForm
