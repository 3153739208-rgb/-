import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Tag, Space, Popconfirm, message, Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { wantsAPI } from '../utils/api';
import { CATEGORIES } from '../utils/constants';

export default function MyWants() {
  const [wants, setWants] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => { fetchWants(); }, []);

  const fetchWants = () => wantsAPI.getMine().then((res) => setWants(res.data));

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing?.id) {
        await wantsAPI.update(editing.id, values);
      } else {
        await wantsAPI.create(values);
      }
      message.success(editing?.id ? '已更新' : '已发布');
      setEditOpen(false);
      setEditing(null);
      form.resetFields();
      fetchWants();
    } catch (err) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    await wantsAPI.delete(id);
    message.success('已删除');
    fetchWants();
  };

  const openEdit = (want) => {
    setEditing(want);
    form.setFieldsValue(want);
    setEditOpen(true);
  };

  return (
    <Card
      title="我的求购"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setEditOpen(true); }}>发布求购</Button>}
    >
      <List
        dataSource={wants}
        locale={{ emptyText: '暂无求购信息' }}
        renderItem={(w) => (
          <List.Item
            actions={[
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(w)}>编辑</Button>,
              <Popconfirm title="确定删除？" onConfirm={() => handleDelete(w.id)}>
                <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={w.title}
              description={
                <Space>
                  <Tag>{w.category}</Tag>
                  {w.budget_min && w.budget_max && <span>预算: ¥{w.budget_min} - ¥{w.budget_max}</span>}
                  {w.is_negotiable && <Tag color="green">可议价</Tag>}
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <Modal title={editing?.id ? '编辑求购' : '发布求购'} open={editOpen} onCancel={() => setEditOpen(false)} onOk={handleSave} okText="保存">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={CATEGORIES.map((c) => ({ label: c, value: c }))} />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="budget_min" label="最低预算">
              <InputNumber min={0} prefix="¥" />
            </Form.Item>
            <Form.Item name="budget_max" label="最高预算">
              <InputNumber min={0} prefix="¥" />
            </Form.Item>
          </Space>
          <Form.Item name="is_negotiable" label="可议价" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
