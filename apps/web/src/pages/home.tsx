import { Card, List, Typography } from 'antd';

export function HomePage() {
  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        工程初始化完成
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        你可以在「配置项」页面测试与服务端（NestJS + Prisma + SQLite）的联通。
      </Typography.Paragraph>

      <List
        size="small"
        dataSource={[
          {
            label: '前端',
            value: (
              <>
                <Typography.Text code>apps/web</Typography.Text>（Vite 开发服务器默认
                5173）
              </>
            ),
          },
          {
            label: '后端',
            value: (
              <>
                <Typography.Text code>apps/server</Typography.Text>（Nest 默认 3000，API
                前缀 <Typography.Text code>/api</Typography.Text>）
              </>
            ),
          },
          {
            label: 'API 示例',
            value: (
              <>
                GET <Typography.Text code>/api/config-items</Typography.Text>
              </>
            ),
          },
        ]}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text strong style={{ marginRight: 8 }}>
              {item.label}：
            </Typography.Text>
            <Typography.Text>{item.value}</Typography.Text>
          </List.Item>
        )}
      />
    </Card>
  );
}
