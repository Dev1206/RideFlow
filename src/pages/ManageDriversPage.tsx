import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { EmptyState } from '../components/shared/EmptyState';
import { useAsyncData } from '../hooks/useAsyncData';
import * as api from '../services/api';
import { FiSearch, FiEdit2, FiTrash2, FiPhone, FiMail, FiTruck, FiToggleLeft, FiToggleRight, FiCheck } from 'react-icons/fi';

interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plateNumber: string;
  };
  isAvailable: boolean;
}

interface EditingDriver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plateNumber: string;
  };
  isAvailable: boolean;
}

export default function ManageDriversPage() {
  const { signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDriver, setEditingDriver] = useState<EditingDriver | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  
  const { 
    data: drivers = [], 
    loading, 
    error, 
    refetch: refetchDrivers
  } = useAsyncData(() => api.getDrivers(), []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this driver?')) {
        return;
      }

      setIsDeleting(true);
      setDeleteError(null);
      
      await api.deleteDriver(driverId);
      
      await refetchDrivers();
      
      setDeleteConfirmation('Driver deleted successfully');
      setTimeout(() => setDeleteConfirmation(null), 3000);
      
    } catch (err: any) {
      let errorMessage = 'Error deleting driver';
      
      if (err.message.includes('not found')) {
        errorMessage = 'Driver not found or already deleted. The list will be refreshed.';
        await refetchDrivers();
      } else if (err.message.includes('permission')) {
        errorMessage = 'You do not have permission to delete this driver';
      } else {
        errorMessage = err.message || 'Error deleting driver';
      }
      
      setDeleteError(errorMessage);
      console.error('Error deleting driver:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (driver: any) => {
    try {
      const updatedDriver = {
        ...driver,
        isAvailable: !driver.isAvailable
      };
      await api.updateDriver(driver._id, updatedDriver);
      await refetchDrivers();
    } catch (error) {
      console.error('Error updating driver availability:', error);
    }
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver({
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      vehicle: driver.vehicle,
      isAvailable: driver.isAvailable
    });
  };

  const handleCancelEdit = () => {
    setEditingDriver(null);
  };

  const handleSaveEdit = async () => {
    if (!editingDriver) return;
    
    try {
      await api.updateDriver(editingDriver._id, editingDriver);
      setEditingDriver(null);
      refetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  };

  const handleDriverFieldChange = (field: keyof Omit<EditingDriver, 'vehicle' | '_id' | 'isAvailable'>, value: string) => {
    if (!editingDriver) return;
    
    setEditingDriver({
      ...editingDriver,
      [field]: value
    });
  };

  const handleVehicleFieldChange = (field: keyof EditingDriver['vehicle'], value: string) => {
    if (!editingDriver) return;
    
    setEditingDriver({
      ...editingDriver,
      vehicle: {
        ...editingDriver.vehicle,
        [field]: value
      }
    });
  };

  const filteredDrivers = drivers.filter((driver: Driver) =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {deleteError && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                <FiTrash2 className="w-5 h-5" />
                {deleteError}
              </div>
            )}
            
            {deleteConfirmation && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">
                <FiCheck className="w-5 h-5" />
                {deleteConfirmation}
              </div>
            )}

            <header className="mb-8 mt-12 md:mt-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Manage Drivers
              </h1>
              <p className="text-gray-500 mt-2">Manage and monitor your driver fleet</p>
            </header>

            <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search drivers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredDrivers.length === 0 ? (
              <EmptyState
                message="No drivers found"
                description="No drivers match your search criteria"
                icon={<FiTruck className="w-12 h-12 text-gray-400 mx-auto" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDrivers.map((driver: Driver) => (
                  <div key={driver._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {editingDriver?._id === driver._id ? (
                      // Edit Mode
                      <div className="p-6 space-y-4">
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editingDriver?.name || ''}
                            onChange={(e) => handleDriverFieldChange('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Name"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="email"
                                value={editingDriver?.email || ''}
                                onChange={(e) => handleDriverFieldChange('email', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Email"
                              />
                            </div>
                            <div className="relative">
                              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="tel"
                                value={editingDriver?.phone || ''}
                                onChange={(e) => handleDriverFieldChange('phone', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Phone"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FiTruck className="w-4 h-4 text-indigo-500" />
                            Vehicle Details
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {['make', 'model', 'color', 'plateNumber'].map((field) => (
                              <input
                                key={field}
                                type="text"
                                value={editingDriver?.vehicle[field as keyof EditingDriver['vehicle']] || ''}
                                onChange={(e) => handleVehicleFieldChange(field as keyof EditingDriver['vehicle'], e.target.value)}
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">{driver.name}</span>
                            <button
                              onClick={() => handleToggleAvailability(driver)}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors
                                ${driver.isAvailable 
                                  ? 'bg-green-400/20 text-white' 
                                  : 'bg-red-400/20 text-white'
                                }`}
                            >
                              {driver.isAvailable ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                              {driver.isAvailable ? 'Available' : 'Unavailable'}
                            </button>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiMail className="w-4 h-4 text-indigo-500" />
                              <span>{driver.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiPhone className="w-4 h-4 text-indigo-500" />
                              <span>{driver.phone || 'No phone number'}</span>
                            </div>
                          </div>

                          {driver.vehicle && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FiTruck className="w-4 h-4 text-indigo-500" />
                                <span className="font-medium text-gray-900">Vehicle Details</span>
                              </div>
                              <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Make:</span>
                                  <span className="ml-2 text-gray-900">{driver.vehicle.make || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Model:</span>
                                  <span className="ml-2 text-gray-900">{driver.vehicle.model || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Color:</span>
                                  <span className="ml-2 text-gray-900">{driver.vehicle.color || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Plate:</span>
                                  <span className="ml-2 text-gray-900">{driver.vehicle.plateNumber || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                              onClick={() => handleEditClick(driver)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(driver._id)}
                              disabled={isDeleting}
                              className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Delete"
                            >
                              {isDeleting ? (
                                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiTrash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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