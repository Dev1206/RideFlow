import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { EmptyState } from '../components/shared/EmptyState';
import { useAsyncData } from '../hooks/useAsyncData';
import * as api from '../services/api';
import { FiSearch, FiFilter, FiCalendar, FiMapPin, FiUser, FiPhone, FiTruck,FiFileText, FiClock, FiTrash2, FiCheck, FiChevronDown, FiUserX } from 'react-icons/fi';
import RidesMap from '../components/RidesMap';

// Add these interfaces at the top of the file
interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicle?: {
    make: string;
    model: string;
    color: string;
    plateNumber: string;
  };
  isAvailable: boolean;
}

interface Ride {
  _id: string;
  name: string;
  phone: string;
  pickupLocation: string;
  dropLocation: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driver?: Driver;
  isPrivate: boolean;
  notes?: string;
  userEmail: string;
}

// Define the status config type
interface StatusConfig {
  label: string;
  color: string;
  hoverColor: string;
}

interface StatusConfigs {
  pending: StatusConfig;
  confirmed: StatusConfig;
  completed: StatusConfig;
  cancelled: StatusConfig;
}

// Update the status configurations
const statusConfigs: StatusConfigs = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    hoverColor: 'hover:bg-yellow-200'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800',
    hoverColor: 'hover:bg-green-200'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800',
    hoverColor: 'hover:bg-blue-200'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    hoverColor: 'hover:bg-red-200'
  }
};

export default function ManageRidesPage() {
  const { signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: rides = [], loading, error, refetch: refetchRides } = useAsyncData(() => api.getAllRides(), []);
  const { data: drivers = [] } = useAsyncData(() => api.getDrivers(), []);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAssignDriver = async (rideId: string, driverId: string) => {
    try {
      await api.assignDriver(rideId, driverId);
      await refetchRides();
      alert('Driver assigned successfully');
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver');
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    if (!window.confirm('Are you sure you want to delete this ride?')) return;
    
    try {
      await api.deleteRide(rideId);
      await refetchRides();
      alert('Ride deleted successfully');
    } catch (error) {
      console.error('Error deleting ride:', error);
      alert('Failed to delete ride');
    }
  };

  const handleStatusChange = async (rideId: string, newStatus: string) => {
    try {
      setUpdatingStatus(rideId);
      await api.updateRideStatus(rideId, newStatus);
      await refetchRides();
      setStatusDropdownOpen(null);
      alert('Status updated successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRemoveDriver = async (rideId: string) => {
    if (!window.confirm('Are you sure you want to remove the driver from this ride?')) {
      return;
    }

    try {
      await api.removeDriver(rideId);
      await refetchRides();
      alert('Driver removed successfully');
    } catch (error) {
      console.error('Error removing driver:', error);
      alert('Failed to remove driver');
    }
  };

  const filteredRides = rides.filter((ride: Ride) =>
    ride.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-8 mt-12 md:mt-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Manage Rides
              </h1>
              <p className="mt-2 text-gray-600">
                View and manage all ride requests
              </p>
            </header>

            {/* Add Map View */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pending Ride Locations
              </h2>
              <RidesMap rides={rides} />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rides..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-5 p-2 sm:p-0 ml-16">
                  <FiFilter className="text-indigo-500 h-5 w-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rides List */}
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredRides.length === 0 ? (
              <EmptyState
                message="No rides found"
                description="No rides match your search criteria"
                icon={<FiClock className="w-12 h-12 text-gray-400 mx-auto" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRides.map((ride: Ride) => (
                  <div 
                    key={ride._id} 
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                  >
                    {/* Status Header with Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setStatusDropdownOpen(statusDropdownOpen === ride._id ? null : ride._id)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border ${
                          statusConfigs[ride.status].color
                        } transition-colors`}
                        disabled={updatingStatus === ride._id}
                      >
                        <span className="flex items-center gap-2">
                          {updatingStatus === ride._id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiCheck className="w-4 h-4" />
                          )}
                          {statusConfigs[ride.status].label}
                        </span>
                        <FiChevronDown className={`w-4 h-4 transition-transform ${
                          statusDropdownOpen === ride._id ? 'transform rotate-180' : ''
                        }`} />
                      </button>

                      {/* Status Dropdown */}
                      {statusDropdownOpen === ride._id && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-10">
                          {Object.entries(statusConfigs).map(([status, { label, hoverColor }]) => (
                            status !== ride.status && (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(ride._id, status)}
                                className={`w-full px-4 py-2 text-left flex items-center gap-2 ${hoverColor} transition-colors`}
                                disabled={updatingStatus === ride._id}
                              >
                                <FiCheck className="w-4 h-4 opacity-0" />
                                {label}
                              </button>
                            )
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Customer Details */}
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                            <FiUser className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{ride.name}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <FiPhone className="w-3 h-3" />
                              {ride.phone}
                            </p>
                            
                          </div>
                        </div>
                      </div>
                      {/* Date and Time */}
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                              <FiCalendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm text-indigo-600 font-medium">
                                {new Date(ride.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric', 
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <div className="flex items-center gap-1 text-indigo-500">
                                <FiClock className="w-3 h-3" />
                                <p className="text-sm">
                                  {parseInt(ride.time.split(':')[0]) > 11 
                                    ? `${ride.time} PM`
                                    : `${ride.time} AM`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
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
                      {/* Notes */}
                      {ride.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <FiFileText className="w-4 h-4 text-indigo-500" />
                            Additional Notes
                          </h4>
                          <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
                            {ride.notes}
                          </p>
                        </div>
                      )}
                      {/* Driver Assignment */}
                      {ride.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FiTruck className="w-4 h-4 text-indigo-500" />
                            Assign Driver
                          </h4>
                          <select
                            onChange={(e) => handleAssignDriver(ride._id, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            defaultValue=""
                          >
                            <option value="" disabled>Select a driver</option>
                            {drivers
                              .filter((driver: Driver) => driver.isAvailable)
                              .map((driver: Driver) => (
                                <option key={driver._id} value={driver._id}>
                                  {driver.name} - {driver.vehicle?.make} {driver.vehicle?.model}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      )}

                      {/* Driver Details */}
                      {ride.driver && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <FiTruck className="w-4 h-4 text-indigo-500" />
                              Assigned Driver
                            </h4>
                            {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                              <button
                                onClick={() => handleRemoveDriver(ride._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm"
                                title="Remove Driver"
                              >
                                <FiUserX className="w-4 h-4" />
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white">
                                <FiUser className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{ride.driver.name}</p>
                                <p className="text-sm text-gray-600">{ride.driver.phone}</p>
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

                      {/* Action Buttons */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteRide(ride._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Ride"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
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
