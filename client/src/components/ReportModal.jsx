import { Modal, Form, Select, Button, message } from 'antd';
import { REPORT_REASONS } from '../utils/constants';
import { reportsAPI } from '../utils/api';

export default function ReportModal({ open, onClose, targetType, targetId }) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await reportsAPI.create({ target_type: targetType, target_id: targetId, reason: values.reason });
      message.success('举报已提交');
      form.resetFields();
      onClose();
    } catch {
      message.error('举报失败');
    }
  };

  return (
    <Modal title="举报" open={open} onCancel={onClose} onOk={handleSubmit} okText="提交举报">
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label="举报原因" rules={[{ required: true, message: '请选择举报原因' }]}>
          <Select placeholder="请选择举报原因" options={REPORT_REASONS.map((r) => ({ label: r, value: r }))} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
