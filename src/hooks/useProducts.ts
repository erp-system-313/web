import { useState, useCallback } from "react";
import { message } from "antd";
import { inventoryService } from "../services/inventoryService";
import type {
  Product,
  CreateProductDto,
  ProductFilters,
} from "../types/product.types";

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  total: number;
  fetchProducts: (filters: ProductFilters, page: number) => Promise<void>;
  getProduct: (id: string) => Promise<Product | null>;
  createProduct: (data: CreateProductDto) => Promise<Product>;
  updateProduct: (
    id: string,
    data: Partial<CreateProductDto>,
  ) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(
    async (filters: ProductFilters, _page: number) => {
      setLoading(true);
      try {
        const result = await inventoryService.getProducts(filters);
        setProducts(result.data);
        setTotal(result.total);
      } catch (error) {
        message.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getProduct = useCallback(
    async (id: string): Promise<Product | null> => {
      try {
        return await inventoryService.getProduct(id);
      } catch (error) {
        message.error("Failed to fetch product");
        return null;
      }
    },
    [],
  );

  const createProduct = useCallback(
    async (data: CreateProductDto): Promise<Product> => {
      try {
        const product = await inventoryService.createProduct(data);
        message.success("Product created successfully");
        return product;
      } catch (error) {
        message.error("Failed to create product");
        throw error;
      }
    },
    [],
  );

  const updateProduct = useCallback(
    async (id: string, data: Partial<CreateProductDto>): Promise<Product> => {
      try {
        const product = await inventoryService.updateProduct(id, data);
        message.success("Product updated successfully");
        return product;
      } catch (error) {
        message.error("Failed to update product");
        throw error;
      }
    },
    [],
  );

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      await inventoryService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      message.success("Product deleted successfully");
    } catch (error) {
      message.error("Failed to delete product");
      throw error;
    }
  }, []);

  const searchProducts = useCallback(
    async (query: string): Promise<Product[]> => {
      try {
        const result = await inventoryService.getProducts({ search: query });
        return result.data;
      } catch (error) {
        message.error("Failed to search products");
        return [];
      }
    },
    [],
  );

  return {
    products,
    loading,
    total,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
  };
};

export default useProducts;
