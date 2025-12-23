import {
  DashboardOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Switch,
  Typography,
  theme,
} from 'antd';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppPreferencesStore } from '../stores/use-app-preferences-store';

type AppLocale = 'zh-CN' | 'en-US';

type NavItem = {
  key: string;
  label: Record<AppLocale, string>;
  icon?: React.ReactNode;
  path?: string;
  children?: NavItem[];
};

const NAV: NavItem[] = [
  {
    key: 'dashboard',
    label: { 'zh-CN': 'Dashboard', 'en-US': 'Dashboard' },
    icon: <DashboardOutlined />,
    children: [
      {
        key: 'dashboard-analysis',
        label: { 'zh-CN': '分析页', 'en-US': 'Analysis' },
        path: '/dashboard/analysis',
      },
      {
        key: 'dashboard-workplace',
        label: { 'zh-CN': '工作台', 'en-US': 'Workplace' },
        path: '/dashboard/workplace',
      },
    ],
  },
  {
    key: 'system',
    label: { 'zh-CN': '系统管理', 'en-US': 'System' },
    icon: <SettingOutlined />,
    children: [
      {
        key: 'system-config-items',
        label: { 'zh-CN': '配置项', 'en-US': 'Config Items' },
        path: '/system/config-items',
      },
    ],
  },
];

function toMenuItems(nav: NavItem[], locale: AppLocale): MenuProps['items'] {
  return nav.map((item) => {
    if (item.children?.length) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label[locale],
        children: toMenuItems(item.children, locale),
      };
    }
    return {
      key: item.path ?? item.key,
      icon: item.icon,
      label: item.label[locale],
    };
  });
}

function flattenLeafRoutes(nav: NavItem[], locale: AppLocale) {
  const leaves: Array<{ path: string; label: string; parents: string[] }> = [];

  const walk = (items: NavItem[], parentLabels: string[]) => {
    for (const item of items) {
      const nextParents = [...parentLabels, item.label[locale]];
      if (item.children?.length) {
        walk(item.children, nextParents);
        continue;
      }
      if (item.path) {
        leaves.push({
          path: item.path,
          label: item.label[locale],
          parents: parentLabels,
        });
      }
    }
  };

  walk(nav, []);
  return leaves;
}

function findBestMatchPath(paths: string[], currentPath: string) {
  let best: string | null = null;
  for (const p of paths) {
    if (currentPath === p || currentPath.startsWith(`${p}/`)) {
      if (!best || p.length > best.length) best = p;
    }
  }
  return best;
}

export function AdminLayout() {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();

  const collapsed = useAppPreferencesStore((s) => s.siderCollapsed);
  const setCollapsed = useAppPreferencesStore((s) => s.setSiderCollapsed);
  const themeMode = useAppPreferencesStore((s) => s.themeMode);
  const toggleThemeMode = useAppPreferencesStore((s) => s.toggleThemeMode);
  const locale = useAppPreferencesStore((s) => s.locale);
  const setLocale = useAppPreferencesStore((s) => s.setLocale);

  const menuItems = useMemo(() => toMenuItems(NAV, locale), [locale]);

  const leafRoutes = useMemo(() => flattenLeafRoutes(NAV, locale), [locale]);
  const selectedPath = useMemo(() => {
    const paths = leafRoutes.map((x) => x.path);
    return findBestMatchPath(paths, location.pathname) ?? '/dashboard/analysis';
  }, [leafRoutes, location.pathname]);

  const selectedLeaf = useMemo(() => {
    return leafRoutes.find((x) => x.path === selectedPath) ?? null;
  }, [leafRoutes, selectedPath]);

  const openKeys = useMemo(() => {
    if (!selectedLeaf) return [];
    // 二级菜单：openKeys 只需要打开父级（使用 NAV 的 key）
    for (const group of NAV) {
      for (const child of group.children ?? []) {
        if (child.path === selectedLeaf.path) return [group.key];
      }
    }
    return [];
  }, [selectedLeaf]);

  const breadcrumbItems = useMemo(() => {
    const items: Array<{ title: string }> = [];
    if (!selectedLeaf) return items;
    for (const title of selectedLeaf.parents) items.push({ title });
    items.push({ title: selectedLeaf.label });
    return items;
  }, [selectedLeaf]);

  const userMenu: MenuProps = {
    items: [
      { key: 'profile', label: locale === 'zh-CN' ? '个人信息' : 'Profile' },
      { type: 'divider' },
      { key: 'logout', label: locale === 'zh-CN' ? '退出登录' : 'Logout' },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        // 预留：后续接入真实登录态
        navigate('/dashboard/analysis');
      }
    },
  };

  const languageMenu: MenuProps = {
    items: [
      { key: 'zh-CN', label: '简体中文' },
      { key: 'en-US', label: 'English' },
    ],
    onClick: ({ key }) => setLocale(key as AppLocale),
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        width={240}
        collapsedWidth={56}
        breakpoint="lg"
        collapsed={collapsed}
        onBreakpoint={(broken) => setCollapsed(broken)}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            height: 56,
            paddingInline: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: token.colorPrimary,
            }}
          />
          {!collapsed ? (
            <div style={{ lineHeight: 1.1 }}>
              <Typography.Text style={{ fontWeight: 700 }}>
                pry-conf-manage
              </Typography.Text>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Admin Console
                </Typography.Text>
              </div>
            </div>
          ) : null}
        </div>

        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={[selectedPath]}
          defaultOpenKeys={openKeys}
          style={{ borderInlineEnd: 0 }}
          onClick={({ key }) => {
            if (typeof key === 'string' && key.startsWith('/')) navigate(key);
          }}
        />
      </Layout.Sider>

      <Layout>
        <Layout.Header
          style={{
            height: 56,
            paddingInline: 16,
            display: 'flex',
            alignItems: 'center',
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          <Breadcrumb items={breadcrumbItems} style={{ marginLeft: 8 }} />

          <div style={{ flex: 1 }} />

          <Space size={12} align="center">
            <Space size={6} align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {locale === 'zh-CN' ? '主题' : 'Theme'}
              </Typography.Text>
              <Switch
                checked={themeMode === 'dark'}
                onChange={() => toggleThemeMode()}
                checkedChildren={locale === 'zh-CN' ? '暗' : 'D'}
                unCheckedChildren={locale === 'zh-CN' ? '亮' : 'L'}
              />
            </Space>

            <Dropdown menu={languageMenu} placement="bottomRight" trigger={['click']}>
              <Button type="text" icon={<GlobalOutlined />}>
                {locale === 'zh-CN' ? '中文' : 'EN'}
              </Button>
            </Dropdown>

            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Typography.Text>{locale === 'zh-CN' ? '管理员' : 'Admin'}</Typography.Text>
              </Space>
            </Dropdown>
          </Space>
        </Layout.Header>

        <Layout.Content style={{ padding: 16 }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

