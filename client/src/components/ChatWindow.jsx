import { useEffect, useRef, useState } from 'react';
import { Input, Button, Space, List, Avatar, Typography, Upload, message } from 'antd';
import { SendOutlined, CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import { messagesAPI, uploadAPI } from '../utils/api';

const { Text } = Typography;

export default function ChatWindow({ userId, productId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const { user } = useAuthStore();
  const { socket, onlineUsers, markRead } = useChatStore();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    messagesAPI.getMessages(userId)
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
    markRead(userId);
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.sender_id === userId || msg.sender_id === user?.id) {
        setMessages((prev) => [...prev, msg]);
        if (msg.sender_id === userId) markRead(userId);
      }
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, userId, user?.id]);

  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (imageUrl) => {
    if (!text.trim() && !imageUrl) return;
    try {
      const data = { receiver_id: parseInt(userId), content: text.trim() || '', image: imageUrl };
      if (productId) data.product_id = productId;
      const res = await messagesAPI.send(data);
      setMessages((prev) => [...prev, res.data]);
      setText('');
    } catch {
      message.error('发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async ({ file }) => {
    try {
      const res = await uploadAPI.uploadImage(file);
      sendMessage(res.data.url);
    } catch {
      message.error('图片上传失败');
    }
    return false;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><LoadingOutlined /></div>;

  const isOnline = onlineUsers.has(userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: 16, maxHeight: 400 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>暂无消息，发送第一条消息吧</div>
        )}
        <List
          split={false}
          dataSource={messages}
          renderItem={(msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                {!isMe && <Avatar size={32} src={msg.sender?.avatar} style={{ marginRight: 8 }} />}
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    background: isMe ? '#1677ff' : '#f0f0f0',
                    color: isMe ? '#fff' : '#000',
                    padding: '8px 12px',
                    borderRadius: 12,
                    wordBreak: 'break-word',
                  }}>
                    {msg.image && <img src={msg.image} alt="" style={{ maxWidth: 200, borderRadius: 8, marginBottom: msg.content ? 8 : 0 }} />}
                    {msg.content}
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', textAlign: isMe ? 'right' : 'left', marginTop: 4 }}>
                    {dayjs(msg.created_at).format('HH:mm')}
                  </Text>
                </div>
                {isMe && <Avatar size={32} src={user?.avatar} style={{ marginLeft: 8 }} />}
              </div>
            );
          }}
        />
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '12px 0' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Upload customRequest={handleImageUpload} showUploadList={false} accept="image/*">
            <Button icon={<CameraOutlined />} />
          </Upload>
          <Input.TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="输入消息..."
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          <Button type="primary" icon={<SendOutlined />} loading={sending} onClick={() => sendMessage()}>
            发送
          </Button>
        </Space.Compact>
      </div>
    </div>
  );
}
