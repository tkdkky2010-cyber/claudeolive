import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function SellerCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [csInquiries, setCSInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { admin, logout, token } = useAdminAuth();
  const navigate = useNavigate();

  const apiClient = axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }

    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'returns') {
      fetchReturns();
    } else if (activeTab === 'cs') {
      fetchCSInquiries();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, admin, navigate]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/seller/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('통계 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/seller/orders?limit=20');
      setOrders(response.data.data);
    } catch (error) {
      console.error('주문 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/seller/returns?limit=20');
      setReturns(response.data.data);
    } catch (error) {
      console.error('반품 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCSInquiries = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/seller/cs?limit=20');
      setCSInquiries(response.data.data);
    } catch (error) {
      console.error('CS 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/seller/users?limit=20');
      setUsers(response.data.data);
    } catch (error) {
      console.error('회원 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.patch(`/seller/orders/${orderId}/status`, { status: newStatus });
      alert('주문 상태가 변경되었습니다');
      fetchOrders();
    } catch (error) {
      alert('주문 상태 변경에 실패했습니다');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      shipping: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refund_requested: 'bg-orange-100 text-orange-800',
      refunded: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: '주문대기',
      paid: '결제완료',
      preparing: '배송준비',
      shipping: '배송중',
      delivered: '배송완료',
      cancelled: '취소',
      refund_requested: '환불요청',
      refunded: '환불완료'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">올영 셀러센터</h1>
            <p className="text-sm text-gray-600">{admin?.name}님 환영합니다</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              사이트로 이동
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            {[
              { id: 'dashboard', label: '대시보드' },
              { id: 'orders', label: '주문 관리' },
              { id: 'returns', label: '반품/취소' },
              { id: 'cs', label: 'CS 문의' },
              { id: 'users', label: '회원 관리' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {activeTab === 'dashboard' && stats && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm mb-2">총 주문</div>
                    <div className="text-3xl font-bold">{stats.totalOrders}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm mb-2">총 회원</div>
                    <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm mb-2">대기 중인 CS</div>
                    <div className="text-3xl font-bold text-orange-500">{stats.pendingCS}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm mb-2">주문 상태</div>
                    <div className="space-y-1 text-sm">
                      {stats.orderStats?.map((stat) => (
                        <div key={stat.status} className="flex justify-between">
                          <span>{stat.status}</span>
                          <span className="font-bold">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          주문이 없습니다
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.order_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.user_email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.total_amount?.toLocaleString()}원</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className="px-2 py-1 border rounded text-xs"
                            >
                              <option value="pending">주문대기</option>
                              <option value="paid">결제완료</option>
                              <option value="preparing">배송준비</option>
                              <option value="shipping">배송중</option>
                              <option value="delivered">배송완료</option>
                              <option value="cancelled">취소</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Returns */}
            {activeTab === 'returns' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사유</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요청일</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {returns.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          반품/취소 요청이 없습니다
                        </td>
                      </tr>
                    ) : (
                      returns.map((ret) => (
                        <tr key={ret.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{ret.order_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{ret.user_email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{ret.type}</td>
                          <td className="px-6 py-4 text-sm">{ret.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{ret.status}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(ret.created_at).toLocaleDateString('ko-KR')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* CS Inquiries */}
            {activeTab === 'cs' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csInquiries.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          CS 문의가 없습니다
                        </td>
                      </tr>
                    ) : (
                      csInquiries.map((inquiry) => (
                        <tr key={inquiry.id}>
                          <td className="px-6 py-4 text-sm font-medium">{inquiry.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{inquiry.user_email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{inquiry.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{inquiry.status}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">인증방식</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.auth_method === 'google' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {user.auth_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
