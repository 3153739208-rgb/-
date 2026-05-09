import { Select, Space, Tag } from 'antd';
import { EnvironmentOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import useCampusStore from '../store/campusStore';
import { CAMPUSES } from '../utils/constants';

export default function CampusSwitcher() {
  const { currentCampus, recentCampuses, switchCampus, clearHistory } = useCampusStore();

  return (
    <Space wrap>
      <EnvironmentOutlined />
      <Select
        value={currentCampus}
        onChange={switchCampus}
        style={{ width: 140 }}
        options={CAMPUSES.map((c) => ({ label: c, value: c }))}
      />
      {recentCampuses.length > 0 && (
        <Space size={4} style={{ fontSize: 12 }}>
          <HistoryOutlined style={{ color: '#999' }} />
          {recentCampuses.slice(0, 5).map((c) => (
            <Tag
              key={c}
              color={c === currentCampus ? 'blue' : 'default'}
              style={{ cursor: 'pointer' }}
              onClick={() => switchCampus(c)}
            >
              {c}
            </Tag>
          ))}
          <DeleteOutlined style={{ color: '#ccc', cursor: 'pointer' }} onClick={clearHistory} />
        </Space>
      )}
    </Space>
  );
}
