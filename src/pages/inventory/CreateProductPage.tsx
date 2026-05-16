import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Tabs, Input, InputNumber, Select, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useProducts } from "../../hooks/useProducts";
import { inventoryService } from "../../services/inventoryService";
import type { Category } from "../../types/category.types";
import { FormCard } from "../../components/common";
import formStyles from "../../components/common/FormCard/FormCard.module.css";

const basicInfoSchema = yup.object({
  name: yup.string().required("Product name is required"),
  sku: yup.string().required("SKU is required"),
  description: yup.string().default(""),
  categoryId: yup
    .number()
    .required("Category is required")
    .typeError("Category is required"),
});

const pricingSchema = yup.object({
  unitPrice: yup
    .number()
    .required("Unit price is required")
    .min(0, "Price must be positive"),
  costPrice: yup
    .number()
    .required("Cost price is required")
    .min(0, "Price must be positive"),
});

const inventorySchema = yup.object({
  currentStock: yup
    .number()
    .required("Stock quantity is required")
    .min(0, "Quantity must be positive"),
  reorderLevel: yup
    .number()
    .required("Reorder point is required")
    .min(0, "Must be positive"),
});

type BasicInfoData = yup.InferType<typeof basicInfoSchema>;
type PricingData = yup.InferType<typeof pricingSchema>;
type InventoryData = yup.InferType<typeof inventorySchema>;

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    inventoryService
      .getCategories(1, 100)
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => {});
  }, []);

  const {
    handleSubmit: submitBasic,
    control: controlBasic,
    formState: { errors: errorsBasic },
  } = useForm<BasicInfoData>({
    resolver: yupResolver(basicInfoSchema),
    mode: "onBlur",
  });

  const {
    control: pricingControl,
    formState: { errors: errorsPricing },
    getValues: getPricingValues,
  } = useForm<PricingData>({
    resolver: yupResolver(pricingSchema),
    mode: "onBlur",
    defaultValues: { unitPrice: 0, costPrice: 0 },
  });

  const {
    control: inventoryControl,
    formState: { errors: errorsInventory },
    getValues: getInventoryValues,
  } = useForm<InventoryData>({
    resolver: yupResolver(inventorySchema),
    mode: "onBlur",
    defaultValues: { currentStock: 0, reorderLevel: 0 },
  });

  const [basicData, setBasicData] = useState<BasicInfoData | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);

  const handleBasicSubmit = (data: BasicInfoData) => {
    setBasicData(data);
    setActiveTab("pricing");
  };

  const handlePricingSubmit = () => {
    const data = getPricingValues();
    setPricingData(data);
    setActiveTab("inventory");
  };

  const handleInventorySubmit = async () => {
    const inventoryValues = getInventoryValues();
    setIsSubmitting(true);
    try {
      if (basicData && pricingData) {
        await createProduct({
          name: basicData.name,
          sku: basicData.sku,
          description: basicData.description || "",
          categoryId: basicData.categoryId,
          unitPrice: pricingData.unitPrice,
          costPrice: pricingData.costPrice,
          currentStock: inventoryValues.currentStock,
          reorderLevel: inventoryValues.reorderLevel,
        });
        message.success("Product created successfully");
        navigate("/inventory/products");
      }
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const tabItems = [
    {
      key: "basic",
      label: "Basic Info",
      children: (
        <form onSubmit={submitBasic(handleBasicSubmit)}>
          <div className={formStyles.formItem}>
            <label>Product Name *</label>
            <Controller
              name="name"
              control={controlBasic}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter product name"
                  status={errorsBasic.name ? "error" : undefined}
                />
              )}
            />
            {errorsBasic.name && (
              <span className={formStyles.error}>
                {errorsBasic.name.message}
              </span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>SKU *</label>
            <Controller
              name="sku"
              control={controlBasic}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter SKU"
                  status={errorsBasic.sku ? "error" : undefined}
                />
              )}
            />
            {errorsBasic.sku && (
              <span className={formStyles.error}>
                {errorsBasic.sku.message}
              </span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Category *</label>
            <Controller
              name="categoryId"
              control={controlBasic}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select category"
                  style={{ width: "100%" }}
                  options={categoryOptions}
                  status={errorsBasic.categoryId ? "error" : undefined}
                />
              )}
            />
            {errorsBasic.categoryId && (
              <span className={formStyles.error}>
                {errorsBasic.categoryId.message}
              </span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Description</label>
            <Controller
              name="description"
              control={controlBasic}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={4}
                  placeholder="Enter product description"
                />
              )}
            />
          </div>
          <div className={formStyles.actions}>
            <Button onClick={() => navigate("/inventory/products")}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </div>
        </form>
      ),
    },
    {
      key: "pricing",
      label: "Pricing",
      children: (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePricingSubmit();
          }}
        >
          <div className={formStyles.formItem}>
            <label>Unit Price *</label>
            <Controller
              name="unitPrice"
              control={pricingControl}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 0)}
                  prefix="$"
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  status={errorsPricing.unitPrice ? "error" : undefined}
                />
              )}
            />
            {errorsPricing.unitPrice && (
              <span className={formStyles.error}>
                {errorsPricing.unitPrice.message}
              </span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Cost Price *</label>
            <Controller
              name="costPrice"
              control={pricingControl}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 0)}
                  prefix="$"
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  status={errorsPricing.costPrice ? "error" : undefined}
                />
              )}
            />
            {errorsPricing.costPrice && (
              <span className={formStyles.error}>
                {errorsPricing.costPrice.message}
              </span>
            )}
          </div>
          <div className={formStyles.actions}>
            <Button onClick={() => setActiveTab("basic")}>Previous</Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </div>
        </form>
      ),
    },
    {
      key: "inventory",
      label: "Inventory",
      children: (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInventorySubmit();
          }}
        >
          <div className={formStyles.formItem}>
            <label>Stock Quantity *</label>
            <Controller
              name="currentStock"
              control={inventoryControl}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 0)}
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  status={errorsInventory.currentStock ? "error" : undefined}
                />
              )}
            />
            {errorsInventory.currentStock && (
              <span className={formStyles.error}>
                {errorsInventory.currentStock.message}
              </span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Reorder Point *</label>
            <Controller
              name="reorderLevel"
              control={inventoryControl}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 0)}
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  status={errorsInventory.reorderLevel ? "error" : undefined}
                />
              )}
            />
            {errorsInventory.reorderLevel && (
              <span className={formStyles.error}>
                {errorsInventory.reorderLevel.message}
              </span>
            )}
          </div>
          <div className={formStyles.actions}>
            <Button
              onClick={() => setActiveTab("pricing")}
              disabled={isSubmitting}
            >
              Previous
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Create Product
            </Button>
          </div>
        </form>
      ),
    },
  ];

  return (
    <FormCard title="Add New Product" backPath="/inventory/products">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </FormCard>
  );
};

export default CreateProductPage;
