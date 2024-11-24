import { useState } from 'react';
import * as api from '../services/api';
import { FiMapPin, FiPhone } from 'react-icons/fi';

interface DriverRideCardProps {
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
    returnRide?: boolean;
    returnDate?: string;
    returnTime?: string;
    userEmail: string;
  };
  onUpdate: () => void;
}

export default function DriverRideCard({ ride, onUpdate }: DriverRideCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.updateRideStatus(ride._id, newStatus);
      onUpdate();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Date and Time Header */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
              {ride.status}
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

        {/* Passenger Details */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900">{ride.name}</h4>
          <div className="space-y-1 mt-1">
            <div className="flex items-center gap-2 text-gray-600">
              <FiPhone className="w-4 h-4" />
              <p className="text-sm">{ride.phone}</p>
            </div>
            <p className="text-sm text-gray-600">{ride.userEmail}</p>
          </div>
        </div>

        {/* Ride Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FiMapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Pickup</p>
              <p className="text-sm text-gray-600">{ride.pickupLocation}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FiMapPin className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Drop-off</p>
              <p className="text-sm text-gray-600">{ride.dropLocation}</p>
            </div>
          </div>

          {ride.notes && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Notes</p>
              <p className="text-sm text-gray-600 mt-1">{ride.notes}</p>
            </div>
          )}
        </div>

        {/* Status Update Button */}
        {ride.status === 'confirmed' && (
          <div className="mt-6">
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Mark as Completed'}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 