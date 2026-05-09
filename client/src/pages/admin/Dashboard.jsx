import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import { SafetyCertificateOutlined, WarningOutlined, UserOutlined } from '@ant-design/icons';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>管理后台</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="待审核认证" value="-" prefix={<SafetyCertificateOutlined />} />
            <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/admin/verifications')}>
              认证审核
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="待处理举报" value="-" prefix={<WarningOutlined />} />
            <Button style={{ marginTop: 16 }} onClick={() => navigate('/admin/reports')}>
              举报处理
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="平台用户" value="-" prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
