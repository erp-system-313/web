import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ProductListPage } from './pages/inventory/ProductListPage';
import { CategoryListPage } from './pages/inventory/CategoryListPage';
import { CreateProductPage } from './pages/inventory/CreateProductPage';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav style={{ 
      padding: '16px 24px', 
      borderBottom: '1px solid #f0f0f0',
      marginBottom: 24,
      display: 'flex',
      gap: 24
    }}>
      <Link 
        to="/inventory/products" 
        style={{ 
          color: isActive('/inventory/products') ? '#1677ff' : '#666',
          textDecoration: 'none',
          fontWeight: 500
        }}
      >
        Products
      </Link>
      <Link 
        to="/inventory/categories" 
        style={{ 
          color: isActive('/inventory/categories') ? '#1677ff' : '#666',
          textDecoration: 'none',
          fontWeight: 500
        }}
      >
        Categories
      </Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>Inventory Management</h1>
        <Navigation />
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/inventory/products" element={<ProductListPage />} />
          <Route path="/inventory/products/new" element={<CreateProductPage />} />
          <Route path="/inventory/products/:id" element={<ProductListPage />} />
          <Route path="/inventory/products/:id/edit" element={<ProductListPage />} />
          <Route path="/inventory/categories" element={<CategoryListPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
