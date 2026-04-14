// src/pages/inventory/Categories.tsx
import React, { useState, useEffect } from 'react';
import { Category } from '../../types/category.types';
import { useCategories } from '../../hooks/useCategories';
import { Modal } from '../../components/common/Modal';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', parentId: '' });
  const { fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const handleSubmit = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await createCategory(formData);
    }
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', parentId: '' });
    loadCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      parentId: category.parentId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this category? Products will be uncategorized.')) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(category => (
        <div key={category.id}>
          <div className="d-flex justify-content-between align-items-center p-2" style={{ marginLeft: `${level * 20}px` }}>
            <div>
              <strong>{category.name}</strong>
              <div className="text-muted small">{category.description}</div>
              <span className="badge bg-secondary">{category.productCount} products</span>
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(category)}>
                Edit
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(category.id)}>
                Delete
              </button>
            </div>
          </div>
          {renderCategoryTree(category.id, level + 1)}
        </div>
      ));
  };

  return (
    <div className="categories-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Category
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {renderCategoryTree(null)}
        </div>
      </div>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
          setFormData({ name: '', description: '', parentId: '' });
        }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="mb-3">
          <label className="form-label">Category Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Parent Category</label>
          <select
            className="form-select"
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
          >
            <option value="">None (Top Level)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Save Category
        </button>
      </Modal>
    </div>
  );
};