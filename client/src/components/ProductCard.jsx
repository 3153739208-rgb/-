import { useNavigate } from 'react-router-dom';
import { Card, Tag, Image, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      cover={
        product.images?.length > 0 ? (
          <Image src={product.images[0]} alt={product.title} style={{ height: 200, objectFit: 'cover' }} preview={false} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" />
        ) : (
          <div style={{ height: 200, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 48 }}>📦</div>
        )
      }
      onClick={() => navigate(`/product/${product.id}`)}
      bodyStyle={{ padding: 12 }}
    >
      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8, fontWeight: 500, minHeight: 44 }}>
        {product.title}
      </Paragraph>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>¥{product.price}</Text>
        {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
          <Text delete type="secondary">¥{product.original_price}</Text>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        <Tag color="blue">{product.category}</Tag>
        <Tag>{product.condition}</Tag>
        {product.seller?.is_verified && <Tag color="green">已认证</Tag>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <EnvironmentOutlined /> {product.campus}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(product.created_at).format('MM-DD')}
        </Text>
      </div>
    </Card>
  );
}
