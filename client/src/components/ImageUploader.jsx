import { Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { uploadAPI } from '../utils/api';

export default function ImageUploader({ value = [], onChange, max = 9 }) {
  const handleUpload = async ({ file }) => {
    try {
      const res = await uploadAPI.uploadImage(file);
      const newList = [...value, res.data.url];
      onChange?.(newList);
      message.success('上传成功');
    } catch {
      message.error('上传失败');
    }
    return false;
  };

  const handleRemove = (file) => {
    const newList = value.filter((url) => url !== (file.url || file.response?.url));
    onChange?.(newList);
  };

  const fileList = value.map((url, i) => ({
    uid: `${i}`,
    name: `image-${i}`,
    status: 'done',
    url,
  }));

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      customRequest={handleUpload}
      onRemove={handleRemove}
      accept="image/*"
      maxCount={max}
    >
      {value.length < max && (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      )}
    </Upload>
  );
}
