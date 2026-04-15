import React, { useState, useEffect, useCallback } from "react";
import { AutoComplete } from "antd";
import type { SelectProps } from "antd";
import styles from "./Autocomplete.module.css";

interface SearchResult {
  value: string;
  label: React.ReactNode;
  id: number;
  data?: Record<string, unknown>;
}

interface AutocompleteProps {
  placeholder?: string;
  value?: number | null;
  onChange?: (id: number | null, item?: SearchResult) => void;
  fetchOptions: (query: string) => Promise<unknown[]>;
  displayFormatter?: (item: Record<string, unknown>) => string;
  disabled?: boolean;
  allowClear?: boolean;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  fetchOptions,
  displayFormatter = (item) => `${item.name} (ID: ${item.id})`,
  disabled = false,
  allowClear = true,
}) => {
  const [options, setOptions] = useState<SelectProps["options"]>([]);
  const [searchValue, setSearchValue] = useState("");

  const loadOptions = useCallback(async () => {
    const results = await fetchOptions(searchValue);
    const mapped: SelectProps["options"] = (
      results as Record<string, unknown>[]
    ).map((item) => ({
      value: String(item.id),
      label: displayFormatter(item),
      id: item.id as number,
      data: item,
    }));
    setOptions(mapped);
  }, [searchValue, fetchOptions, displayFormatter]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleSelect = (val: string) => {
    const selected = options?.find((opt) => opt.value === val);
    if (selected) {
      const result: SearchResult = {
        value: String(selected.value),
        label: selected.label!,
        id: (selected as { id: number }).id,
        data: (selected as { data?: Record<string, unknown> }).data,
      };
      onChange?.(result.id, result);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onChange?.(null);
  };

  return (
    <AutoComplete
      className={styles.autocomplete}
      value={value ? String(value) : searchValue}
      options={options}
      onSelect={handleSelect}
      onSearch={setSearchValue}
      onChange={setSearchValue}
      onClear={handleClear}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      filterOption={false}
    />
  );
};

export default Autocomplete;
