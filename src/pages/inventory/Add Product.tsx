// src/pages/inventory/AddProduct.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/forms/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types/product.types';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('basic');

  const handleSubmit = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createProduct(productData);
      navigate('/inventory/products');
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  return (
    <div className="add-product-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Add New Product</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/inventory/products')}
        >
          Cancel
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Info
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                Pricing
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                Inventory
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'images' ? 'active' : ''}`}
                onClick={() => setActiveTab('images')}
              >
                Images
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          <ProductForm 
            onSubmit={handleSubmit}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};