import React, { useState, useEffect, useCallback, useRef } from "react";
import { AutoComplete, Spin } from "antd";
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
  const [loading, setLoading] = useState(false);

  const fetchOptionsRef = useRef(fetchOptions);
  fetchOptionsRef.current = fetchOptions;

  const displayFormatterRef = useRef(displayFormatter);
  displayFormatterRef.current = displayFormatter;

  const loadOptions = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await fetchOptionsRef.current(query);
      const mapped: SelectProps["options"] = (
        results as Record<string, unknown>[]
      ).map((item) => ({
        value: String(item.id),
        label: displayFormatterRef.current(item),
        id: item.id as number,
        data: item,
      }));
      setOptions(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions(searchValue);
  }, [loadOptions, searchValue]);

  const handleFocus = () => {
    loadOptions(searchValue);
  };

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
    setOptions([]);
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
      onFocus={handleFocus}
      onClear={handleClear}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      filterOption={false}
      notFoundContent={loading ? <Spin size="small" /> : undefined}
    />
  );
};

export default Autocomplete;
