import { convertTo12Hour } from '../utils/dateUtils';
import { FiCheckCircle } from 'react-icons/fi';

interface RideCardProps {
  ride: {
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
  };
  onStatusUpdate?: (rideId: string, status: string) => void;
  onStatusChange: (rideId: string) => void;
}

// Add type for valid status values
type RideStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Add interface for status class mapping
interface StatusClassMap {
  pending: string;
  confirmed: string;
  completed: string;
  cancelled: string;
}

// Define the status class mapping with proper typing
const statusClasses: StatusClassMap = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

const LocationDisplay = ({ 
  type, 
  location 
}: { 
  type: 'pickup' | 'dropoff',
  location: string 
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{type === 'pickup' ? '🔵' : '📍'}</div>
    <div>
      <p className="text-sm font-medium text-gray-700">
        {type === 'pickup' ? 'Pickup' : 'Drop-off'}
      </p>
      <p className="text-sm text-gray-600">{location}</p>
    </div>
  </div>
);

const formatDate = (dateString: string) => {
  try {
    // Create a date object and adjust for timezone
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    
    // Get day with ordinal suffix
    const day = localDate.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - day % 10 !== 10 ? day % 10 : 0)];
    
    // Format the date
    return `${day}${suffix} ${localDate.toLocaleDateString('en-US', { 
      month: 'long',
      year: 'numeric'
    })}`;
  } catch (error) {
    return dateString;
  }
};

export default function RideCard({ ride, onStatusChange }: RideCardProps) {
  // Type guard to ensure status is valid
  const getStatusClass = (status: string): string => {
    if (isValidStatus(status)) {
      return statusClasses[status];
    }
    return statusClasses.pending; // default fallback
  };

  // Type guard function
  const isValidStatus = (status: string): status is RideStatus => {
    return status in statusClasses;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(ride.status)}`}>
                {ride.status}
              </span>
              {ride.isPrivate && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Private
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {formatDate(ride.date)}
            </h3>
            <p className="text-sm text-gray-500">
              {convertTo12Hour(ride.time)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <LocationDisplay type="pickup" location={ride.pickupLocation} />
          <LocationDisplay type="dropoff" location={ride.dropLocation} />
        </div>

        {ride.driver && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Driver Details</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ride.driver.name}</p>
                  <p className="text-sm text-gray-500">{ride.driver.phone}</p>
                </div>
              </div>
              {ride.driver.vehicle && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <p className="text-sm text-gray-600">
                    {ride.driver.vehicle.color} {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                  </p>
                  <p className="text-sm text-gray-500">
                    Plate: {ride.driver.vehicle.plateNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {ride.status === 'confirmed' && (
          <button
            onClick={() => onStatusChange(ride._id)}
            className="w-full px-4 py-2 mt-5 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <FiCheckCircle />
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  );
} 