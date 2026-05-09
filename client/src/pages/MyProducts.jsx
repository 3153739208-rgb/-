import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, Button, Space, Popconfirm, message, Segmented } from 'antd';
import { EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { productsAPI } from '../utils/api';
import dayjs from 'dayjs';

const STATUS_TABS = [
  { label: '上架中', value: 'active' },
  { label: '已售出', value: 'sold' },
  { label: '已下架', value: 'offline' },
];

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('active');
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getMine({ status }).then((res) => setProducts(res.data));
  }, [status]);

  const handleMarkSold = async (id) => {
    await productsAPI.markSold(id);
    message.success('已标记为售出');
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'sold' } : p)));
  };

  const handleOffline = async (id) => {
    await productsAPI.markOffline(id);
    message.success('已下架');
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'offline' } : p)));
  };

  const handleDelete = async (id) => {
    await productsAPI.delete(id);
    message.success('已删除');
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Card title="我的发布" extra={<Button type="primary" onClick={() => navigate('/publish')}>发布商品</Button>}>
      <Segmented value={status} onChange={setStatus} options={STATUS_TABS} style={{ marginBottom: 16 }} />
      <List
        dataSource={products}
        renderItem={(p) => (
          <List.Item
            actions={[
              status === 'active' && <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/publish?edit=${p.id}`)}>编辑</Button>,
              status === 'active' && <Button size="small" icon={<CheckCircleOutlined />} onClick={() => handleMarkSold(p.id)}>标记售出</Button>,
              status === 'active' && <Button size="small" icon={<StopOutlined />} onClick={() => handleOffline(p.id)}>下架</Button>,
              <Popconfirm title="确定删除？" onConfirm={() => handleDelete(p.id)}>
                <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>,
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} /> : <div style={{ width: 64, height: 64, background: '#f5f5f5', borderRadius: 4 }} />}
              title={<span style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id}`)}>{p.title}</span>}
              description={
                <Space>
                  <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{p.price}</span>
                  <Tag>{p.category}</Tag>
                  <span>{dayjs(p.created_at).format('YYYY-MM-DD')}</span>
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: '暂无商品' }}
      />
    </Card>
  );
}
