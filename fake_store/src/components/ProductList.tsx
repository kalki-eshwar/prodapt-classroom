import type { Product } from '../api/products'

type ProductListProps = {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Price</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.product}</td>
            <td>{item.price}</td>
            <td>{item.category}</td>
            <td className="actions">
              <button type="button" onClick={() => onEdit(item)}>
                Edit
              </button>
              <button type="button" onClick={() => onDelete(item.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ProductList
