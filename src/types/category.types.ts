export interface Category {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  sortOrder?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  parentId: number | null;
}
