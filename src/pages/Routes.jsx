// src/pages/Routes.jsx - Simplified version focusing on API issues

import { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { 
  PlusIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import Error from '../components/Error';

export default function RoutesManagement() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Half Marathon',
    distance: 0,
    isActive: false
  });
  const fileInputRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/routes');
      
      if (response.data?.success) {
        setRoutes(response.data.data || []);
        setError(null);
      } else {
        throw new Error(response.data?.error || 'Invalid API response format');
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch routes');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (route = null) => {
    setCurrentRoute(route);
    setFormData({
      name: route?.name || '',
      description: route?.description || '',
      category: route?.category || 'Half Marathon',
      distance: route?.distance || 0,
      isActive: route?.isActive || false
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRoute(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Create a clean object for the API without any extra fields
      const routeData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        distance: parseFloat(formData.distance),
        isActive: formData.isActive
      };

      console.log("Sending route data:", routeData);

      let response;
      if (currentRoute) {
        // Update existing route
        response = await axios.put(`/routes/${currentRoute._id}`, routeData);
      } else {
        // Create new route
        response = await axios.post('/routes', routeData);
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Invalid API response');
      }

      const updatedRoute = response.data.data;
      
      // Update routes state
      setRoutes(prev => 
        currentRoute
          ? prev.map(r => r._id === updatedRoute._id ? updatedRoute : r)
          : [...prev, updatedRoute]
      );

      closeModal();
    } catch (err) {
      console.error('Error saving route:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save route');
    } finally {
      setLoading(false);
    }
  };

  // Fix for the file upload functionality

  const handleFileUpload = async (routeId) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('Please select a GPX file to upload');
      return;
    }
  
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      alert('Please select a GPX file');
      return;
    }
  
    try {
      setUploadLoading(true);
      
      // Create FormData for the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Get the token directly from localStorage to ensure we're using the latest
      const token = localStorage.getItem('token');
      
      console.log('Token available:', !!token);
      console.log('File being uploaded:', file.name, file.size, file.type);
      
      // Make the request with axios but with specific config
      const response = await axios({
        method: 'put',
        url: `/routes/${routeId}/upload`,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do not set Content-Type here - let it be set automatically
        }
      });
      
      console.log('Upload response:', response.data);
      
      if (response.data?.success) {
        // Update the route in the state
        setRoutes(prev => prev.map(route => 
          route._id === routeId ? response.data.data : route
        ));
        
        alert('GPX file uploaded successfully!');
        fileInputRef.current.value = '';
      } else {
        throw new Error(response.data?.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading GPX:', err);
      if (err.response) {
        console.error('Response error:', err.response.status, err.response.data);
      }
      
      let errorMessage = 'Failed to upload GPX file';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleActivate = async (routeId, isActive) => {
    try {
      const response = await axios.put(`/routes/${routeId}/activate`, { isActive });
      
      if (response.data?.success) {
        setRoutes(prev => prev.map(route => 
          route._id === routeId ? { ...route, isActive } : route
        ));
      } else {
        throw new Error(response.data?.error || 'Invalid activation response');
      }
    } catch (err) {
      console.error('Error activating route:', err);
      setError(err.response?.data?.error || err.message || 'Failed to activate route');
    }
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    
    try {
      const response = await axios.delete(`/routes/${routeId}`);
      
      if (response.data?.success) {
        setRoutes(prev => prev.filter(route => route._id !== routeId));
      } else {
        throw new Error(response.data?.error || 'Invalid delete response');
      }
    } catch (err) {
      console.error('Error deleting route:', err);
      setError(err.response?.data?.error || err.message || 'Failed to delete route');
    }
  };

  const RouteModal = () => (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {currentRoute ? 'Edit Route' : 'Create New Route'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="Half Marathon">Half Marathon</option>
                    <option value="Full Marathon">Full Marathon</option>
                    <option value="Fun Run">Fun Run</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                  <input
                    type="number"
                    name="distance"
                    min="0"
                    step="0.01"
                    value={formData.distance}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Route</label>
                </div>

                {/* File upload is removed from the create/edit form since it's a separate API call */}
                {/* Instead, we just show a note about uploading after creation */}
                <div className="text-sm text-gray-500 italic">
                  Note: GPX files can be uploaded after the route is created
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : currentRoute ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (loading && routes.length === 0) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchRoutes} />;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Routes</h1>
          <p className="mt-1 text-sm text-gray-500">Manage marathon routes and courses</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Route
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map(route => (
          <div key={route._id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{route.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  route.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {route.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <p className="mt-1 text-sm text-gray-500">{route.description}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex text-sm text-gray-500">
                  <span className="font-medium mr-2">Category:</span>
                  <span>{route.category}</span>
                </div>
                <div className="flex text-sm text-gray-500">
                  <span className="font-medium mr-2">Distance:</span>
                  <span>{route.distance} km</span>
                </div>
                <div className="flex text-sm text-gray-500">
                  <span className="font-medium mr-2">Checkpoints:</span>
                  <span>{route.checkpoints?.length || 0}</span>
                </div>
                {route.gpxFile && (
                  <div className="flex text-sm text-gray-500">
                    <span className="font-medium mr-2">GPX File:</span>
                    <span>{route.gpxFile}</span>
                  </div>
                )}
              </div>

              {route.checkpoints?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Checkpoints</h4>
                  <ul className="mt-2 divide-y divide-gray-200 max-h-40 overflow-y-auto">
                    {route.checkpoints.map((cp, i) => (
                      <li key={i} className="py-2">
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{cp.name}</span>
                          <span className="ml-auto text-xs text-gray-500">{cp.distanceFromStart} km</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(route)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="h-4 w-4 mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleActivate(route._id, !route.isActive)}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${
                    route.isActive ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {route.isActive ? (
                    <><XCircleIcon className="h-4 w-4 mr-1" /> Deactivate</>
                  ) : (
                    <><CheckCircleIcon className="h-4 w-4 mr-1" /> Activate</>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(route._id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1" /> Delete
                </button>
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".gpx"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <button
                  onClick={() => handleFileUpload(route._id)}
                  disabled={uploadLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    <><ArrowUpTrayIcon className="h-4 w-4 mr-1" /> Upload GPX</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && <RouteModal />}
    </div>
  );
}
