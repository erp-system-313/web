import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Navigation from './Navigation';

const { Content } = AntLayout;

export const MainLayout: React.FC = () => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Navigation />
      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default MainLayout;
