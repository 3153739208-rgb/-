import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, message, Segmented, Modal } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { adminAPI } from '../../utils/api';
import dayjs from 'dayjs';

export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => { fetchData(); }, [status]);

  const fetchData = () => {
    setLoading(true);
    adminAPI.getReports({ status })
      .then((res) => setData(res.data.reports))
      .finally(() => setLoading(false));
  };

  const handleAction = async (id, action) => {
    try {
      await adminAPI.handleReport(id, { status: action });
      message.success(action === 'resolved' ? '已处理（商品已下架）' : '已驳回');
      fetchData();
    } catch {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '举报人', render: (_, r) => r.reporter?.nickname },
    { title: '类型', dataIndex: 'target_type', render: (v) => v === 'product' ? '商品' : '用户' },
    { title: '目标ID', dataIndex: 'target_id' },
    { title: '原因', dataIndex: 'reason', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', render: (v) => (
        <Tag color={v === 'pending' ? 'orange' : v === 'resolved' ? 'green' : 'default'}>
          {{ pending: '待处理', resolved: '已处理', dismissed: '已驳回' }[v]}
        </Tag>
      ),
    },
    { title: '时间', dataIndex: 'created_at', render: (v) => dayjs(v).format('MM-DD HH:mm') },
    {
      title: '操作', render: (_, r) =>
        r.status === 'pending' ? (
          <Space>
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleAction(r.id, 'resolved')}>处理</Button>
            <Button size="small" icon={<CloseOutlined />} onClick={() => handleAction(r.id, 'dismissed')}>驳回</Button>
          </Space>
        ) : '-'
    },
  ];

  return (
    <Card
      title="举报处理"
      extra={
        <Segmented value={status} onChange={setStatus} options={[
          { label: '待处理', value: 'pending' },
          { label: '已处理', value: 'resolved' },
          { label: '已驳回', value: 'dismissed' },
        ]} />
      }
    >
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
    </Card>
  );
}
