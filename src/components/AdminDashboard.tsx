import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  FiUsers, FiTruck, FiCalendar, FiCheckCircle, FiUserPlus, 
  FiDownload 
} from 'react-icons/fi';
import { RiCarLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

// Define vibrant color palette
const COLORS = {
  primary: '#6366F1',   // Indigo
  secondary: '#8B5CF6', // Purple
  success: '#10B981',   // Emerald
  warning: '#F59E0B',   // Amber
  danger: '#EF4444',    // Red
  info: '#3B82F6',      // Blue
  pink: '#EC4899',      // Pink
  orange: '#F97316',    // Orange
  teal: '#14B8A6',      // Teal
  cyan: '#06B6D4'       // Cyan
};

// Chart colors
const CHART_COLORS = {
  pending: '#FFB020',    // Bright Yellow
  confirmed: '#3B82F6',  // Bright Blue
  completed: '#10B981',  // Bright Green
  cancelled: '#F43F5E',  // Bright Red
  available: '#22D3EE',  // Bright Cyan
  onRide: '#8B5CF6',    // Bright Purple
  completedToday: '#F59E0B' // Bright Orange
};

// Add these interfaces at the top
interface DashboardMetrics {
  totalRides: number;
  activeUsers: number;
  dailyBookings: number;
  completedRides: number;
  totalUsers: number;
  totalDrivers: number;
  activeRides: number;
  newUsers: {
    daily: number;
    weekly: number;
  };
  rideStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  driverStatus: {
    available: number;
    unavailable: number;
  };
}

interface Ride {
  _id: string;
  name: string;
  phone: string;
  pickupLocation: string;
  dropLocation: string;
  date: string;
  time: string;
  status: string;
  driver?: {
    name: string;
    phone: string;
    vehicle?: {
      make: string;
      model: string;
      color: string;
      plateNumber: string;
    };
  };
}

interface DashboardProps {
  metrics: DashboardMetrics;
  loading: boolean;
  error: string | null;
  rides: Ride[];
}

export default function AdminDashboard({ metrics, loading, error, rides }: DashboardProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading dashboard data: {error}
      </div>
    );
  }

  const recentRides = rides
    .filter((ride: Ride) => ride.status !== 'pending')
    .sort((a: Ride, b: Ride) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Update the data preparation for line chart
  const getLast7DaysData = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date;
    });

    return last7Days.map((date, index) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayRides = rides.filter(ride => ride.date.split('T')[0] === dateStr);

      return {
        day: index === 6 ? 'Today' : 
             index === 5 ? 'Yesterday' : 
             date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayRides.filter(ride => ride.status === 'completed').length,
        cancelled: dayRides.filter(ride => ride.status === 'cancelled').length,
        new: dayRides.length
      };
    });
  };

  // Replace the hardcoded data with actual data
  const last7DaysData = getLast7DaysData();

  // Prepare data for bar chart - Driver Performance with actual metrics
  const driverPerformanceData = [
    { 
      name: 'Available', 
      count: metrics.driverStatus.available, 
      color: CHART_COLORS.available 
    },
    { 
      name: 'On Ride', 
      count: metrics.rideStatus.inProgress, 
      color: CHART_COLORS.onRide 
    },
    { 
      name: 'Completed Today', 
      count: metrics.completedRides, 
      color: CHART_COLORS.completedToday 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Section - Adjusted for mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rides Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-4 lg:p-6 text-white">
          <div className="flex flex-col h-full">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <RiCarLine className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <p className="text-sm lg:text-base font-medium text-white/80">Total Rides</p>
            <p className="text-xl lg:text-2xl font-bold mt-1">{metrics.totalRides}</p>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 lg:p-6 text-white">
          <div className="flex flex-col h-full">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <FiUsers className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <p className="text-sm lg:text-base font-medium text-white/80">Active Users</p>
            <p className="text-xl lg:text-2xl font-bold mt-1">{metrics.activeUsers}</p>
          </div>
        </div>

        {/* Daily Bookings Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 lg:p-6 text-white">
          <div className="flex flex-col h-full">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <FiCalendar className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <p className="text-sm lg:text-base font-medium text-white/80">Daily Bookings</p>
            <p className="text-xl lg:text-2xl font-bold mt-1">{metrics.dailyBookings}</p>
          </div>
        </div>

        {/* Completed Rides Card */}
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl p-4 lg:p-6 text-white">
          <div className="flex flex-col h-full">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <FiCheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <p className="text-sm lg:text-base font-medium text-white/80">Completed Rides</p>
            <p className="text-xl lg:text-2xl font-bold mt-1">{metrics.completedRides}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Updated with all 4 buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/manage-users')}
          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-sm lg:text-base"
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FiUserPlus className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="font-medium text-gray-700">Manage Users</span>
        </button>

        <button
          onClick={() => navigate('/manage-drivers')}
          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-sm lg:text-base"
        >
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <FiTruck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-medium text-gray-700">Manage Drivers</span>
        </button>

        <button
          onClick={() => navigate('/manage-rides')}
          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-sm lg:text-base"
        >
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <FiCalendar className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-medium text-gray-700">Manage Rides</span>
        </button>

        <button
          onClick={() => {
            const csvContent = [
              ['Metric', 'Value'],
              ['Total Users', metrics.totalUsers],
              ['Active Users', metrics.activeUsers],
              ['Total Rides', metrics.totalRides],
              ['Completed Rides', metrics.completedRides]
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'dashboard-metrics.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-sm lg:text-base"
        >
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <FiDownload className="w-4 h-4 text-teal-600" />
          </div>
          <span className="font-medium text-gray-700">Export Data</span>
        </button>
      </div>

      {/* Charts Section - Adjusted for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ride Status Chart */}
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Ride Status Overview</h3>
          <div className="h-[200px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="new" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  name="New Bookings"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={COLORS.success} 
                  strokeWidth={2}
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="cancelled" 
                  stroke={COLORS.danger} 
                  strokeWidth={2}
                  name="Cancelled"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver Status Chart */}
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Driver Availability</h3>
          <div className="h-[200px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={driverPerformanceData}
                barSize={60}
                barGap={0}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(229, 231, 235, 0.3)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}
                />
                <Bar 
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                >
                  {driverPerformanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{
                        filter: 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))',
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Add Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {driverPerformanceData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentRides.map((ride) => (
              <div key={ride._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ride.status === 'completed' ? 'bg-green-100 text-green-600' :
                  ride.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  ride.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <FiCalendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{ride.driver?.name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">Booked a ride • {new Date(ride.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                  ride.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  ride.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {ride.status}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/manage-rides')}
            className="w-full mt-4 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium"
          >
            View All Activity
          </button>
        </div>
      </section>
    </div>
  );
} 