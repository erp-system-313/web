export interface Category {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  parentId: string | null;
}
