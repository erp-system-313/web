// src/pages/purchasing/SupplierDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Supplier } from '../../types/supplier.types';
import { PurchaseOrder } from '../../types/purchaseOrder.types';
import { useSuppliers } from '../../hooks/useSuppliers';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SupplierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState('purchaseOrders');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const { fetchSupplierById, fetchSupplierOrders } = useSuppliers();

  useEffect(() => {
    if (id) {
      loadSupplierData();
    }
  }, [id]);

  const loadSupplierData = async () => {
    const supplierData = await fetchSupplierById(id!);
    const ordersData = await fetchSupplierOrders(id!);
    setSupplier(supplierData);
    setPurchaseOrders(ordersData);
  };

  if (!supplier) return <LoadingSpinner />;

  return (
    <div className="supplier-details-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <button className="btn btn-link text-decoration-none mb-2" onClick={() => navigate('/purchasing/suppliers')}>
            ← Back to Suppliers
          </button>
          <h1>{supplier.name}</h1>
        </div>
        <div>
          <button className="btn btn-outline-primary me-2">Edit</button>
          <button className="btn btn-outline-danger me-2">Delete</button>
          <button className="btn btn-primary">Create Purchase Order</button>
        </div>
      </div>

      {/* Info Cards Row */}
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

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'purchaseOrders' ? 'active' : ''}`}
                onClick={() => setActiveTab('purchaseOrders')}>
                Purchase Orders
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}>
                Products Supplied
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}>
                Analytics
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {activeTab === 'purchaseOrders' && (
            <div>
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Filter POs..." />
              </div>
              <table className="table">
                <thead>
                  <tr><th>PO Number</th><th>Date</th><th>Status</th><th>Total</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {purchaseOrders.map(po => (
                    <tr key={po.id}>
                      <td>{po.poNumber}</td>
                      <td>{po.orderDate}</td>
                      <td><span className={`badge bg-${getStatusColor(po.status)}`}>{po.status}</span></td>
                      <td>${po.totalAmount}</td>
                      <td><button className="btn btn-sm btn-outline-primary">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6>Delivery Performance</h6>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-success" style={{ width: `${supplier.onTimeDelivery}%` }}>
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
                    <h6>Order Volume Trend</h6>
                    <canvas id="orderChart" height="200"></canvas>
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

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'secondary',
    submitted: 'info',
    confirmed: 'primary',
    shipped: 'warning',
    delivered: 'success',
    cancelled: 'danger'
  };
  return colors[status] || 'secondary';
};