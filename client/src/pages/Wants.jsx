import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, Space, Pagination, Empty, Spin, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { wantsAPI } from '../utils/api';
import CategoryFilter from '../components/CategoryFilter';
import VerifyBadge from '../components/VerifyBadge';
import useAuthStore from '../store/authStore';
import dayjs from 'dayjs';

const { Paragraph } = Typography;

export default function Wants() {
  const [wants, setWants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    wantsAPI.getList({ category, page, limit: 12 })
      .then((res) => { setWants(res.data.wants); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }, [category, page]);

  const contactWanter = (wanterId) => {
    if (!isAuthenticated) return navigate('/login');
    navigate(`/messages/${wanterId}`);
  };

  return (
    <div>
      <h2>求购广场</h2>
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <CategoryFilter value={category} onChange={(v) => { setCategory(v); setPage(1); }} />
      </div>
      <Spin spinning={loading}>
        {wants.length === 0 ? (
          <Empty description="暂无求购信息" />
        ) : (
          <List
            dataSource={wants}
            renderItem={(w) => (
              <Card style={{ marginBottom: 12 }} bodyStyle={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <Space style={{ marginBottom: 8 }}>
                      <strong style={{ fontSize: 16 }}>{w.title}</strong>
                      <Tag color="blue">{w.category}</Tag>
                      {w.is_negotiable && <Tag color="green">可议价</Tag>}
                    </Space>
                    {w.description && (
                      <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: 8 }}>
                        {w.description}
                      </Paragraph>
                    )}
                    <Space>
                      {w.budget_min && w.budget_max && (
                        <Tag color="orange">预算: ¥{w.budget_min} - ¥{w.budget_max}</Tag>
                      )}
                      <span style={{ color: '#999', fontSize: 12 }}>
                        {w.user?.nickname}
                        <VerifyBadge isVerified={w.user?.is_verified} />
                        {' '}{dayjs(w.created_at).format('MM-DD HH:mm')}
                      </span>
                    </Space>
                  </div>
                  {user?.id !== w.user_id && (
                    <Tag
                      icon={<MessageOutlined />}
                      color="blue"
                      style={{ cursor: 'pointer' }}
                      onClick={() => contactWanter(w.user_id)}
                    >
                      联系TA
                    </Tag>
                  )}
                </div>
              </Card>
            )}
          />
        )}
      </Spin>
      {total > 12 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination current={page} total={total} pageSize={12} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
