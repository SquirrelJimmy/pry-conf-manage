import {
  BulbOutlined,
  DesktopOutlined,
  GlobalOutlined,
  LockOutlined,
  MoonOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Divider,
  Dropdown,
  Form,
  Input,
  Space,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../api/auth';
import { useAppPreferencesStore } from '../../stores/use-app-preferences-store';
import { useAuthStore } from '../../stores/use-auth-store';

type LoginForm = {
  username: string;
  password: string;
};

export function LoginPage() {
  const [form] = Form.useForm<LoginForm>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: antdToken } = theme.useToken();

  const locale = useAppPreferencesStore((s) => s.locale);
  const setLocale = useAppPreferencesStore((s) => s.setLocale);
  const themeMode = useAppPreferencesStore((s) => s.themeMode);
  const cycleThemeMode = useAppPreferencesStore((s) => s.cycleThemeMode);

  const setAuth = useAuthStore((s) => s.setAuth);
  const { trigger, isMutating, error } = useLoginMutation();

  const from = (location.state as { from?: string } | null)?.from || '/';

  const languageMenu: MenuProps = useMemo(
    () => ({
      items: [
        { key: 'zh-CN', label: '简体中文' },
        { key: 'en-US', label: 'English' },
      ],
      onClick: ({ key }) => setLocale(key as 'zh-CN' | 'en-US'),
    }),
    [setLocale],
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: `radial-gradient(1200px circle at 20% 0%, ${antdToken.colorPrimaryBg} 0%, transparent 60%),
          radial-gradient(900px circle at 100% 30%, ${antdToken.colorInfoBg} 0%, transparent 55%),
          ${antdToken.colorBgLayout}`,
      }}
    >
      <Card
        style={{ width: 420, maxWidth: '100%' }}
        styles={{ body: { padding: 20 } }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space
            direction="vertical"
            size={4}
            style={{ width: '100%', textAlign: 'center' }}
          >
            <Typography.Title level={3} style={{ margin: 0 }}>
              机场配件管理
            </Typography.Title>
            <Typography.Text type="secondary">
              {locale === 'zh-CN' ? '后台管理登录' : 'Admin Sign In'}
            </Typography.Text>
          </Space>

          <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
            <Tooltip
              title={
                locale === 'zh-CN'
                  ? `主题：${themeMode === 'light' ? '亮' : themeMode === 'dark' ? '暗' : '跟随系统'}（点击切换）`
                  : `Theme: ${themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System'} (click to switch)`
              }
            >
              <Button
                type="text"
                onClick={() => cycleThemeMode()}
                icon={
                  themeMode === 'light' ? (
                    <BulbOutlined />
                  ) : themeMode === 'dark' ? (
                    <MoonOutlined />
                  ) : (
                    <DesktopOutlined />
                  )
                }
              />
            </Tooltip>

            <Dropdown menu={languageMenu} placement="bottomRight" trigger={['click']}>
              <Button type="text" icon={<GlobalOutlined />}>
                {locale === 'zh-CN' ? '中文' : 'EN'}
              </Button>
            </Dropdown>
          </Space>

          <Divider style={{ margin: 0 }} />

          {error ? (
            <Alert
              type="error"
              message={locale === 'zh-CN' ? '登录失败' : 'Sign in failed'}
              description={error instanceof Error ? error.message : '未知错误'}
              showIcon
            />
          ) : null}

          <Form<LoginForm>
            form={form}
            layout="vertical"
            initialValues={{ username: 'admin', password: 'admin123456' }}
            onFinish={async (values) => {
              try {
                const res = await trigger({
                  username: values.username.trim(),
                  password: values.password,
                });
                setAuth(res.accessToken, res.user);
                navigate(from, { replace: true });
              } catch {
                // 交给 SWR mutation 的 error 状态渲染即可
              }
            }}
          >
            <Form.Item
              label={locale === 'zh-CN' ? '用户名' : 'Username'}
              name="username"
              rules={[{ required: true, message: locale === 'zh-CN' ? '请输入用户名' : 'Required' }]}
            >
              <Input prefix={<UserOutlined />} autoComplete="username" />
            </Form.Item>

            <Form.Item
              label={locale === 'zh-CN' ? '密码' : 'Password'}
              name="password"
              rules={[{ required: true, message: locale === 'zh-CN' ? '请输入密码' : 'Required' }]}
            >
              <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isMutating}
            >
              {locale === 'zh-CN' ? '登录' : 'Sign in'}
            </Button>
          </Form>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {locale === 'zh-CN'
              ? '默认账号来自后端 seed；前端仅负责调用 /api/auth/login。'
              : 'Default account is seeded by backend; frontend calls /api/auth/login.'}
          </Typography.Text>
        </Space>
      </Card>
    </div>
  );
}
