import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Checkbox, message } from 'antd';
import { productsAPI } from '../utils/api';
import { CATEGORIES, CONDITIONS, AUTO_OFFLINE_OPTIONS } from '../utils/constants';
import ImageUploader from '../components/ImageUploader';
import useAuthStore from '../store/authStore';

export default function Publish() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState(['线下交付']);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user?.is_verified) {
    return (
      <Card title="发布商品">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>发布商品前需要完成实名认证</p>
          <Button type="primary" onClick={() => navigate('/profile')}>前往认证</Button>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await productsAPI.create({ ...values, images, delivery_method: deliveryMethod });
      message.success('发布成功');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card title="发布商品">
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入商品标题' }]}>
            <Input placeholder="请输入商品标题" maxLength={200} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} placeholder="描述商品的使用情况、成色等" maxLength={2000} />
          </Form.Item>

          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={CATEGORIES.map((c) => ({ label: c, value: c }))} placeholder="选择分类" />
          </Form.Item>

          <Form.Item name="condition" label="新旧程度" initialValue="有使用痕迹">
            <Select options={CONDITIONS.map((c) => ({ label: c, value: c }))} />
          </Form.Item>

          <Form.Item name="price" label="售价" rules={[{ required: true, message: '请输入售价' }]}>
            <InputNumber min={0} max={999999} precision={2} prefix="¥" style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>

          <Form.Item name="original_price" label="原价">
            <InputNumber min={0} max={999999} precision={2} prefix="¥" style={{ width: '100%' }} placeholder="选填" />
          </Form.Item>

          <Form.Item label="商品图片">
            <ImageUploader value={images} onChange={setImages} max={9} />
          </Form.Item>

          <Form.Item label="交付方式">
            <Checkbox.Group
              value={deliveryMethod}
              onChange={(v) => { if (v.length > 0) setDeliveryMethod(v); }}
              options={['线下交付', '微信支付']}
            />
          </Form.Item>

          <Form.Item name="auto_offline_days" label="自动下架" initialValue={0}>
            <Select options={AUTO_OFFLINE_OPTIONS} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">发布</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
