import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Car, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Plus,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  ExternalLink
} from 'lucide-react';

const AgencyDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: BarChart3 },
    { name: 'Fleet', href: '/dashboard/fleet', icon: Car },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Staff', href: '/dashboard/staff', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href) => {
    if (href === '/dashboard' && location.pathname === '/dashboard') return true;
    if (href !== '/dashboard' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white sidebar-shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-primary-50 p-2 rounded-lg">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Car Rental</h1>
              <p className="text-sm text-gray-500">Agency Dashboard</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary border-r-2 border-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-full h-10 w-10 flex items-center justify-center">
                <span className="text-primary font-medium text-sm">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<AgencyOverview />} />
          <Route path="/fleet" element={<FleetManagement />} />
          <Route path="/bookings" element={<BookingsManagement />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/settings" element={<AgencySettings />} />
        </Routes>
      </div>
    </div>
  );
};

const AgencyOverview = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsResponse, bookingsResponse] = await Promise.all([
        axios.get(`/api/agency/${user.agency_id}/cars`),
        axios.get(`/api/agency/${user.agency_id}/bookings`)
      ]);
      
      setCars(carsResponse.data.cars);
      setBookings(bookingsResponse.data.bookings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todayBookings = bookings.filter(booking => 
    new Date(booking.pickup_date).toDateString() === new Date().toDateString()
  );

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's your rental business summary.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg card-shadow">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Fleet</p>
              <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Pickups</p>
              <p className="text-2xl font-bold text-gray-900">{todayBookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow">
          <div className="flex items-center">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Link */}
      <div className="bg-white rounded-lg card-shadow mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Public Booking Link</h2>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Share this link with your customers:</p>
              <p className="text-primary font-medium break-all">
                {window.location.origin}/booking/{user.agency_id}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/booking/${user.agency_id}`);
                // You could add a toast notification here
              }}
              className="ml-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg card-shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.slice(0, 5).map((booking) => {
                const car = cars.find(c => c.car_id === booking.car_id);
                return (
                  <tr key={booking.booking_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.client_name}</div>
                        <div className="text-sm text-gray-500">{booking.client_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{car?.title || 'Unknown Car'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.pickup_date).toLocaleDateString()} - {new Date(booking.return_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.total_amount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {bookings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bookings yet. Share your booking link to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FleetManagement = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`/api/agency/${user.agency_id}/cars`);
      setCars(response.data.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">Manage your car inventory and availability.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Car
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car.car_id} className="bg-white rounded-lg card-shadow card-shadow-hover">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg">
              <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg">
                <Car className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
                  <p className="text-gray-600">{car.brand} {car.model} ({car.year})</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plate Number:</span>
                  <span className="text-gray-900">{car.plate_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Color:</span>
                  <span className="text-gray-900">{car.color}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price per day:</span>
                  <span className="text-gray-900 font-semibold">${car.price_per_day}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {car.features?.slice(0, 3).map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {feature}
                  </span>
                ))}
                {car.features?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{car.features.length - 3} more
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  car.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {car.status}
                </span>
                <button className="text-primary hover:text-primary-600 text-sm font-medium flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cars.length === 0 && (
        <div className="bg-white rounded-lg card-shadow">
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cars in your fleet</h3>
            <p className="text-gray-500 mb-6">Add your first car to start accepting bookings.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Car
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <CreateCarModal 
          onClose={() => setShowCreateForm(false)} 
          onSuccess={() => {
            setShowCreateForm(false);
            fetchCars();
          }}
        />
      )}
    </div>
  );
};

const CreateCarModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    plate_number: '',
    color: '',
    price_per_day: '',
    features: [],
    agency_id: user.agency_id
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableFeatures = [
    'GPS', 'Automatic', 'Manual', 'Air Conditioning', 'Baby Seat',
    'Bluetooth', 'USB Charging', 'Backup Camera', 'Sunroof', 'Leather Seats'
  ];

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/agency/cars', {
        ...formData,
        price_per_day: parseFloat(formData.price_per_day),
        year: parseInt(formData.year)
      });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Car</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                placeholder="e.g., Toyota Camry Premium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                placeholder="e.g., Toyota"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                placeholder="e.g., Camry"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plate Number
              </label>
              <input
                type="text"
                required
                value={formData.plate_number}
                onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                placeholder="e.g., ABC-123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                placeholder="e.g., Black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day ($)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-focus"
                placeholder="e.g., 45.00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFeatures.map((feature) => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? 'Adding Car...' : 'Add Car'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookingsManagement = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsResponse, carsResponse] = await Promise.all([
        axios.get(`/api/agency/${user.agency_id}/bookings`),
        axios.get(`/api/agency/${user.agency_id}/cars`)
      ]);
      
      setBookings(bookingsResponse.data.bookings);
      setCars(carsResponse.data.cars);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600">Manage all customer bookings and reservations.</p>
      </div>

      <div className="bg-white rounded-lg card-shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => {
                const car = cars.find(c => c.car_id === booking.car_id);
                return (
                  <tr key={booking.booking_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.client_name}</div>
                        <div className="text-sm text-gray-500">{booking.client_email}</div>
                        <div className="text-sm text-gray-500">{booking.client_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {car?.title || 'Unknown Car'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {car?.brand} {car?.model}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Pickup: {new Date(booking.pickup_date).toLocaleDateString()}</div>
                        <div>Return: {new Date(booking.return_date).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>From: {booking.pickup_location}</div>
                        <div>To: {booking.return_location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary-600 mr-3">
                        View
                      </button>
                      {booking.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-700">
                          Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500">Your bookings will appear here once customers start making reservations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StaffManagement = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Staff Management</h1>
      <div className="bg-white rounded-lg card-shadow p-8 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Staff management features coming soon...</p>
      </div>
    </div>
  );
};

const AgencySettings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
      <div className="bg-white rounded-lg card-shadow p-8 text-center">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Settings panel coming soon...</p>
      </div>
    </div>
  );
};

// Fix for missing Clock import
const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default AgencyDashboard;