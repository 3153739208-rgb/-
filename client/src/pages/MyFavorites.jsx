import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Tag, Space, Popconfirm, message, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { favoritesAPI } from '../utils/api';

export default function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    favoritesAPI.getMine().then((res) => setFavorites(res.data));
  }, []);

  const handleRemove = async (productId) => {
    await favoritesAPI.remove(productId);
    message.success('已取消收藏');
    setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
  };

  return (
    <Card title="我的收藏">
      {favorites.length === 0 ? (
        <Empty description="暂无收藏" />
      ) : (
        <List
          dataSource={favorites}
          renderItem={(fav) => (
            <List.Item
              actions={[
                <Popconfirm title="取消收藏？" onConfirm={() => handleRemove(fav.product_id)}>
                  <Button size="small" danger icon={<DeleteOutlined />}>取消收藏</Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={fav.Product?.images?.[0] ? <img src={fav.Product.images[0]} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} /> : <div style={{ width: 64, height: 64, background: '#f5f5f5', borderRadius: 4 }} />}
                title={<span style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${fav.product_id}`)}>{fav.Product?.title}</span>}
                description={
                  <Space>
                    <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{fav.Product?.price}</span>
                    <Tag>{fav.Product?.category}</Tag>
                    <Tag color={fav.Product?.status === 'active' ? 'green' : fav.Product?.status === 'sold' ? 'red' : 'default'}>
                      {{ active: '上架中', sold: '已售出', offline: '已下架' }[fav.Product?.status]}
                    </Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
