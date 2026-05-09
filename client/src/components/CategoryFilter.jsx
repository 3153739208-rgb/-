import { Segmented } from 'antd';
import { CATEGORIES } from '../utils/constants';

export default function CategoryFilter({ value, onChange }) {
  return (
    <Segmented
      value={value}
      onChange={onChange}
      options={[{ label: '全部', value: '' }, ...CATEGORIES.map((c) => ({ label: c, value: c }))]}
    />
  );
}
