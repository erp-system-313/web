import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  SalesOrdersList,
  SalesOrderForm,
  SalesOrderDetails,
  CustomersList,
  CustomerDetails,
} from "./pages/sales";
import { theme } from "./styles/theme";

function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <div>
          <Routes>
            <Route path="/" element={<SalesOrdersList />} />
            <Route path="/sales/orders" element={<SalesOrdersList />} />
            <Route path="/sales/orders/new" element={<SalesOrderForm />} />
            <Route path="/sales/orders/:id" element={<SalesOrderDetails />} />
            <Route path="/sales/orders/:id/edit" element={<SalesOrderForm />} />
            <Route path="/sales/customers" element={<CustomersList />} />
            <Route path="/sales/customers/:id" element={<CustomerDetails />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
