// src/pages/inventory/ProductList.tsx
import React, { useState, useEffect } from 'react';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Product, ProductFilters } from '../../types/product.types';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/formatters';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { fetchProducts, deleteProduct } = useProducts();

  useEffect(() => {
    loadProducts();
  }, [filters, currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    const result = await fetchProducts(filters, currentPage);
    setProducts(result.data);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters({ ...filters, categoryId });
    setCurrentPage(1);
  };

  const handleStockStatusFilter = (status: string) => {
    setFilters({ ...filters, stockStatus: status as any });
    setCurrentPage(1);
  };

  const handlePriceRangeFilter = (min: number, max: number) => {
    setFilters({ ...filters, minPrice: min, maxPrice: max });
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const getStockStatusBadge = (product: Product) => {
    if (product.stockQuantity === 0) {
      return <span className="badge bg-danger">Out of Stock</span>;
    }
    if (product.stockQuantity <= product.reorderPoint) {
      return <span className="badge bg-warning">Low Stock</span>;
    }
    return <span className="badge bg-success">In Stock</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="product-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products</h1>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/inventory/products/new'}
        >
          + Add Product
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search products by name or SKU..."
      />

      {/* Filter Panel */}
      <div className="filter-panel card p-3 mb-4">
        <div className="row">
          <div className="col-md-4">
            <label>Category</label>
            <select 
              className="form-select"
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="cat1">Electronics</option>
              <option value="cat2">Clothing</option>
              <option value="cat3">Food</option>
            </select>
          </div>
          
          <div className="col-md-3">
            <label>Stock Status</label>
            <select 
              className="form-select"
              onChange={(e) => handleStockStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          
          <div className="col-md-5">
            <label>Price Range</label>
            <div className="d-flex gap-2">
              <input 
                type="number" 
                className="form-control" 
                placeholder="Min Price"
                onChange={(e) => handlePriceRangeFilter(Number(e.target.value), filters.maxPrice || 0)}
              />
              <span className="align-self-center">-</span>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Max Price"
                onChange={(e) => handlePriceRangeFilter(filters.minPrice || 0, Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Product Info</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div>
                    <strong>{product.name}</strong>
                    <div className="text-muted small">{product.description}</div>
                  </div>
                </td>
                <td>{product.sku}</td>
                <td>{product.categoryName}</td>
                <td>
                  <div>{product.stockQuantity} units</div>
                  <div className="mt-1">{getStockStatusBadge(product)}</div>
                </td>
                <td>
                  <div>{formatCurrency(product.unitPrice)}</div>
                  <div className="text-muted small">Cost: {formatCurrency(product.costPrice)}</div>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => window.location.href = `/inventory/products/${product.id}`}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => window.location.href = `/inventory/products/${product.id}/edit`}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};