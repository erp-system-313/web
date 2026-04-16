import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Input, Select, Card, Tree, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Category, CreateCategoryDto } from '../../types/category.types';
import { useCategories } from '../../hooks/useCategories';
import styles from './CategoryListPage.module.css';

const schema = yup.object({
  name: yup.string().required('Category name is required'),
  description: yup.string().default(''),
  parentId: yup.string().nullable().default(null),
});

type CategoryFormData = yup.InferType<typeof schema>;

export const CategoryListPage: React.FC = () => {
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '', parentId: null },
  });

  const loadCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onSubmit = async (data: CategoryFormData) => {
    const categoryData: CreateCategoryDto = { name: data.name, description: data.description || '', parentId: data.parentId || null };
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryData);
    } else {
      await createCategory(categoryData);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset({ name: '', description: '', parentId: null });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    reset({ name: category.name, description: category.description, parentId: category.parentId });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  const buildTreeData = () => {
    return categories.filter(cat => !cat.parentId).map(cat => ({
      key: cat.id,
      title: (
        <Space>
          <span>{cat.name}</span>
          <span style={{ color: '#999', fontSize: 12 }}>({cat.productCount} products)</span>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(cat)} />
          <Popconfirm title="Delete this category?" onConfirm={() => handleDelete(cat.id)} okText="Delete" okType="danger">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      children: categories.filter(child => child.parentId === cat.id).map(child => ({
        key: child.id,
        title: (
          <Space>
            <span>{child.name}</span>
            <span style={{ color: '#999', fontSize: 12 }}>({child.productCount} products)</span>
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(child)} />
            <Popconfirm title="Delete this category?" onConfirm={() => handleDelete(child.id)} okText="Delete" okType="danger">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      })),
    }));
  };

  const parentCategoryOptions = categories.filter(cat => cat.id !== editingCategory?.id).map(cat => ({ value: cat.id, label: cat.name }));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Category</Button>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>No categories found. Click "Add Category" to create one.</div>
        ) : (
          <Tree showLine defaultExpandAll treeData={buildTreeData()} />
        )}
      </Card>

      <Modal title={editingCategory ? 'Edit Category' : 'Add Category'} open={isModalOpen} onCancel={handleCloseModal} footer={null}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Category Name *</label>
            <Input {...register('name')} status={errors.name ? 'error' : undefined} />
            {errors.name && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errors.name.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
            <Input.TextArea {...register('description')} rows={3} />
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Parent Category</label>
            <Select {...register('parentId')} placeholder="None (Top Level)" allowClear style={{ width: '100%' }} options={parentCategoryOptions} />
          </div>
          <div className={styles.formActions}>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="primary" htmlType="submit">{editingCategory ? 'Update Category' : 'Save Category'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryListPage;
