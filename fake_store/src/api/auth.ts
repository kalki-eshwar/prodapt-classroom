export type AuthTokenResponse = {
  token: string
}

export type RegisterPayload = {
  username: string
  email: string
  password: string
}

export type LoginPayload = {
  username: string
  password: string
}

type LocalUser = {
  username: string
  email: string
  password: string
}

const LOCAL_USERS_KEY = 'fake_store_local_users'

function getLocalUsers(): LocalUser[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(LOCAL_USERS_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored) as LocalUser[]
  } catch {
    return []
  }
}

function saveLocalUser(user: LocalUser) {
  if (typeof window === 'undefined') return
  const users = getLocalUsers()
  const existing = users.find((item) => item.username === user.username)
  if (existing) return
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([...users, user]))
}

export async function registerUser(payload: RegisterPayload): Promise<AuthTokenResponse> {
  const existing = getLocalUsers().find((item) => item.username === payload.username || item.email === payload.email)
  if (existing) {
    throw new Error('Username or email already exists')
  }

  saveLocalUser({ username: payload.username, email: payload.email, password: payload.password })

  const token = btoa(`${payload.username}:${Date.now()}`)
  return { token }
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokenResponse> {
  const localUser = getLocalUsers().find(
    (item) => item.username === payload.username && item.password === payload.password,
  )

  if (!localUser) {
    throw new Error('Invalid username or password')
  }

  const token = btoa(`${payload.username}:${Date.now()}`)
  return { token }
}
