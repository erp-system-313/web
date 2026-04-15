import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  InvoicesList,
  InvoiceForm,
  InvoiceDetails,
  JournalEntries,
  JournalEntryForm,
  ChartOfAccounts,
} from "./pages/finance";
import { theme } from "./styles/theme";

function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <div>
          <Routes>
            <Route path="/" element={<InvoicesList />} />
            <Route path="/finance/invoices" element={<InvoicesList />} />
            <Route path="/finance/invoices/new" element={<InvoiceForm />} />
            <Route path="/finance/invoices/:id" element={<InvoiceDetails />} />
            <Route
              path="/finance/invoices/:id/edit"
              element={<InvoiceForm />}
            />
            <Route path="/finance/journal" element={<JournalEntries />} />
            <Route path="/finance/journal/new" element={<JournalEntryForm />} />
            <Route path="/finance/accounts" element={<ChartOfAccounts />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
