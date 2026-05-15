import { useState, useRef } from "react";
import { Modal, Button, Upload, Table, Select, Steps, message, Alert, Space, Typography } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { parseCSV, type ImportFieldMapping } from "../../../utils/csv";

const { Dragger } = Upload;
const { Text } = Typography;

interface FieldOption {
  label: string;
  value: string;
  required?: boolean;
}

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  entityType: string;
  fields: FieldOption[];
  onImport: (data: Record<string, string>[], mappings: ImportFieldMapping[]) => Promise<{ successCount: number; errorCount: number; errors?: string[] }>;
}

export const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, title, entityType, fields, onImport }) => {
  const [step, setStep] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<ImportFieldMapping[]>([]);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(0);
    setHeaders([]);
    setPreviewRows([]);
    setAllRows([]);
    setMappings([]);
    setFile(null);
    setImporting(false);
  };

  const handleFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows } = parseCSV(text);
      setHeaders(h);
      setPreviewRows(rows.slice(0, 5));
      setAllRows(rows);
      setMappings(h.map((col) => ({ csvColumn: col, entityField: "" })));
      setStep(1);
    };
    reader.readAsText(uploadedFile);
    return false;
  };

  const updateMapping = (csvColumn: string, entityField: string) => {
    setMappings(mappings.map((m) => m.csvColumn === csvColumn ? { ...m, entityField } : m));
  };

  const handleImport = async () => {
    const mapped = mappings.filter((m) => m.entityField);
    if (mapped.length === 0) {
      message.warning("Map at least one column");
      return;
    }
    setImporting(true);
    try {
      const data = allRows.map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => obj[h] = row[i] ?? "");
        return obj;
      });
      const result = await onImport(data, mapped);
      message.success(`Imported ${result.successCount} records${result.errorCount > 0 ? `, ${result.errorCount} errors` : ""}`);
      reset();
      onClose();
    } catch {
      message.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const previewColumns = headers.map((h) => ({ title: h, dataIndex: h, key: h, ellipsis: true }));

  return (
    <Modal title={`Import ${title}`} open={open} onCancel={() => { reset(); onClose(); }} footer={null} width={700} destroyOnClose>
      <Steps current={step} size="small" style={{ marginBottom: 24 }} items={[
        { title: "Upload CSV" },
        { title: "Map Fields" },
        { title: "Import" },
      ]} />

      {step === 0 && (
        <Dragger
          accept=".csv"
          beforeUpload={(f) => { handleFile(f); return false; }}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Click or drag a CSV file here</p>
          <p className="ant-upload-hint">First row should contain column headers</p>
        </Dragger>
      )}

      {step === 1 && headers.length > 0 && (
        <>
          <Text strong style={{ marginBottom: 12, display: "block" }}>Map CSV columns to {title} fields</Text>
          <Table
            dataSource={headers.map((h, i) => ({ csvColumn: h, sample: previewRows[0]?.[i] ?? "" }))}
            columns={[
              { title: "CSV Column", dataIndex: "csvColumn", key: "csvColumn" },
              { title: "Sample", dataIndex: "sample", key: "sample", ellipsis: true },
              {
                title: "Map to Field", key: "map", width: 250,
                render: (_: unknown, record: { csvColumn: string }) => (
                  <Select
                    allowClear
                    placeholder="Select field"
                    style={{ width: "100%" }}
                    value={mappings.find((m) => m.csvColumn === record.csvColumn)?.entityField}
                    onChange={(v) => updateMapping(record.csvColumn, v ?? "")}
                    options={fields}
                  />
                ),
              },
            ]}
            rowKey="csvColumn"
            pagination={false}
            size="small"
          />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Preview: {allRows.length} rows detected</Text>
          </div>
          <Space style={{ marginTop: 16, float: "right" }}>
            <Button onClick={() => setStep(0)}>Back</Button>
            <Button type="primary" onClick={() => setStep(2)}>Next</Button>
          </Space>
        </>
      )}

      {step === 2 && (
        <>
          <Alert
            type="info"
            showIcon
            message="Ready to import"
            description={`${allRows.length} rows will be imported with ${mappings.filter((m) => m.entityField).length} mapped fields.`}
            style={{ marginBottom: 16 }}
          />
          <Space style={{ float: "right" }}>
            <Button onClick={() => setStep(1)}>Back</Button>
            <Button type="primary" loading={importing} onClick={handleImport}>Import</Button>
          </Space>
        </>
      )}
    </Modal>
  );
};

export default ImportModal;
