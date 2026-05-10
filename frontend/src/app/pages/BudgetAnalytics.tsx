import { useParams } from 'react-router';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function BudgetAnalytics() {
  const { tripId } = useParams();

  const totalBudget = 4500;
  const totalSpent = 2100;
  const remaining = totalBudget - totalSpent;
  const percentSpent = (totalSpent / totalBudget) * 100;

  const categoryData = [
    { name: 'Transport', value: 650, color: '#2563EB' },
    { name: 'Accommodation', value: 800, color: '#06B6D4' },
    { name: 'Activities', value: 450, color: '#8B5CF6' },
    { name: 'Meals', value: 200, color: '#EC4899' },
  ];

  const dailySpending = [
    { day: 'Day 1', amount: 280 },
    { day: 'Day 2', amount: 320 },
    { day: 'Day 3', amount: 180 },
    { day: 'Day 4', amount: 420 },
    { day: 'Day 5', amount: 290 },
    { day: 'Day 6', amount: 210 },
    { day: 'Day 7', amount: 400 },
  ];

  const stats = [
    {
      label: 'Total Budget',
      value: `$${totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toLocaleString()}`,
      icon: TrendingDown,
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Remaining',
      value: `$${remaining.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Avg. Daily',
      value: `$${Math.round(totalSpent / 7)}`,
      icon: PieChartIcon,
      color: 'from-orange-500 to-red-500',
      bg: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Budget Analytics</h1>
        <p className="text-gray-600">Track and manage your trip expenses</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-[#0F172A] mb-6">Budget Overview</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Budget Progress</span>
            <span className="font-bold text-[#0F172A]">
              {percentSpent.toFixed(1)}% used
            </span>
          </div>

          <div className="relative">
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentSpent > 90
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : percentSpent > 75
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-[#2563EB] to-[#06B6D4]'
                }`}
                style={{ width: `${percentSpent}%` }}
              />
            </div>
          </div>

          {percentSpent > 80 && (
            <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Budget Alert</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You've used {percentSpent.toFixed(1)}% of your budget. Consider adjusting your spending to stay on track.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-sm text-gray-600">{category.name}</span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  ${category.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Daily Spending Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-gray-600">Average per day</span>
            <span className="font-bold text-[#0F172A]">${Math.round(totalSpent / 7)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#0F172A]">Expense Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budgeted
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { category: 'Transport', budgeted: 800, actual: 650 },
                { category: 'Accommodation', budgeted: 1200, actual: 800 },
                { category: 'Activities', budgeted: 600, actual: 450 },
                { category: 'Meals', budgeted: 400, actual: 200 },
                { category: 'Miscellaneous', budgeted: 500, actual: 0 },
              ].map((item) => {
                const diff = item.budgeted - item.actual;
                const progress = (item.actual / item.budgeted) * 100;
                return (
                  <tr key={item.category} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ${item.budgeted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${item.actual}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={diff >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {diff >= 0 ? '+' : ''}${diff}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden max-w-[100px]">
                          <div
                            className={`h-full rounded-full ${
                              progress > 100
                                ? 'bg-red-500'
                                : progress > 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
