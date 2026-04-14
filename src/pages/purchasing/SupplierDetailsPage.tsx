// src/pages/purchasing/SupplierDetailsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useSupplier } from '../../hooks/useSupplier';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { PurchaseOrder } from '../../types/purchaseOrder.types';

export const SupplierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supplier, loading: supplierLoading, fetchSupplier } = useSupplier();
  const { orders, fetchOrders } = usePurchaseOrders();
  const [activeTab, setActiveTab] = useState<'purchaseOrders' | 'products' | 'analytics'>('purchaseOrders');
  const [poFilter, setPoFilter] = useState('');

  const loadData = useCallback(async () => {
    if (id) {
      await fetchSupplier(id);
      await fetchOrders({ supplierId: id });
    }
  }, [id, fetchSupplier, fetchOrders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreatePO = () => {
    navigate(`/purchasing/orders/new?supplier=${id}`);
  };

  const handleEdit = () => {
    navigate(`/purchasing/suppliers/${id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      // Delete logic
      navigate('/purchasing/suppliers');
    }
  };

  const handleBack = () => {
    navigate('/purchasing/suppliers');
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'secondary',
      submitted: 'info',
      confirmed: 'primary',
      shipped: 'warning',
      delivered: 'success',
      cancelled: 'danger',
    };
    return colors[status] || 'secondary';
  };

  const filteredOrders = orders.filter(order => 
    order.poNumber.toLowerCase().includes(poFilter.toLowerCase())
  );

  if (supplierLoading) {
    return <LoadingSpinner />;
  }

  if (!supplier) {
    return <div className="text-center p-5">Supplier not found</div>;
  }

  return (
    <div className="supplier-details-page">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <button className="btn btn-link text-decoration-none mb-2" onClick={handleBack}>
            ← Back to Suppliers
          </button>
          <h1>{supplier.name}</h1>
        </div>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={handleEdit}>
            Edit
          </button>
          <button className="btn btn-outline-danger me-2" onClick={handleDelete}>
            Delete
          </button>
          <button className="btn btn-primary" onClick={handleCreatePO}>
            Create Purchase Order
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Contact Information</h6>
              <p className="mb-1"><strong>Contact Person:</strong> {supplier.contactPerson}</p>
              <p className="mb-1"><strong>Email:</strong> {supplier.email}</p>
              <p className="mb-1"><strong>Phone:</strong> {supplier.phone}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Address</h6>
              <p className="mb-1">{supplier.address}</p>
              <p className="mb-1">{supplier.city}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Payment Terms</h6>
              <p className="mb-1">{supplier.paymentTerms}</p>
              <hr />
              <h6 className="card-subtitle mb-2 text-muted">Performance</h6>
              <p className="mb-1"><strong>Rating:</strong> {'★'.repeat(supplier.rating)}</p>
              <p className="mb-1"><strong>Total Orders:</strong> {supplier.totalOrders}</p>
              <p className="mb-1"><strong>On-Time Delivery:</strong> {supplier.onTimeDelivery}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'purchaseOrders' ? 'active' : ''}`}
                onClick={() => setActiveTab('purchaseOrders')}
              >
                Purchase Orders
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Products Supplied
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {activeTab === 'purchaseOrders' && (
            <div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter by PO number..."
                  value={poFilter}
                  onChange={(e) => setPoFilter(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.poNumber}</td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge bg-${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6>Delivery Performance</h6>
                    <div className="progress mb-2">
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${supplier.onTimeDelivery}%` }}
                      >
                        {supplier.onTimeDelivery}%
                      </div>
                    </div>
                    <div className="text-muted small">On-Time Delivery Rate</div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6>Order Volume</h6>
                    <h3 className="text-center">{supplier.totalOrders}</h3>
                    <div className="text-muted small text-center">Total Orders</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailsPage;