import { Tag } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

export default function VerifyBadge({ isVerified }) {
  if (!isVerified) return null;
  return (
    <Tag icon={<SafetyCertificateOutlined />} color="green">
      已认证
    </Tag>
  );
}
