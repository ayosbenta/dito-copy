
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../contexts/StoreContext';
import { Order, User } from '../types';
import { ShoppingBag, Package, Clock, CheckCircle, Truck, ChevronRight, LogOut, User as UserIcon, MapPin } from 'lucide-react';
import { Badge, Button } from '../components/UI';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isRefreshing, refreshData } = useContext(StoreContext);
  const [user, setUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('dito_customer_user');
    if (!storedUser) {
      navigate('/customer/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Filter Orders - Matching by exact name string since Order object stores name string currently
    // In a future refactor, orders should store customerId
    const myOrders = orders.filter(o => o.customer.toLowerCase() === parsedUser.name.toLowerCase());
    setUserOrders(myOrders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [orders, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dito_customer_user');
    navigate('/customer/login');
  };

  if (!user) return null;

  const stats = {
    totalSpent: userOrders.reduce((acc, o) => acc + o.total, 0),
    activeOrders: userOrders.filter(o => o.status !== 'Delivered').length,
    completedOrders: userOrders.filter(o => o.status === 'Delivered').length
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profile */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center text-blue-600 font-bold text-2xl">
                 {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-gray-900">Hello, {user.firstName}!</h1>
                 <p className="text-gray-500 flex items-center gap-2 mt-1">
                   <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold uppercase text-gray-600">Customer</span>
                   {user.username}
                 </p>
              </div>
           </div>
           <div className="flex gap-3">
              <Button variant="outline" onClick={refreshData} className="flex items-center gap-2">
                 {isRefreshing ? 'Syncing...' : 'Refresh Data'}
              </Button>
              <Button variant="secondary" onClick={handleLogout} className="flex items-center gap-2">
                 <LogOut size={16} /> Logout
              </Button>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Sidebar / Info */}
           <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><UserIcon size={18} className="text-primary"/> My Details</h3>
                 <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Full Name</p>
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Mobile</p>
                      <p className="font-medium text-gray-900">{user.mobile}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Member Since</p>
                      <p className="font-medium text-gray-900">{new Date(user.joinDate || '').toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Total Spent</h3>
                    <ShoppingBag className="opacity-50" />
                 </div>
                 <p className="text-3xl font-black tracking-tight">₱{stats.totalSpent.toLocaleString()}</p>
                 <div className="mt-4 flex gap-2 text-xs font-medium opacity-80">
                    <span className="bg-white/20 px-2 py-1 rounded">{stats.activeOrders} Active Orders</span>
                    <span className="bg-white/20 px-2 py-1 rounded">{stats.completedOrders} Completed</span>
                 </div>
              </div>
           </div>

           {/* Main Orders Area */}
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Order History</h2>
              
              {userOrders.length > 0 ? (
                <div className="space-y-4">
                   {userOrders.map(order => (
                     <div key={order.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <span className="font-bold text-gray-900 text-lg">{order.id}</span>
                                 <Badge color={order.status === 'Delivered' ? 'green' : order.status === 'Shipped' ? 'blue' : 'yellow'}>{order.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                           </div>
                           <p className="text-xl font-bold text-primary">₱{order.total.toLocaleString()}</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                           {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                                 <span className="text-gray-700 font-medium">{item.quantity}x {item.name}</span>
                                 <span className="text-gray-500">₱{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                           ))}
                           {(!order.orderItems || order.orderItems.length === 0) && (
                              <p className="text-sm text-gray-500">{order.items} items purchased</p>
                           )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                           <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                              <MapPin size={16} /> 
                              <span className="truncate max-w-[200px]">{order.shippingDetails?.city || 'Address N/A'}</span>
                           </div>
                           {order.trackingNumber && (
                              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-medium">
                                 <Truck size={16} /> {order.trackingNumber}
                              </div>
                           )}
                           {order.status === 'Delivered' && (
                              <div className="flex items-center gap-2 text-green-600 font-bold ml-auto">
                                 <CheckCircle size={16} /> Received
                              </div>
                           )}
                           {order.status === 'Processing' && (
                              <div className="flex items-center gap-2 text-yellow-600 font-bold ml-auto">
                                 <Clock size={16} /> Preparing
                              </div>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package size={32} className="text-gray-300" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                   <p className="text-gray-500 mb-6">Looks like you haven't placed any orders with this account.</p>
                   <Link to="/catalog">
                      <Button>Start Shopping</Button>
                   </Link>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
