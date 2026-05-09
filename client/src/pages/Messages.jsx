import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Avatar, Badge, Typography, Empty } from 'antd';
import dayjs from 'dayjs';
import useChatStore from '../store/chatStore';

const { Text } = Typography;

export default function Messages() {
  const navigate = useNavigate();
  const { conversations, fetchConversations } = useChatStore();

  useEffect(() => { fetchConversations(); }, []);

  return (
    <Card title="我的消息">
      {conversations.length === 0 ? (
        <Empty description="暂无消息" />
      ) : (
        <List
          dataSource={conversations}
          renderItem={(conv) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '12px 16px' }}
              onClick={() => navigate(`/messages/${conv.user.id}`)}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={conv.unreadCount} size="small">
                    <Avatar src={conv.user.avatar} size={40} />
                  </Badge>
                }
                title={conv.user.nickname}
                description={
                  <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
                    {conv.lastMessage?.image ? '[图片]' : ''} {conv.lastMessage?.content || ''}
                  </Text>
                }
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {conv.lastMessage?.created_at ? dayjs(conv.lastMessage.created_at).format('MM-DD HH:mm') : ''}
              </Text>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
