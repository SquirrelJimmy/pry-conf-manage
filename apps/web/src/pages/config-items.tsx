import { useEffect, useMemo, useState } from 'react';
import { App as AntdApp, Alert, Button, Card, Input, Space, Table, Typography } from 'antd';
import { useConfigItemsStore } from '../stores/use-config-items-store';

export function ConfigItemsPage() {
  const { items, loading, error, refresh, upsert } = useConfigItemsStore();
  const { message } = AntdApp.useApp();

  const [keyInput, setKeyInput] = useState('site.title');
  const [valueInput, setValueInput] = useState('pry-conf-manage');

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => a.key.localeCompare(b.key));
  }, [items]);

  return (
    <Card>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Space
          direction="vertical"
          size={0}
          style={{ width: '100%' }}
        >
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
            配置项
          </Typography.Title>
          <Typography.Text type="secondary">
            数据来自后端 Prisma（SQLite）。如果你还没迁移数据库，先执行{' '}
            <Typography.Text code>pnpm prisma:migrate</Typography.Text>。
          </Typography.Text>
        </Space>

        <Space wrap>
          <Input
            style={{ width: 240 }}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="key"
            allowClear
          />
          <Input
            style={{ width: 360 }}
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            placeholder="value"
            allowClear
          />
          <Button
            type="primary"
            onClick={async () => {
              await upsert(keyInput.trim(), valueInput);
              message.success('已保存');
            }}
            disabled={!keyInput.trim()}
            loading={loading}
          >
            保存
          </Button>
          <Button onClick={() => void refresh()} loading={loading}>
            刷新
          </Button>
        </Space>

        {error ? <Alert type="error" message={error} showIcon /> : null}

        <Table
          size="middle"
          rowKey="id"
          loading={loading}
          dataSource={sorted}
          pagination={false}
          columns={[
            {
              title: 'Key',
              dataIndex: 'key',
              key: 'key',
              width: 260,
              render: (v: string) => <Typography.Text code>{v}</Typography.Text>,
            },
            {
              title: 'Value',
              dataIndex: 'value',
              key: 'value',
              render: (v: string) => <Typography.Text>{v}</Typography.Text>,
            },
            {
              title: '操作',
              key: 'actions',
              width: 120,
              render: (_: unknown, record: { key: string; value: string }) => (
                <Button
                  onClick={() => {
                    setKeyInput(record.key);
                    setValueInput(record.value);
                  }}
                >
                  编辑
                </Button>
              ),
            },
          ]}
          locale={{
            emptyText: loading ? '加载中…' : '暂无数据，先保存一条试试。',
          }}
        />
      </Space>
    </Card>
  );
}
