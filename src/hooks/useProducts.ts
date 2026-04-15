import { useState, useCallback } from "react";
import { salesService } from "../services/salesService";
import type { Product } from "../types/sales";

export const useProducts = () => {
  const [loading, setLoading] = useState(false);

  const searchProducts = useCallback(
    async (query: string): Promise<Product[]> => {
      setLoading(true);
      try {
        const products = await salesService.products.search(query);
        return products;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { searchProducts, loading };
};
