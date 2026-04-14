// src/pages/purchasing/CreatePurchaseOrderPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useSuppliers } from '../../hooks/useSuppliers';
import { CreatePurchaseOrderDto, PurchaseOrderItem } from '../../types/purchaseOrder.types';
import { Supplier } from '../../types/supplier.types';

export const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPurchaseOrder } = usePurchaseOrders();
  const { suppliers, fetchSuppliers } = useSuppliers();
  
  const defaultSupplierId = searchParams.get('supplier') || '';
  
  const [formData, setFormData] = useState({
    supplierId: defaultSupplierId,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    paymentTerms: 'Net 30',
    notes: '',
    status: 'draft' as const,
    items: [] as PurchaseOrderItem[],
  });
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers({}, 1);
  }, [fetchSuppliers]);

  useEffect(() => {
    if (formData.supplierId && suppliers.length > 0) {
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      setSelectedSupplier(supplier || null);
    }
  }, [formData.supplierId, suppliers]);

  const handleSupplierChange = (supplierId: string) => {
    setFormData({ ...formData, supplierId });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now().toString(),
          productId: '',
          productName: '',
          productSku: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.1;
    const shippingCost = 50;
    const totalAmount = subtotal + taxAmount + shippingCost;
    return { subtotal, taxAmount, shippingCost, totalAmount };
  };

  const handleSave = async (status: 'draft' | 'submitted') => {
    setIsSubmitting(true);
    const totals = calculateTotals();
    const poData: CreatePurchaseOrderDto = {
      ...formData,
      ...totals,
      status,
    };
    
    try {
      await createPurchaseOrder(poData);
      navigate('/purchasing/orders');
    } catch (error) {
      console.error('Failed to create purchase order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/purchasing/orders');
  };

  const totals = calculateTotals();

  return (
    <div className="create-purchase-order-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Create Purchase Order</h1>
        <div>
          <button 
            className="btn btn-secondary me-2" 
            onClick={() => handleSave('draft')}
            disabled={isSubmitting}
          >
            Save Draft
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleSave('submitted')}
            disabled={isSubmitting}
          >
            Submit Order
          </button>
          <button className="btn btn-outline-secondary ms-2" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Supplier Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Select Supplier *</label>
                <select
                  className="form-select"
                  value={formData.supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  required
                >
                  <option value="">Choose a supplier...</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.city}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedSupplier && (
                <div className="supplier-info-card bg-light p-3 rounded">
                  <p className="mb-1"><strong>Contact:</strong> {selectedSupplier.contactPerson}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedSupplier.email}</p>
                  <p className="mb-1"><strong>Phone:</strong> {selectedSupplier.phone}</p>
                  <p className="mb-0"><strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Order Lines</h5>
              <button className="btn btn-sm btn-primary" onClick={addProduct}>
                + Add Product
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ width: '40%' }}>
                          <select
                            className="form-select"
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          >
                            <option value="">Select product</option>
                            <option value="prod1">Product A (SKU: A001)</option>
                            <option value="prod2">Product B (SKU: B002)</option>
                            <option value="prod3">Product C (SKU: C003)</option>
                          </select>
                        </td>
                        <td style={{ width: '20%' }}>
                          <input
                            type="number"
                            className="form-control"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          />
                        </td>
                        <td style={{ width: '20%' }}>
                          <input
                            type="number"
                            className="form-control"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                          />
                        </td>
                        <td style={{ width: '15%' }}>
                          ${item.totalPrice.toFixed(2)}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {formData.items.length === 0 && (
                <div className="text-center p-4 text-muted">
                  No products added yet. Click "Add Product" to start.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Details</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Order Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Expected Delivery Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Payment Terms</label>
                <select
                  className="form-select"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                >
                  <option>Net 30</option>
                  <option>Net 60</option>
                  <option>Net 90</option>
                  <option>COD</option>
                  <option>Prepaid</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions, shipping notes, etc."
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>${totals.taxAmount.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${totals.shippingCost.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>${totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderPage;