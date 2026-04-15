import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts";
import {
  SalesOrdersList,
  SalesOrderForm,
  CustomersList,
  CustomerDetails,
} from "./pages/sales";
import { theme } from "./styles/theme";

function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/sales/orders" element={<SalesOrdersList />} />
            <Route path="/sales/orders/new" element={<SalesOrderForm />} />
            <Route path="/sales/orders/:id/edit" element={<SalesOrderForm />} />
            <Route path="/sales/customers" element={<CustomersList />} />
            <Route path="/sales/customers/:id" element={<CustomerDetails />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
