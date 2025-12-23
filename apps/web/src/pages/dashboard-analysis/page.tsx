import { Card, Col, Empty, Progress, Row, Space, Statistic, Typography } from 'antd';

export function DashboardAnalysisPage() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        分析页
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="总销售额" value={126560} prefix="¥" />
            <div style={{ marginTop: 12 }}>
              <Progress percent={78} size="small" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="访问量" value={8846} />
            <div style={{ marginTop: 12 }}>
              <Progress percent={62} size="small" status="active" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="支付笔数" value={6560} />
            <div style={{ marginTop: 12 }}>
              <Progress percent={54} size="small" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="运营活动效果" value={78} suffix="%" />
            <div style={{ marginTop: 12 }}>
              <Progress percent={78} size="small" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="趋势" bodyStyle={{ height: 340 }}>
            <Empty description="中间内容暂不实现（占位）" />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="排名" bodyStyle={{ height: 340 }}>
            <Empty description="中间内容暂不实现（占位）" />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

