import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { usersAPI } from '../utils/api';
import ChatWindow from '../components/ChatWindow';
import useAuthStore from '../store/authStore';

const { Text } = Typography;

export default function Chat() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [partner, setPartner] = useState(null);

  const productId = location.state?.productId;

  useEffect(() => {
    if (parseInt(id) === user?.id) return;
    usersAPI.getCredit(id).then((res) => setPartner(res.data.user)).catch(() => {});
  }, [id, user?.id]);

  if (!user?.is_verified) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>请先完成实名认证才能使用私信功能</p>
          <Button type="primary" onClick={() => navigate('/profile')}>前往认证</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/messages')} />
          <span>{partner?.nickname || '聊天'}</span>
          {partner && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {partner.is_verified ? '已认证' : ''} ★ {parseFloat(partner.credit_score || 5).toFixed(1)}
            </Text>
          )}
        </div>
      }
    >
      <ChatWindow userId={parseInt(id)} productId={productId} />
    </Card>
  );
}
