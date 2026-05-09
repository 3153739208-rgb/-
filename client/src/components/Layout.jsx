import { Outlet, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu, Badge, Dropdown, Button, Space, Avatar } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, MessageOutlined, UserOutlined, AppstoreOutlined, SearchOutlined } from '@ant-design/icons';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';

const { Header, Content } = AntLayout;

export default function Layout() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadCount } = useChatStore();

  const userMenu = {
    items: [
      { key: 'profile', label: '个人中心', onClick: () => navigate('/profile') },
      { key: 'products', label: '我的发布', onClick: () => navigate('/profile/products') },
      { key: 'favorites', label: '我的收藏', onClick: () => navigate('/profile/favorites') },
      { key: 'wants', label: '我的求购', onClick: () => navigate('/profile/wants') },
      { type: 'divider' },
      ...(user?.role === 'admin' ? [{ key: 'admin', label: '管理后台', onClick: () => navigate('/admin') }, { type: 'divider' }] : []),
      { key: 'logout', label: '退出登录', onClick: () => { logout(); navigate('/'); } },
    ],
  };

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <h2 style={{ margin: 0, color: '#1677ff', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => navigate('/')}>
            校园闲置交易
          </h2>
          <Menu mode="horizontal" style={{ border: 'none', flex: 1 }} items={[
            { key: 'home', icon: <HomeOutlined />, label: '首页', onClick: () => navigate('/') },
            { key: 'wants', icon: <SearchOutlined />, label: '求购广场', onClick: () => navigate('/wants') },
          ]} />
        </div>
        <Space>
          {isAuthenticated ? (
            <>
              <Badge count={unreadCount} size="small">
                <Button type="text" icon={<MessageOutlined />} onClick={() => navigate('/messages')} />
              </Badge>
              <Dropdown menu={userMenu} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar size="small" src={user?.avatar} icon={<UserOutlined />} />
                  <span>{user?.nickname}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <Space>
              <Button onClick={() => navigate('/login')}>登录</Button>
              <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
            </Space>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px 50px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
}
