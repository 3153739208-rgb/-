import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Image, Tag, message, Segmented } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { adminAPI } from '../../utils/api';
import dayjs from 'dayjs';

export default function Verifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending');

  useEffect(() => { fetchData(); }, [status]);

  const fetchData = () => {
    setLoading(true);
    adminAPI.getVerifications({ status })
      .then((res) => setData(res.data.requests))
      .finally(() => setLoading(false));
  };

  const handleAction = async (id, action) => {
    try {
      await adminAPI.handleVerification(id, { status: action });
      message.success(action === 'approved' ? '已通过' : '已驳回');
      fetchData();
    } catch {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户', render: (_, r) => r.User?.nickname },
    { title: '真实姓名', dataIndex: 'real_name' },
    { title: '学号', dataIndex: 'student_id' },
    {
      title: '学生证', dataIndex: 'student_card_img', render: (v) =>
        v ? <Image src={v} width={80} /> : '-'
    },
    {
      title: '状态', dataIndex: 'status', render: (v) => (
        <Tag color={v === 'pending' ? 'orange' : v === 'approved' ? 'green' : 'red'}>
          {{ pending: '待审核', approved: '已通过', rejected: '已驳回' }[v]}
        </Tag>
      ),
    },
    { title: '申请时间', dataIndex: 'created_at', render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作', render: (_, r) =>
        r.status === 'pending' ? (
          <Space>
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleAction(r.id, 'approved')}>通过</Button>
            <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleAction(r.id, 'rejected')}>驳回</Button>
          </Space>
        ) : '-'
    },
  ];

  return (
    <Card
      title="认证审核"
      extra={
        <Segmented value={status} onChange={setStatus} options={[
          { label: '待审核', value: 'pending' },
          { label: '已通过', value: 'approved' },
          { label: '已驳回', value: 'rejected' },
        ]} />
      }
    >
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
    </Card>
  );
}
