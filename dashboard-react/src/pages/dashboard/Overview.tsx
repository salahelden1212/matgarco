import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { merchantAPI, orderAPI, productAPI, customerAPI } from '../../lib/api';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
} from 'lucide-react';

export default function Overview() {
  const user = useAuthStore((state) => state.user);

  // Fetch merchant stats
  const { data: merchantData } = useQuery({
    queryKey: ['merchant', user?.merchantId],
    queryFn: () => merchantAPI.getById(user!.merchantId!),
    enabled: !!user?.merchantId,
  });

  const merchant = merchantData?.data?.data?.merchant;

  // Fetch recent orders
  const { data: ordersData } = useQuery({
    queryKey: ['orders', { limit: 5 }],
    queryFn: () => orderAPI.getAll({ limit: 5 }),
  });

  const stats = [
    {
      name: 'إجمالي الطلبات',
      value: merchant?.stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+12.5%',
    },
    {
      name: 'إجمالي الإيرادات',
      value: `${merchant?.stats?.totalRevenue?.toLocaleString() || 0} جنيه`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8.2%',
    },
    {
      name: 'المنتجات',
      value: merchant?.stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-500',
      change: '+3',
    },
    {
      name: 'العملاء',
      value: merchant?.stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-orange-500',
      change: '+15',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          مرحباً، {user?.firstName} 👋
        </h1>
        <p className="text-blue-100">
          متجرك: <span className="font-semibold">{merchant?.name}</span>
        </p>
        <p className="text-blue-100 text-sm mt-1">
          {merchant?.subdomain}.matgarco.com
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <TrendingUp className="h-4 w-4 ml-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">أحدث الطلبات</h2>
        </div>
        <div className="p-6">
          {ordersData?.data?.data?.orders?.length > 0 ? (
            <div className="space-y-4">
              {ordersData.data.data.orders.map((order: any) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{order.total} جنيه</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد طلبات بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition text-right">
          <Package className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">إضافة منتج جديد</h3>
          <p className="text-sm text-gray-600">أضف منتجات إلى متجرك</p>
        </button>

        <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition text-right">
          <ShoppingCart className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">عرض الطلبات</h3>
          <p className="text-sm text-gray-600">إدارة طلبات العملاء</p>
        </button>

        <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition text-right">
          <Users className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">إدارة العملاء</h3>
          <p className="text-sm text-gray-600">تصفح قاعدة عملائك</p>
        </button>
      </div>
    </div>
  );
}
