import { useState } from 'react';
import * as api from '../services/api';

interface AdminRideCardProps {
  ride: {
    _id: string;
    name: string;
    phone: string;
    pickupLocation: string;
    dropLocation: string;
    date: string;
    time: string;
    isPrivate: boolean;
    notes?: string;
    status: string;
    driverId?: string;
    driver?: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      isAvailable: boolean;
      vehicle?: {
        color: string;
        make: string;
        model: string;
        plateNumber: string;
      };
    };
    returnRide?: boolean;
    returnDate?: string;
    returnTime?: string;
    userEmail: string;
  };
  drivers: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    isAvailable: boolean;
    vehicle?: {
      color: string;
      make: string;
      model: string;
      plateNumber: string;
    };
  }>;
  onUpdate: () => void;
}

export default function AdminRideCard({ ride, drivers, onUpdate }: AdminRideCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState(ride.driverId || '');
  const [status, setStatus] = useState(ride.status);

  const availableDrivers = drivers.filter(driver => 
    (driver.isAvailable || driver._id === ride.driverId)
  );

  const handleApiOperation = async (operation: () => Promise<void>, errorMessage: string) => {
    try {
      setLoading(true);
      setError(null);
      await operation();
      onUpdate();
    } catch (error: any) {
      setError(error.message || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = () => {
    if (!selectedDriver) return;
    handleApiOperation(
      () => api.assignDriver(ride._id, selectedDriver),
      'Failed to assign driver'
    );
  };

  const handleRemoveDriver = () => {
    if (!window.confirm('Are you sure you want to remove the assigned driver?')) {
      return;
    }
    handleApiOperation(
      () => api.assignDriver(ride._id, ''),
      'Failed to remove driver'
    );
  };

  const handleStatusChange = (newStatus: string) => {
    handleApiOperation(
      async () => {
        await api.updateRideStatus(ride._id, newStatus);
        setStatus(newStatus);
      },
      'Failed to update status'
    );
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this ride?')) return;
    handleApiOperation(
      () => api.deleteRide(ride._id),
      'Failed to delete ride'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      return time;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Add timezone offset to get the correct local date
      const date = new Date(dateString);
      const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      
      return localDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        {/* Date and Time Header */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
            {ride.isPrivate && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Private
              </span>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">
              {formatDate(ride.date)}
            </h3>
            <p className="text-lg font-semibold text-indigo-600 mt-1">
              {formatTime(ride.time)}
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900">{ride.name}</h4>
          <div className="space-y-1 mt-1">
            <p className="text-sm text-gray-600">{ride.phone}</p>
            <p className="text-sm text-gray-600">{ride.userEmail}</p>
          </div>
        </div>

        {/* Ride Details */}
        <div className="space-y-4">
          <div>
            <div className="flex items-start gap-3">
              <div className="mt-1">🔵</div>
              <div>
                <p className="text-sm font-medium text-gray-700">Pickup</p>
                <p className="text-sm text-gray-600">{ride.pickupLocation}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start gap-3">
              <div className="mt-1">📍</div>
              <div>
                <p className="text-sm font-medium text-gray-700">Drop-off</p>
                <p className="text-sm text-gray-600">{ride.dropLocation}</p>
              </div>
            </div>
          </div>

          {ride.notes && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Notes</p>
              <p className="text-sm text-gray-600 mt-1">{ride.notes}</p>
            </div>
          )}

          {/* Return Ride Details */}
          {ride.returnRide && ride.returnDate && ride.returnTime && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Return Journey</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">🔵</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pickup</p>
                    <p className="text-sm text-gray-600">{ride.dropLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1">📍</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Drop-off</p>
                    <p className="text-sm text-gray-600">{ride.pickupLocation}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Date: </span>{formatDate(ride.returnDate)}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Time: </span>{formatTime(ride.returnTime)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Driver</option>
                {availableDrivers.map(driver => (
                  <option 
                    key={driver._id} 
                    value={driver._id}
                    className={!driver.isAvailable && driver._id !== ride.driverId ? 'text-gray-400' : ''}
                  >
                    {driver.name} ({driver.email})
                    {!driver.isAvailable && driver._id === ride.driverId ? ' (Currently Assigned)' : ''}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleAssignDriver}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign Driver'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {ride.driverId && ride.status !== 'completed' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                    >
                      Edit Driver
                    </button>
                    <button
                      onClick={handleRemoveDriver}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      disabled={loading}
                    >
                      Remove Driver
                    </button>
                  </div>
                ) : !ride.driverId && ride.status !== 'completed' ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Assign Driver
                  </button>
                ) : null}
                
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>

              {/* Show driver info regardless of ride status */}
              {ride.driver && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {ride.status === 'completed' ? 'Completed by' : 'Assigned Driver'}
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🚘</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ride.driver.name}</p>
                      <p className="text-sm text-gray-500">{ride.driver.email}</p>
                      <p className="text-sm text-gray-500">{ride.driver.phone}</p>
                      {ride.driver.vehicle && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-500">
                            Vehicle: {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                          </p>
                          <p className="text-sm text-gray-500">
                            Color: {ride.driver.vehicle.color}
                          </p>
                          <p className="text-sm text-gray-500">
                            Plate Number: {ride.driver.vehicle.plateNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {availableDrivers.length === 0 && (
            <p className="mt-2 text-sm text-yellow-600">
              No available drivers at the moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 