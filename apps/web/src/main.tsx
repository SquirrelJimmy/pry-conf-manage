import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { App, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import { router } from './router';
import 'antd/dist/reset.css';
import './styles.css';
import { useAppPreferencesStore } from './stores/use-app-preferences-store';

function Root() {
  const locale = useAppPreferencesStore((s) => s.locale);
  const themeMode = useAppPreferencesStore((s) => s.themeMode);

  return (
    <ConfigProvider
      locale={locale === 'en-US' ? enUS : zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 10,
        },
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <App>
        <RouterProvider router={router} />
      </App>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
