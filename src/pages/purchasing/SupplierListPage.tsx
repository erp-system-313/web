// src/pages/purchasing/SupplierListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useSuppliers } from '../../hooks/useSuppliers';
import { Supplier, SupplierFilters } from '../../types/supplier.types';

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, loading, totalPages, fetchSuppliers } = useSuppliers();
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState<SupplierFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSuppliers = useCallback(async () => {
    await fetchSuppliers({ ...filters, name: searchTerm }, currentPage);
  }, [fetchSuppliers, filters, searchTerm, currentPage]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleCityFilter = (city: string) => {
    setFilters({ ...filters, city });
    setCurrentPage(1);
  };

  const handleRatingFilter = (rating: number) => {
    setFilters({ ...filters, rating });
    setCurrentPage(1);
  };

  const handleViewSupplier = (id: string) => {
    navigate(`/purchasing/suppliers/${id}`);
  };

  const handleCreatePO = (supplierId: string) => {
    navigate(`/purchasing/orders/new?supplier=${supplierId}`);
  };

  const handleAddSupplier = () => {
    navigate('/purchasing/suppliers/new');
  };

  const renderStars = (rating: number): string => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="supplier-list-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Suppliers</h1>
        <button className="btn btn-primary" onClick={handleAddSupplier}>
          + Add Supplier
        </button>
      </div>

      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search suppliers by name..."
      />

      <div className="filter-bar d-flex gap-3 mb-4">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Filter by city"
          onChange={(e) => handleCityFilter(e.target.value)}
        />
        <select
          className="form-select w-auto"
          onChange={(e) => handleRatingFilter(parseInt(e.target.value))}
        >
          <option value="">All Ratings</option>
          <option value="5">★★★★★ (5)</option>
          <option value="4">★★★★☆ (4+)</option>
          <option value="3">★★★☆☆ (3+)</option>
        </select>
        
        <div className="btn-group ms-auto">
          <button
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td><strong>{supplier.name}</strong></td>
                  <td>{supplier.contactPerson}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.city}</td>
                  <td>{renderStars(supplier.rating)}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleViewSupplier(supplier.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleCreatePO(supplier.id)}
                    >
                      Create PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="supplier-grid row">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{supplier.name}</h5>
                  <div className="text-muted small mb-2">{renderStars(supplier.rating)}</div>
                  <p className="card-text">
                    <strong>Contact:</strong> {supplier.contactPerson}<br />
                    <strong>Phone:</strong> {supplier.phone}<br />
                    <strong>Email:</strong> {supplier.email}<br />
                    <strong>City:</strong> {supplier.city}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <button 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleViewSupplier(supplier.id)}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleCreatePO(supplier.id)}
                  >
                    Create PO
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default SupplierListPage;