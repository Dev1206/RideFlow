import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { useAsyncData } from '../hooks/useAsyncData';
import * as api from '../services/api';
import { FiClock, FiMapPin, FiCalendar, FiTruck, FiUser, FiPhone, FiFilter } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

interface Ride {
  _id: string;
  date: string;
  time: string;
  pickupLocation: string;
  dropLocation: string;
  status: string;
  isPrivate: boolean;
  returnRide?: boolean;
  returnDate?: string;
  returnTime?: string;
  driver?: {
    name: string;
    phone: string;
    email: string;
    vehicle?: {
      color: string;
      make: string;
      model: string;
      plateNumber: string;
    };
  };
}

export default function RideHistoryPage() {
  const { signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: rides = [], loading, error } = useAsyncData(() => api.getCompletedRides(), []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredRides = rides.filter((ride: Ride) => 
    statusFilter === 'all' || ride.status === statusFilter
  );

  const formatDateTime = (date: string, time: string) => {
    try {
      const parsedDate = parseISO(date);
      return `${format(parsedDate, 'EEEE, MMMM d, yyyy')} at ${time}`;
    } catch (error) {
      return `${date} at ${time}`;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-8 mt-12 md:mt-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ride History
              </h1>
              <p className="text-gray-500 mt-2">View all your past rides and their details</p>
            </header>

            {/* Filters */}
            <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <FiFilter className="text-indigo-500 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Rides</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Rides List */}
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredRides.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiClock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No rides found</h3>
                <p className="text-gray-500">You haven't taken any rides yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRides.map((ride: Ride) => (
                  <div 
                    key={ride._id} 
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                  >
                    {/* Status Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                      <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-lg rounded-full text-xs font-medium text-white">
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                        </span>
                        <span className="text-white/90 text-sm">
                          {format(parseISO(ride.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Date and Time */}
                      <div className="flex items-center gap-3 text-gray-600">
                        <FiCalendar className="w-5 h-5 text-indigo-500" />
                        <span>{formatDateTime(ride.date, ride.time)}</span>
                      </div>

                      {/* Locations */}
                      <div className="space-y-3">
                        <div className="relative pl-8">
                          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                          
                          <div className="relative mb-4">
                            <div className="absolute -left-8 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                              <FiMapPin className="w-3 h-3 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Pickup</p>
                              <p className="text-gray-900">{ride.pickupLocation}</p>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <div className="absolute -left-8 w-6 h-6 rounded-full bg-purple-100 border-2 border-purple-500 flex items-center justify-center">
                              <FiMapPin className="w-3 h-3 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Drop-off</p>
                              <p className="text-gray-900">{ride.dropLocation}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Driver Details */}
                      {ride.driver && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FiTruck className="w-4 h-4 text-indigo-500" />
                            Driver Details
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                <FiUser className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{ride.driver.name}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <FiPhone className="w-3 h-3" />
                                  {ride.driver.phone}
                                </p>
                                {ride.driver.vehicle && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {ride.driver.vehicle.color} {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                                    <br />
                                    Plate: {ride.driver.vehicle.plateNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 