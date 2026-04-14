// src/pages/purchasing/PurchaseOrdersList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PurchaseOrder } from '../../types/purchaseOrder.types';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';

export const PurchaseOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchPurchaseOrders } = usePurchaseOrders();

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchTerm, currentPage]);

  const loadOrders = async () => {
    const data = await fetchPurchaseOrders({ status: statusFilter, search: searchTerm }, currentPage);
    setOrders(data);
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      draft: 'secondary',
      submitted: 'info',
      confirmed: 'primary',
      shipped: 'warning',
      delivered: 'success',
      cancelled: 'danger'
    };
    return <span className={`badge bg-${classes[status as keyof typeof classes]}`}>{status}</span>;
  };

  return (
    <div className="purchase-orders-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Purchase Orders</h1>
        <button className="btn btn-primary" onClick={() => navigate('/purchasing/orders/new')}>
          + Create Purchase Order
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <SearchBar onSearch={setSearchTerm} placeholder="Search by PO number or supplier..." />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.poNumber}</strong></td>
                <td>{order.supplierName}</td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">View</button>
                  {order.status === 'draft' && (
                    <>
                      <button className="btn btn-sm btn-outline-secondary me-2">Edit</button>
                      <button className="btn btn-sm btn-outline-danger">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
    </div>
  );
};