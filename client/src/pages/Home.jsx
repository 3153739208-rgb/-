import { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Switch, Space, Pagination, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { productsAPI } from '../utils/api';
import { SORT_OPTIONS } from '../utils/constants';
import ProductCard from '../components/ProductCard';
import CampusSwitcher from '../components/CampusSwitcher';
import CategoryFilter from '../components/CategoryFilter';
import useCampusStore from '../store/campusStore';

export default function Home() {
  const { currentCampus } = useCampusStore();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [keyword, setKeyword] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    productsAPI.search({ campus: currentCampus, category, sort, verified_only: verifiedOnly, keyword, page, limit: 12 })
      .then((res) => { setProducts(res.data.products); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [currentCampus, category, sort, verifiedOnly, page]);

  useEffect(() => { setPage(1); }, [currentCampus, category, sort, verifiedOnly]);

  const handleSearch = () => { setPage(1); fetchProducts(); };

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <CampusSwitcher />
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space wrap>
              <CategoryFilter value={category} onChange={setCategory} />
              <Select value={sort} onChange={setSort} style={{ width: 120 }} options={SORT_OPTIONS} />
              <Space>
                <Switch checked={verifiedOnly} onChange={setVerifiedOnly} size="small" />
                <span style={{ fontSize: 13 }}>仅看认证卖家</span>
              </Space>
            </Space>
            <Input.Search
              placeholder="搜索商品"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 250 }}
              enterButton={<SearchOutlined />}
            />
          </Space>
        </Space>
      </div>

      <Spin spinning={loading}>
        {products.length === 0 ? (
          <Empty description="暂无商品" style={{ padding: 60 }} />
        ) : (
          <Row gutter={[16, 16]}>
            {products.map((p) => (
              <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        )}
      </Spin>
      {total > 12 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination current={page} total={total} pageSize={12} onChange={setPage} showTotal={(t) => `共 ${t} 件`} />
        </div>
      )}
    </div>
  );
}
