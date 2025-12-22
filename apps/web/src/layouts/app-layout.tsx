import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    location.pathname === '/' ? '/' : location.pathname.startsWith('/config-items') ? '/config-items' : '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingInline: 16,
        }}
      >
        <Typography.Text style={{ color: 'white', fontWeight: 700 }}>
          pry-conf-manage
        </Typography.Text>
        <div style={{ flex: 1 }} />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={[
            { key: '/', label: '首页', icon: <HomeOutlined /> },
            { key: '/config-items', label: '配置项', icon: <SettingOutlined /> },
          ]}
          onClick={({ key }) => navigate(key)}
          style={{ minWidth: 240 }}
        />
      </Layout.Header>

      <Layout.Content style={{ padding: 16 }}>
        <div className="container">
          <Outlet />
        </div>
      </Layout.Content>
    </Layout>
  );
}
