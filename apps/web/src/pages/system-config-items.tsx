import { Card, Empty, Space, Typography } from 'antd';

export function SystemConfigItemsPage() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        配置项
      </Typography.Title>
      <Card>
        <Empty description="中间内容暂不实现（占位）" />
      </Card>
    </Space>
  );
}

