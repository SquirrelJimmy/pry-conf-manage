import { Alert, Card, Empty, Space, Spin, Typography } from 'antd';
import { useConfigItems } from '../../api/config-items';

export function SystemConfigItemsPage() {
  const { data, error, isLoading } = useConfigItems();

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        配置项
      </Typography.Title>
      <Card>
        {isLoading ? (
          <div style={{ paddingBlock: 24, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : error ? (
          <Alert
            type="error"
            showIcon
            message="加载失败"
            description={error instanceof Error ? error.message : '未知错误'}
          />
        ) : (
          <Empty
            description={
              data
                ? `中间内容暂不实现（已拉取 ${data.length} 个配置项，仅作 SWR 请求示例）`
                : '中间内容暂不实现（占位）'
            }
          />
        )}
      </Card>
    </Space>
  );
}
