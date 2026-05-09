import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Image, Tag, Button, Space, Descriptions, Divider, message, Modal, Rate } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined, WarningOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { productsAPI, favoritesAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import ReportModal from '../components/ReportModal';
import VerifyBadge from '../components/VerifyBadge';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    productsAPI.getDetail(id).then((res) => {
      setProduct(res.data.product);
      setIsFavorited(res.data.is_favorited);
    });
  }, [id]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) return message.warning('请先登录');
    setFavLoading(true);
    try {
      const res = await favoritesAPI.toggle(id);
      setIsFavorited(res.data.favorited);
      message.success(res.data.favorited ? '已收藏' : '已取消收藏');
    } catch {
      message.error('操作失败');
    } finally {
      setFavLoading(false);
    }
  };

  const contactSeller = () => {
    if (!isAuthenticated) return message.warning('请先登录');
    if (!user?.is_verified) return message.warning('请先完成实名认证');
    navigate(`/messages/${product.seller_id}`, { state: { productId: product.id } });
  };

  if (!product) return null;

  const isOwner = user?.id === product.seller_id;

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* 图片 */}
          <div style={{ flex: '0 0 400px', maxWidth: '100%' }}>
            {product.images?.length > 0 ? (
              <>
                <Image src={product.images[0]} alt={product.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8 }} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" preview={false} onClick={() => { setPreviewIndex(0); setPreviewOpen(true); }} />
                <Space style={{ marginTop: 12 }}>
                  {product.images.map((img, i) => (
                    <img key={i} src={img} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: i === 0 ? '2px solid #1677ff' : 'none' }} onClick={() => setPreviewIndex(i)} />
                  ))}
                </Space>
                <Image.PreviewGroup preview={{ visible: previewOpen, current: previewIndex, onVisibleChange: (v) => setPreviewOpen(v) }}>
                  {product.images.map((img, i) => (<Image key={i} src={img} style={{ display: 'none' }} />))}
                </Image.PreviewGroup>
              </>
            ) : (
              <div style={{ width: '100%', height: 400, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, borderRadius: 8 }}>📦</div>
            )}
          </div>

          {/* 信息 */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{ marginBottom: 16 }}>{product.title}</h1>

            <div style={{ background: '#fff7e6', padding: '16px 20px', borderRadius: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 32, color: '#ff4d4f', fontWeight: 'bold' }}>¥{product.price}</span>
              {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: 12, fontSize: 16 }}>
                  ¥{product.original_price}
                </span>
              )}
            </div>

            <Space wrap style={{ marginBottom: 16 }}>
              <Tag color="blue">{product.category}</Tag>
              <Tag>{product.condition}</Tag>
              {product.delivery_method?.map((m) => (
                <Tag key={m} color={m === '微信支付' ? 'green' : 'orange'}>{m}</Tag>
              ))}
            </Space>

            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="卖家">
                <Space>
                  {product.seller?.nickname}
                  <VerifyBadge isVerified={product.seller?.is_verified} />
                  <span style={{ color: '#faad14' }}>★ {parseFloat(product.seller?.credit_score || 5).toFixed(1)}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="校区">{product.campus}</Descriptions.Item>
              <Descriptions.Item label="发布时间">{dayjs(product.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={product.status === 'active' ? 'green' : product.status === 'sold' ? 'red' : 'default'}>
                  {{ active: '上架中', sold: '已售出', offline: '已下架' }[product.status]}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {product.status === 'active' && (
              <Space style={{ marginBottom: 16 }}>
                {!isOwner && (
                  <>
                    <Button type="primary" icon={<MessageOutlined />} size="large" onClick={contactSeller}>
                      联系卖家
                    </Button>
                    {product.delivery_method?.includes('微信支付') && (
                      <Button icon={<ShoppingCartOutlined />} size="large" disabled>
                        微信支付（暂未开通）
                      </Button>
                    )}
                  </>
                )}
                <Button
                  icon={isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  size="large"
                  loading={favLoading}
                  onClick={toggleFavorite}
                >
                  {isFavorited ? '已收藏' : '收藏'}
                </Button>
                {!isOwner && (
                  <Button icon={<WarningOutlined />} size="large" onClick={() => setReportOpen(true)}>
                    举报
                  </Button>
                )}
              </Space>
            )}
          </div>
        </div>

        <Divider />
        <h3>商品描述</h3>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#555' }}>
          {product.description || '暂无描述'}
        </div>
      </Card>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="product"
        targetId={product.id}
      />
    </div>
  );
}
