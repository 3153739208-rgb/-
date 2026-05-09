import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Upload, message, Tag, Divider, Modal, Form, Input } from 'antd';
import { EditOutlined, SafetyCertificateOutlined, StarOutlined } from '@ant-design/icons';
import useAuthStore from '../store/authStore';
import { usersAPI } from '../utils/api';
import VerifyBadge from '../components/VerifyBadge';
import dayjs from 'dayjs';

export default function Profile() {
  const { user, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [form] = Form.useForm();

  const handleVerify = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('real_name', values.real_name);
      formData.append('student_id', values.student_id);
      if (values.student_card?.[0]?.originFileObj) {
        formData.append('student_card', values.student_card[0].originFileObj);
      }
      setVerifyLoading(true);
      await usersAPI.submitVerification(formData);
      message.success('认证申请已提交');
      setVerifyOpen(false);
      fetchUser();
    } catch (err) {
      message.error(err.response?.data?.message || '提交失败');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card title="个人中心">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="昵称">{user?.nickname}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="校区">{user?.campus}</Descriptions.Item>
          <Descriptions.Item label="实名认证">
            <Space>
              <VerifyBadge isVerified={user?.is_verified} />
              {!user?.is_verified && (
                <Button size="small" icon={<SafetyCertificateOutlined />} onClick={() => setVerifyOpen(true)}>
                  申请认证
                </Button>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="信用分">
            <span style={{ color: '#faad14', fontSize: 18 }}>
              <StarOutlined /> {parseFloat(user?.credit_score || 5).toFixed(1)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={user?.role === 'admin' ? 'red' : 'blue'}>{user?.role === 'admin' ? '管理员' : '普通用户'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">{dayjs(user?.created_at).format('YYYY-MM-DD')}</Descriptions.Item>
        </Descriptions>

        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block onClick={() => navigate('/profile/products')}>我的发布</Button>
          <Button block onClick={() => navigate('/profile/favorites')}>我的收藏</Button>
          <Button block onClick={() => navigate('/profile/wants')}>我的求购</Button>
          <Button block onClick={() => navigate('/messages')}>我的消息</Button>
          {user?.role === 'admin' && (
            <Button block type="primary" onClick={() => navigate('/admin')}>管理后台</Button>
          )}
        </Space>
      </Card>

      <Modal title="实名认证" open={verifyOpen} onCancel={() => setVerifyOpen(false)} onOk={handleVerify} confirmLoading={verifyLoading} okText="提交申请">
        <Form form={form} layout="vertical">
          <Form.Item name="real_name" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="student_id" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="student_card" label="学生证照片" valuePropName="fileList" getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)} rules={[{ required: true, message: '请上传学生证' }]}>
            <Upload maxCount={1} beforeUpload={() => false} listType="picture-card" accept="image/*">
              上传学生证
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
