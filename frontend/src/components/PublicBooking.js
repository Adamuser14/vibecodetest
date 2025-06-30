import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Car, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  CheckCircle,
  Star,
  Users,
  Fuel,
  Settings,
  Shield
} from 'lucide-react';

const PublicBooking = () => {
  const { agencyId } = useParams();
  const [agency, setAgency] = useState(null);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchAgencyData();
  }, [agencyId]);

  const fetchAgencyData = async () => {
    try {
      const response = await axios.get(`/api/public/agencies/${agencyId}/cars`);
      setAgency(response.data.agency);
      setCars(response.data.cars);
    } catch (error) {
      console.error('Error fetching agency data:', error);
      setError('Agency not found or unavailable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agency Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-50 p-3 rounded-lg">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{agency?.name}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{agency?.address}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-1">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">{agency?.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">{agency?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Rent Your Perfect Car
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our premium fleet of vehicles. All cars are sanitized, insured, and ready for your journey.
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <CarCard 
              key={car.car_id} 
              car={car}
              onSelect={() => {
                setSelectedCar(car);
                setShowBookingForm(true);
              }}
            />
          ))}
        </div>

        {cars.length === 0 && (
          <div className="text-center py-16">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Cars Available</h3>
            <p className="text-gray-600">
              This agency doesn't have any cars available for booking at the moment.
            </p>
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedCar && (
          <BookingModal 
            car={selectedCar}
            agency={agency}
            onClose={() => {
              setShowBookingForm(false);
              setSelectedCar(null);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 {agency?.name}. All rights reserved.</p>
            <p className="mt-2 text-sm">Powered by Car Rental SaaS</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const CarCard = ({ car, onSelect }) => {
  return (
    <div className="bg-white rounded-lg card-shadow card-shadow-hover overflow-hidden">
      {/* Car Image Placeholder */}
      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex items-center justify-center h-48">
          <Car className="h-16 w-16 text-gray-400" />
        </div>
      </div>
      
      {/* Car Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{car.title}</h3>
            <p className="text-gray-600">{car.brand} {car.model} • {car.year}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${car.price_per_day}</div>
            <div className="text-sm text-gray-500">per day</div>
          </div>
        </div>

        {/* Car Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>4-5 seats</span>
          </div>
          <div className="flex items-center">
            <Fuel className="h-4 w-4 mr-2" />
            <span>Fuel Efficient</span>
          </div>
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            <span>{car.features?.includes('Automatic') ? 'Automatic' : 'Manual'}</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span>Insured</span>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {car.features?.slice(0, 4).map((feature, index) => (
              <span key={index} className="px-2 py-1 bg-primary-50 text-primary text-xs rounded-full">
                {feature}
              </span>
            ))}
            {car.features?.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{car.features.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={onSelect}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-600 font-medium transition-colors"
        >
          Book This Car
        </button>
      </div>
    </div>
  );
};

const BookingModal = ({ car, agency, onClose }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    pickup_date: new Date(),
    return_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    pickup_location: '',
    return_location: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const calculateDays = () => {
    const pickupDate = new Date(formData.pickup_date);
    const returnDate = new Date(formData.return_date);
    const diffTime = Math.abs(returnDate - pickupDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalAmount = calculateDays() * car.price_per_day;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        car_id: car.car_id,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        pickup_date: formData.pickup_date.toISOString(),
        return_date: formData.return_date.toISOString(),
        pickup_location: formData.pickup_location,
        return_location: formData.return_location,
        message: formData.message
      };

      await axios.post('/api/public/bookings', bookingData);
      setSuccess(true);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 w-full max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your booking request has been submitted successfully. The agency will contact you shortly to confirm the details.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Car:</span>
                <span>{car.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{calculateDays()} days</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total:</span>
                <span>${totalAmount}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Book {car.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                  placeholder="Enter your email"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Rental Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Date *
                </label>
                <DatePicker
                  selected={formData.pickup_date}
                  onChange={(date) => setFormData({ ...formData, pickup_date: date })}
                  minDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date *
                </label>
                <DatePicker
                  selected={formData.return_date}
                  onChange={(date) => setFormData({ ...formData, return_date: date })}
                  minDate={formData.pickup_date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
            </div>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup & Return Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickup_location}
                  onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                  placeholder="Enter pickup address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.return_location}
                  onChange={(e) => setFormData({ ...formData, return_location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                  placeholder="Enter return address"
                />
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
              placeholder="Any special requests or additional information..."
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Car:</span>
                <span className="text-gray-900">{car.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per day:</span>
                <span className="text-gray-900">${car.price_per_day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="text-gray-900">{calculateDays()} days</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary">${totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicBooking;