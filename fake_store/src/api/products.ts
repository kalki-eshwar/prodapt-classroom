import axios from 'axios'

export type Product = {
  id: number
  product: string
  price: number
  category: string
}

type FakeStoreProduct = {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating?: {
    rate: number
    count: number
  }
}

const BASE_URL = 'https://fakestoreapi.com/products'

function toInternal(product: FakeStoreProduct): Product {
  return {
    id: product.id,
    product: product.title,
    price: product.price,
    category: product.category,
  }
}

function toExternal(payload: Omit<Product, 'id'>): Partial<FakeStoreProduct> {
  return {
    title: payload.product,
    price: payload.price,
    category: payload.category,
    description: payload.product,
    image: 'https://via.placeholder.com/150',
  }
}

export async function getProducts(): Promise<Product[]> {
  const response = await axios.get<FakeStoreProduct[]>(BASE_URL)
  return response.data.map(toInternal)
}

export async function createProduct(
  payload: Omit<Product, 'id'>,
): Promise<Product> {
  const response = await axios.post<FakeStoreProduct>(BASE_URL, toExternal(payload))
  return toInternal(response.data)
}

export async function updateProduct(
  id: number,
  payload: Omit<Product, 'id'>,
): Promise<Product> {
  const response = await axios.put<FakeStoreProduct>(`${BASE_URL}/${id}`, toExternal(payload))
  return toInternal(response.data)
}

export async function deleteProduct(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`)
}
