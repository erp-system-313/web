import { Controller } from "react-hook-form";
import { Form, Input, InputNumber, Select } from "antd";
import type {
  FormItemProps,
  InputProps,
  InputNumberProps,
  SelectProps,
} from "antd";
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";

type BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  control: UseControllerProps<TFieldValues, TName>["control"];
  label?: string;
  rules?: UseControllerProps<TFieldValues, TName>["rules"];
  defaultValue?: UseControllerProps<TFieldValues, TName>["defaultValue"];
};

type InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldProps<TFieldValues, TName> &
  Omit<FormItemProps, "name" | "rules" | "children"> &
  Pick<InputProps, "placeholder" | "disabled" | "prefix" | "type" | "size">;

export const InputField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  rules,
  defaultValue,
  placeholder,
  disabled,
  prefix,
  type,
  size,
  ...formItemProps
}: InputFieldProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({
        field,
        fieldState,
      }: {
        field: ControllerRenderProps<TFieldValues, TName>;
        fieldState: { error?: { message?: string } };
      }) => (
        <Form.Item
          label={label}
          help={fieldState.error?.message}
          validateStatus={fieldState.error ? "error" : ""}
          {...formItemProps}
        >
          <Input
            {...field}
            value={field.value ?? ""}
            placeholder={placeholder}
            disabled={disabled}
            prefix={prefix}
            type={type}
            size={size}
          />
        </Form.Item>
      )}
    />
  );
};

type InputNumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldProps<TFieldValues, TName> &
  Omit<FormItemProps, "name" | "rules" | "children"> &
  Pick<
    InputNumberProps,
    | "placeholder"
    | "disabled"
    | "prefix"
    | "min"
    | "max"
    | "precision"
    | "style"
  >;

export const InputNumberField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  rules,
  defaultValue,
  placeholder,
  disabled,
  prefix,
  min,
  max,
  precision,
  style,
  ...formItemProps
}: InputNumberFieldProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({
        field,
        fieldState,
      }: {
        field: ControllerRenderProps<TFieldValues, TName>;
        fieldState: { error?: { message?: string } };
      }) => (
        <Form.Item
          label={label}
          help={fieldState.error?.message}
          validateStatus={fieldState.error ? "error" : ""}
          {...formItemProps}
        >
          <InputNumber
            {...field}
            value={field.value}
            placeholder={placeholder}
            disabled={disabled}
            prefix={prefix}
            min={min}
            max={max}
            precision={precision}
            style={{ width: "100%", ...style }}
          />
        </Form.Item>
      )}
    />
  );
};

type SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption = { value: string | number; label: string },
> = BaseFieldProps<TFieldValues, TName> &
  Omit<FormItemProps, "name" | "rules" | "children"> &
  Pick<
    SelectProps<TOption>,
    | "placeholder"
    | "disabled"
    | "options"
    | "showSearch"
    | "filterOption"
    | "allowClear"
  >;

export const SelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption = { value: string | number; label: string },
>({
  name,
  control,
  label,
  rules,
  defaultValue,
  placeholder,
  disabled,
  options,
  showSearch,
  filterOption,
  allowClear,
  ...formItemProps
}: SelectFieldProps<TFieldValues, TName, TOption>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({
        field,
        fieldState,
      }: {
        field: ControllerRenderProps<TFieldValues, TName>;
        fieldState: { error?: { message?: string } };
      }) => (
        <Form.Item
          label={label}
          help={fieldState.error?.message}
          validateStatus={fieldState.error ? "error" : ""}
          {...formItemProps}
        >
          <Select
            {...field}
            value={field.value}
            placeholder={placeholder}
            disabled={disabled}
            options={options}
            showSearch={showSearch}
            filterOption={filterOption}
            allowClear={allowClear}
          />
        </Form.Item>
      )}
    />
  );
};

export default { InputField, InputNumberField, SelectField };
