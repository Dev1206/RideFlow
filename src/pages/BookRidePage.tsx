import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import * as api from '../services/api';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiPhone, FiFileText, FiLock, FiArrowLeft } from 'react-icons/fi';
import LocationAutocomplete from '../components/LocationAutocomplete';
import GoogleMapsWrapper from '../components/GoogleMapsWrapper';

interface Coordinates {
  lat: number;
  lng: number;
}

export default function BookRidePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [returnRide, setReturnRide] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickupLocation: '',
    dropLocation: '',
    date: '',
    time: '',
    notes: '',
    returnDate: '',
    returnTime: '',
    pickupCoordinates: undefined,
    dropCoordinates: undefined,
  });

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createRide({
        ...formData,
        isPrivate,
        returnRide,
        returnDate: returnRide ? formData.returnDate : undefined,
        returnTime: returnRide ? formData.returnTime : undefined
      });

      navigate('/dashboard', { 
        state: { message: 'Ride booked successfully!' }
      });
    } catch (error: any) {
      setError(error.message || 'Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (field: 'pickupLocation' | 'dropLocation', value: string, coordinates?: Coordinates) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      [`${field.replace('Location', 'Coordinates')}`]: coordinates
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group"
              >
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Book a New Ride
              </h1>
              <p className="text-gray-500 mt-2">Fill in the details to book your ride</p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-indigo-500" />
                  Personal Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ride Details Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-indigo-500" />
                  Ride Details
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <GoogleMapsWrapper>
                        <LocationAutocomplete
                          label="Pickup Location"
                          value={formData.pickupLocation}
                          onChange={(value, coordinates) => handleLocationChange('pickupLocation', value, coordinates)}
                          required
                          placeholder="Enter pickup location"
                        />
                      </GoogleMapsWrapper>
                    </div>

                    <div>
                      <GoogleMapsWrapper>
                        <LocationAutocomplete
                          label="Drop-off Location"
                          value={formData.dropLocation}
                          onChange={(value, coordinates) => handleLocationChange('dropLocation', value, coordinates)}
                          required
                          placeholder="Enter drop-off location"
                        />
                      </GoogleMapsWrapper>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <div className="relative">
                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Journey Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-indigo-500" />
                    Return Journey
                  </h2>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={returnRide}
                      onChange={(e) => setReturnRide(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {returnRide && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          required
                          value={formData.returnDate}
                          onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                          min={formData.date || new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Time</label>
                      <div className="relative">
                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          required
                          value={formData.returnTime}
                          onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Options */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <FiFileText className="w-4 h-4 text-indigo-500" />
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Any special requirements or notes"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <FiLock className="w-4 h-4 text-indigo-500" />
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Make this a private ride
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {loading ? 'Booking...' : 'Book Ride'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 