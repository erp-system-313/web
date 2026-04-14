// src/pages/inventory/ProductListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useProducts } from '../../hooks/useProducts';
import { Product, ProductFilters } from '../../types/product.types';
import { formatCurrency } from '../../utils/formatters';

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, totalPages, fetchProducts, deleteProduct } = useProducts();
  
  const [filters, setFilters] = useState<ProductFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProducts = useCallback(async () => {
    await fetchProducts({ ...filters, search: searchTerm }, currentPage);
  }, [fetchProducts, filters, searchTerm, currentPage]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters({ ...filters, categoryId });
    setCurrentPage(1);
  };

  const handleStockStatusFilter = (stockStatus: string) => {
    setFilters({ ...filters, stockStatus: stockStatus as any });
    setCurrentPage(1);
  };

  const handlePriceRangeFilter = (minPrice: number, maxPrice: number) => {
    setFilters({ ...filters, minPrice, maxPrice });
    setCurrentPage(1);
  };

  const handleAddProduct = () => {
    navigate('/inventory/products/new');
  };

  const handleViewProduct = (id: string) => {
    navigate(`/inventory/products/${id}`);
  };

  const handleEditProduct = (id: string) => {
    navigate(`/inventory/products/${id}/edit`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      await loadProducts();
    }
  };

  const getStockStatusBadge = (product: Product): JSX.Element => {
    if (product.stockQuantity === 0) {
      return <span className="badge bg-danger">Out of Stock</span>;
    }
    if (product.stockQuantity <= product.reorderPoint) {
      return <span className="badge bg-warning">Low Stock</span>;
    }
    return <span className="badge bg-success">In Stock</span>;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="product-list-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          + Add Product
        </button>
      </div>

      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search products by name or SKU..."
      />

      <div className="filter-panel card p-3 mb-4">
        <div className="row">
          <div className="col-md-4">
            <label className="form-label">Category</label>
            <select 
              className="form-select"
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
            </select>
          </div>
          
          <div className="col-md-3">
            <label className="form-label">Stock Status</label>
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
            <label className="form-label">Price Range</label>
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
                    onClick={() => handleViewProduct(product.id)}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProductListPage;