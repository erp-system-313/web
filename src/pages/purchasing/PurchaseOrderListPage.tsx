// src/pages/purchasing/PurchaseOrderListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types/purchaseOrder.types';

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, totalPages, fetchOrders, deleteOrder } = usePurchaseOrders();
  
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = useCallback(async () => {
    await fetchOrders({
      status: statusFilter || undefined,
      search: searchTerm,
    }, currentPage);
  }, [fetchOrders, statusFilter, searchTerm, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: PurchaseOrderStatus | '') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCreatePO = () => {
    navigate('/purchasing/orders/new');
  };

  const handleViewOrder = (id: string) => {
    navigate(`/purchasing/orders/${id}`);
  };

  const handleEditOrder = (id: string) => {
    navigate(`/purchasing/orders/${id}/edit`);
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      await deleteOrder(id);
      await loadOrders();
    }
  };

  const getStatusBadge = (status: PurchaseOrderStatus): JSX.Element => {
    const classes: Record<PurchaseOrderStatus, string> = {
      draft: 'secondary',
      submitted: 'info',
      confirmed: 'primary',
      shipped: 'warning',
      delivered: 'success',
      cancelled: 'danger',
    };
    return <span className={`badge bg-${classes[status]}`}>{status}</span>;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="purchase-order-list-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Purchase Orders</h1>
        <button className="btn btn-primary" onClick={handleCreatePO}>
          + Create Purchase Order
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search by PO number or supplier..."
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as PurchaseOrderStatus | '')}
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
                  <button 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    View
                  </button>
                  {order.status === 'draft' && (
                    <>
                      <button 
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleEditOrder(order.id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center p-5 text-muted">
          No purchase orders found. Click "Create Purchase Order" to get started.
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

export default PurchaseOrderListPage;