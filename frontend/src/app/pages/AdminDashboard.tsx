import { Users, Map, Activity, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '2,847', change: '+12.5%', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Trips', value: '1,234', change: '+8.3%', icon: Map, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Activities', value: '12,456', change: '+15.2%', icon: Activity, color: 'from-green-500 to-emerald-500' },
    { label: 'Engagement Rate', value: '87.3%', change: '+3.1%', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ];

  const monthlyGrowth = [
    { month: 'Jan', users: 1850, trips: 890 },
    { month: 'Feb', users: 2100, trips: 950 },
    { month: 'Mar', users: 2350, trips: 1020 },
    { month: 'Apr', users: 2550, trips: 1100 },
    { month: 'May', users: 2847, trips: 1234 },
  ];

  const popularCities = [
    { name: 'Paris', trips: 324, users: 856 },
    { name: 'Tokyo', trips: 298, users: 721 },
    { name: 'New York', trips: 412, users: 934 },
    { name: 'Barcelona', trips: 276, users: 645 },
    { name: 'Dubai', trips: 189, users: 432 },
  ];

  const recentUsers = [
    { id: 1, name: 'Sarah Miller', email: 'sarah.m@email.com', trips: 3, joined: '2026-05-08' },
    { id: 2, name: 'John Davis', email: 'john.d@email.com', trips: 1, joined: '2026-05-07' },
    { id: 3, name: 'Emma Wilson', email: 'emma.w@email.com', trips: 5, joined: '2026-05-06' },
    { id: 4, name: 'Michael Brown', email: 'michael.b@email.com', trips: 2, joined: '2026-05-05' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor platform performance and user analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Growth Trend */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Platform Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={3} name="Users" />
              <Line type="monotone" dataKey="trips" stroke="#06B6D4" strokeWidth={3} name="Trips" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Cities */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Popular Destinations</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularCities}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="trips" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#0F172A]">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trips
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {user.trips}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
