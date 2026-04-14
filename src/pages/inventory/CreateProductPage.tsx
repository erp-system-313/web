// src/pages/inventory/CreateProductPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/forms/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import { CreateProductDto } from '../../types/product.types';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'inventory' | 'images'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (productData: CreateProductDto) => {
    setIsSubmitting(true);
    try {
      await createProduct(productData);
      navigate('/inventory/products');
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory/products');
  };

  return (
    <div className="create-product-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Add New Product</h1>
        <button className="btn btn-secondary" onClick={handleCancel}>
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
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;