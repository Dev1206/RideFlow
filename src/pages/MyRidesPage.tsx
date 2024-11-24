import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { EmptyState } from '../components/shared/EmptyState';
import RideCard from '../components/RideCard';
import { useAsyncData } from '../hooks/useAsyncData';
import * as api from '../services/api';

// Add interface for Ride type if not already defined
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

export default function MyRidesPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: rides = [], loading, error, refetch } = useAsyncData(() => api.getDriverRides(), []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleStatusChange = async (rideId: string) => {
    try {
      await api.updateRideStatus(rideId, 'completed');
      refetch();
    } catch (error) {
      console.error('Error updating ride status:', error);
    }
  };

  // Update the filter function with proper type annotation
  const upcomingRides = rides.filter((ride: Ride) => 
    ride.status === 'pending' || ride.status === 'confirmed'
  );

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-12 md:mt-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Rides
              </h1>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:flex-initial">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rides..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </header>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : rides.length === 0 ? (
              <EmptyState
                message="No rides found"
                description="You don't have any assigned rides yet"
                icon="🚗"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {upcomingRides.map((ride: Ride) => (
                  <div key={ride._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <RideCard ride={ride} onStatusChange={handleStatusChange} />
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