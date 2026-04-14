// src/pages/purchasing/SuppliersList.tsx
import React, { useState, useEffect } from 'react';
import { Supplier, SupplierFilters } from '../../types/supplier.types';
import { useSuppliers } from '../../hooks/useSuppliers';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';

export const SuppliersList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState<SupplierFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchSuppliers } = useSuppliers();

  useEffect(() => {
    loadSuppliers();
  }, [filters, currentPage]);

  const loadSuppliers = async () => {
    const data = await fetchSuppliers(filters, currentPage);
    setSuppliers(data);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="suppliers-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Suppliers</h1>
        <button className="btn btn-primary">
          + Add Supplier
        </button>
      </div>

      <SearchBar onSearch={(term) => setFilters({ ...filters, name: term })} />

      {/* Filter Bar */}
      <div className="filter-bar d-flex gap-3 mb-4">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Filter by city"
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <select
          className="form-select w-auto"
          onChange={(e) => setFilters({ ...filters, rating: parseInt(e.target.value) })}
        >
          <option value="">All Ratings</option>
          <option value="5">★★★★★ (5)</option>
          <option value="4">★★★★☆ (4+)</option>
          <option value="3">★★★☆☆ (3+)</option>
        </select>
        
        {/* View Toggle */}
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
                  <button className="btn btn-sm btn-outline-primary me-2">View</button>
                  <button className="btn btn-sm btn-outline-secondary me-2">Edit</button>
                  <button className="btn btn-sm btn-outline-success">Create PO</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  <button className="btn btn-sm btn-outline-primary me-2">View</button>
                  <button className="btn btn-sm btn-outline-success">Create PO</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
    </div>
  );
};