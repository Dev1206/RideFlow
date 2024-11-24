import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from '../services/api';
import { FiCalendar, FiClock, FiArrowRight, FiCheckCircle, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminDashboard from './AdminDashboard';
import { convertTo12Hour, formatDate, getNextDayDate } from '../utils/dateUtils';
import { getStoredToken } from '../services/api';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { ErrorMessage } from './shared/ErrorMessage';
import { EmptyState } from './shared/EmptyState';
import { useAsyncData } from '../hooks/useAsyncData';
import { defaultMetrics } from '../constants/metrics';
import { Sidebar } from './shared/Sidebar';

// Define interfaces for different data types
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
  name: string;
  phone: string;
  email?: string;
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

// Add interfaces for components
interface RideCardProps {
  ride: Ride;
  isDriverView?: boolean;
  onStatusUpdate?: (rideId: string, status: string) => void;
}

// Add this interface for the edit form
interface DriverEditForm {
  phone: string;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plateNumber: string;
  };
}

// Add this type near your other interfaces
type VehicleField = 'make' | 'model' | 'color' | 'plateNumber';


// Add helper components
const RideCard: React.FC<RideCardProps> = ({ ride, isDriverView = false, onStatusUpdate }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ride.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          ride.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          ride.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {ride.status}
        </span>
      </div>
      {ride.isPrivate && (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Private
        </span>
      )}
    </div>

    <div className="space-y-4">
      <div>
      
        <p className="text-sm font-medium text-gray-500">Date & Time</p>
        <p className="text-base text-gray-900">
          {formatDate(getNextDayDate(ride.date))} at {convertTo12Hour(ride.time)}
        </p>
      </div>

      <div className="relative pl-8">
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
        
        <div className="relative mb-6">
          <div className="absolute -left-8 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pickup</p>
            <p className="text-base text-gray-900">{ride.pickupLocation}</p>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -left-8 w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Drop-off</p>
            <p className="text-base text-gray-900">{ride.dropLocation}</p>
          </div>
        </div>
      </div>

      {ride.returnRide && ride.returnDate && ride.returnTime && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Return Journey</h4>
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
            
            <div className="relative mb-6">
              <div className="absolute -left-8 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Return Pickup</p>
                <p className="text-base text-gray-900">{ride.dropLocation}</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-8 w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Return Drop-off</p>
                <p className="text-base text-gray-900">{ride.pickupLocation}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Return Date: </span>
              {formatDate(ride.returnDate)} at {convertTo12Hour(ride.returnTime)}
            </p>
          </div>
        </div>
      )}

      {onStatusUpdate && ride.status !== 'completed' && (
        <div className="pt-4">
          <button
            onClick={() => onStatusUpdate(ride._id, 'completed')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mark as Completed
          </button>
        </div>
      )}

      {ride.status === 'confirmed' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {isDriverView ? 'Customer Details' : 'Driver Details'}
          </h4>
          {isDriverView ? (
            // Customer Details (shown to drivers)
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🚘</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{ride.name}</p>
                <p className="text-sm text-gray-500">{ride.phone}</p>
                {ride.email && (
                  <p className="text-sm text-gray-500">{ride.email}</p>
                )}
              </div>
            </div>
          ) : (
            // Driver Details (shown to customers)
            ride.driver ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">🚘</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ride.driver.name}</p>
                  <p className="text-sm text-gray-500">{ride.driver.phone}</p>
                  {ride.driver.vehicle && (
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">
                        {ride.driver.vehicle.color} {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-500">
                        Plate: {ride.driver.vehicle.plateNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Loading driver details...
              </div>
            )
          )}
        </div>
      )}
    </div>
  </div>
);

// Add this helper function at the top
const waitForToken = async () => {
  let attempts = 0;
  while (!getStoredToken() && attempts < 5) {
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }
  return getStoredToken();
};

export default function Dashboard() {
  const { user, userRoles, signOut, isDeveloper } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fix: Pass empty array as dependencies for useAsyncData
  const { data: rides = [], loading: ridesLoading, error: fetchRidesError, refetch: refetchRides } = 
    useAsyncData(() => {
      // If admin/developer, get all rides, otherwise get user's rides
      if (userRoles.includes('admin') || isDeveloper()) {
        return api.getAllRides();
      } else {
        return api.getUserRides();
      }
    }, []); // Empty array as dependencies
  
  // Fix: Pass empty array as dependencies and handle defaultMetrics in the initial state
  const { data: metrics = defaultMetrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = 
    useAsyncData(() => {
      if (userRoles.includes('admin') || isDeveloper()) {
        return api.getDashboardMetrics();
      }
      return Promise.resolve(defaultMetrics);
    }, []); // Empty array as dependencies
  
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Wait for token before loading data
        await waitForToken();
        
        if (userRoles.includes('admin') || isDeveloper()) {
          await refetchMetrics();
          await refetchRides();
        } else if (userRoles.includes('driver')) {
          await fetchDriverInfo();
          await fetchDriverRides();
        } else {
          await refetchRides();
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [userRoles, isDeveloper]);

  // States for driver dashboard
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [driverRides, setDriverRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);
  const [ridesError, setRidesError] = useState<string | null>(null);
  const [driverFormData, setDriverFormData] = useState<DriverEditForm>({
    phone: '',
    vehicle: {
      make: '',
      model: '',
      color: '',
      plateNumber: ''
    }
  });

  useEffect(() => {
    const fetchAdminEmail = async () => {
      try {
        // Only fetch admin contact if user is admin or developer
        if (userRoles.includes('admin') || isDeveloper()) {
          const response = await api.getAdminContact();
          setDriverFormData({
            phone: response.phone || '',
            vehicle: {
              make: response.vehicle?.make || '',
              model: response.vehicle?.model || '',
              color: response.vehicle?.color || '',
              plateNumber: response.vehicle?.plateNumber || ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching admin email:', error);
      }
    };

    // Only run for admin/developer users
    if (userRoles.includes('admin') || isDeveloper()) {
      fetchAdminEmail();
    }
  }, [userRoles, isDeveloper]);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (userRoles.includes('driver')) {
        try {
          const response = await api.getDriverInfo();
          if (response) {
            setDriverInfo(response);
            setDriverFormData({
              phone: response.phone || '',
              vehicle: {
                make: response.vehicle?.make || '',
                model: response.vehicle?.model || '',
                color: response.vehicle?.color || '',
                plateNumber: response.vehicle?.plateNumber || ''
              }
            });
          }
        } catch (error) {
          console.error('Error fetching driver info:', error);
        }
      }
    };

    fetchDriverData();
  }, [userRoles]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchDriverInfo = async () => {
    try {
      const response = await api.getDriverInfo();
      if (response) {
        setDriverInfo(response);
        setDriverFormData({
          phone: response.phone || '',
          vehicle: {
            make: response.vehicle?.make || '',
            model: response.vehicle?.model || '',
            color: response.vehicle?.color || '',
            plateNumber: response.vehicle?.plateNumber || ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching driver info:', error);
    }
  };

  const fetchDriverRides = async () => {
    try {
      setLoadingRides(true);
      const response = await api.getDriverRides();
      setDriverRides(response || []);
      setRidesError(null);
    } catch (error) {
      console.error('Error fetching driver rides:', error);
      setRidesError('Failed to load rides');
    } finally {
      setLoadingRides(false);
    }
  };

  const handleStatusUpdate = async (rideId: string, newStatus: string) => {
    try {
      setLoadingRides(true);
      await api.updateRideStatus(rideId, newStatus);
      
      // Show success message
      setSuccessMessage('Ride status updated successfully');
      
      // Refresh the rides list
      await fetchDriverRides();
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      // Show error message to user
      alert(error.message || 'Failed to update ride status');
    } finally {
      setLoadingRides(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Filter rides to separate upcoming and completed rides
  const upcomingRides = rides?.filter((ride: Ride) => 
    ride.status === 'pending' || ride.status === 'confirmed'
  ) || [];
  
  const completedRides = rides?.filter((ride: Ride) => 
    ride.status === 'completed'
  ) || [];

  const handleDeleteRide = async (rideId: string) => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) {
      return;
    }

    try {
      await api.deleteRide(rideId);
      setSuccessMessage('Ride cancelled successfully');
      // Refresh the rides list
      await refetchRides();
    } catch (error: any) {
      console.error('Error deleting ride:', error);
      // Show more specific error message to user
      alert(error.message || 'Failed to cancel ride. Only pending rides can be cancelled.');
    }
  };

  const renderCustomerDashboard = () => (
    <div className="space-y-8">
      {/* Header with Book New Ride Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Your Dashboard
        </h2>
        <button
          onClick={() => navigate('/book-ride')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 font-medium"
        >
          <FiPlus className="w-5 h-5" />
          Book New Ride
        </button>
      </div>

      {/* Upcoming Rides Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            Upcoming Booked Rides
          </h3>
        </div>
        
        {ridesLoading ? (
          <LoadingSpinner />
        ) : fetchRidesError ? (
          <ErrorMessage message={fetchRidesError} />
        ) : upcomingRides.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚗</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No upcoming rides</h4>
            <p className="text-gray-600">You don't have any rides scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingRides.map((ride: Ride) => (
              <div key={ride._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ride.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </span>
                    {ride.isPrivate && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        Private
                      </span>
                    )}
                    {ride.status === 'pending' && (
                      <button
                        onClick={() => handleDeleteRide(ride._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Ride"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600">Date & Time</p>
                      <p className="text-base text-gray-900">
                        {formatDate(getNextDayDate(ride.date))} at {convertTo12Hour(ride.time)}
                      </p>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                      
                      <div className="relative mb-6">
                        <div className="absolute -left-8 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pickup</p>
                          <p className="text-base text-gray-900">{ride.pickupLocation}</p>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-8 w-6 h-6 rounded-full bg-purple-100 border-2 border-purple-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Drop-off</p>
                          <p className="text-base text-gray-900">{ride.dropLocation}</p>
                        </div>
                      </div>
                    </div>

                    {ride.driver && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Driver Details</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                              <span className="text-lg">🚘</span>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Rides Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            Recent Completed Rides
          </h3>
          <button
            onClick={() => navigate('/ride-history')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium group flex items-center gap-1"
          >
            View All
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        {ridesLoading ? (
          <LoadingSpinner />
        ) : fetchRidesError ? (
          <ErrorMessage message={fetchRidesError} />
        ) : completedRides.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No completed rides</h4>
            <p className="text-gray-600">You haven't completed any rides yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedRides.slice(0, 3).map((ride: Ride) => (
              <div key={ride._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                <RideCard 
                  ride={ride}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  // Add edit mode state
  const [isEditingDriver, setIsEditingDriver] = useState(false);

  // Add this function to handle form changes
  const handleDriverFormChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'vehicle') {
        setDriverFormData(prev => ({
          ...prev,
          vehicle: {
            ...prev.vehicle,
            [child]: value
          }
        }));
      }
    } else {
      setDriverFormData(prev => ({
        ...prev,
        [field]: value
      } as DriverEditForm));
    }
  };

  // Add this function to handle form submission
  const handleDriverFormSubmit = async () => {
    try {
      await api.updateDriverInfo(driverFormData);
      setIsEditingDriver(false);
      await fetchDriverInfo(); // Refresh driver info
    } catch (error) {
      console.error('Error updating driver info:', error);
    }
  };

  // Update this function to properly initialize form data with existing info
  const handleEditClick = () => {
    if (driverInfo) {
      setDriverFormData({
        phone: driverInfo.phone || '',
        vehicle: {
          make: driverInfo.vehicle?.make || '',
          model: driverInfo.vehicle?.model || '',
          color: driverInfo.vehicle?.color || '',
          plateNumber: driverInfo.vehicle?.plateNumber || ''
        }
      });
    }
    setIsEditingDriver(true);
  };

  const renderDriverDashboard = () => (
    <div className="space-y-6">
      {/* Driver Info Section */}
      {driverInfo && (
        <section className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-white">Driver Information</h2>
            {!isEditingDriver && (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-white/20 backdrop-blur-lg text-white hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Info
              </button>
            )}
          </div>
          
          {isEditingDriver ? (
            <div className="space-y-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={driverFormData.phone}
                    onChange={(e) => handleDriverFormChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-white/20 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 placeholder-white/50"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white/90 mb-3">Vehicle Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['make', 'model', 'color', 'plateNumber'] as VehicleField[]).map((field) => (
                    <input
                      key={field}
                      type="text"
                      value={driverFormData.vehicle[field]}
                      onChange={(e) => handleDriverFormChange(`vehicle.${field}`, e.target.value)}
                      className="px-3 py-2 bg-white/20 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 placeholder-white/50"
                      placeholder={`Vehicle ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setIsEditingDriver(false)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDriverFormSubmit}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors font-medium w-full sm:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-white">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <p className="text-sm font-medium text-white/80">Phone</p>
                <p className="text-lg break-all">{driverInfo.phone || 'Not provided'}</p>
              </div>
              {driverInfo.vehicle && (
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                  <p className="text-sm font-medium text-white/80">Vehicle Details</p>
                  <p className="text-lg break-words">
                    {driverInfo.vehicle.color} {driverInfo.vehicle.make} {driverInfo.vehicle.model}
                  </p>
                  <p className="text-md text-white/90 break-all">Plate: {driverInfo.vehicle.plateNumber}</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Assigned Rides Section */}
      <section className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900">Your Assigned Rides</h2>
          <div className="flex flex-wrap gap-2">
            {['confirmed', 'completed', 'cancelled'].map((status) => (
              <span
                key={status}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {loadingRides ? (
          <LoadingSpinner />
        ) : ridesError ? (
          <ErrorMessage message={ridesError} />
        ) : driverRides.length === 0 ? (
          <EmptyState 
            message="No rides assigned"
            description="Check back later for new assignments"
            icon={<FiClock className="w-12 h-12 text-indigo-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {driverRides.map((ride: any) => (
              <div key={ride._id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                <RideCard 
                  ride={ride}
                  isDriverView={true}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Upcoming Booked Rides Section */}
      <section className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            Your Booked Rides
          </h2>
          <button
            onClick={() => navigate('/book-ride')}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Book New Ride
          </button>
        </div>

        {ridesLoading ? (
          <LoadingSpinner />
        ) : fetchRidesError ? (
          <ErrorMessage message={fetchRidesError} />
        ) : upcomingRides.length === 0 ? (
          <EmptyState 
            message="No upcoming rides"
            description="Book a ride to get started"
            icon={<div className="flex justify-center"><FiCalendar className="w-12 h-12 text-indigo-400" /></div>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingRides.map((ride: Ride) => (
              <div key={ride._id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                <RideCard 
                  ride={ride}
                  isDriverView={false}  // Show driver details for rides they've booked
                />
                {ride.status === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDeleteRide(ride._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel Ride"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderAdminDashboard = () => (
    <AdminDashboard 
      metrics={metrics}
      loading={metricsLoading}
      error={metricsError}
      rides={rides}
    />
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {!getStoredToken() ? (
        <LoadingSpinner />
      ) : (
        <>
          <Sidebar onLogout={handleLogout} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">
              {/* Welcome Message */}
              <header className="mb-8 mt-12 md:mt-0">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.displayName?.split(' ')[0]}!
                </h1>
                <p className="text-gray-500 mt-1">
                  Here's what's happening with your rides today.
                </p>
              </header>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex justify-between items-center animate-fade-in-out">
                  {successMessage}
                  <button 
                    onClick={() => setSuccessMessage(null)}
                    className="text-green-700 hover:text-green-900"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Role-specific Dashboard Content */}
              {userRoles.includes('admin') || isDeveloper() 
                ? renderAdminDashboard()
                : userRoles.includes('driver')
                ? renderDriverDashboard()
                : renderCustomerDashboard()
              }
            </div>
          </main>
        </>
      )}
    </div>
  );
} 