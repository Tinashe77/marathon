// src/pages/RoutesManagement.jsx
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
      // In a real application, we would fetch from the API
      // const response = await axios.get('/routes');
      // setRoutes(response.data.data);
      
      // Mock data for demonstration
      const mockRoutes = [
        {
          _id: '1',
          name: 'Victoria Falls Half Marathon',
          description: 'Official half marathon route through the scenic Victoria Falls area',
          category: 'Half Marathon',
          distance: 21.0975,
          isActive: true,
          checkpoints: [
            { 
              name: 'Start',
              location: { type: 'Point', coordinates: [25.8522, -17.9251] },
              distanceFromStart: 0
            },
            { 
              name: '5KM Mark',
              location: { type: 'Point', coordinates: [25.8572, -17.9301] },
              distanceFromStart: 5
            },
            { 
              name: '10KM Mark',
              location: { type: 'Point', coordinates: [25.8622, -17.9351] },
              distanceFromStart: 10
            },
            { 
              name: '15KM Mark',
              location: { type: 'Point', coordinates: [25.8672, -17.9401] },
              distanceFromStart: 15
            },
            { 
              name: 'Finish',
              location: { type: 'Point', coordinates: [25.8522, -17.9251] },
              distanceFromStart: 21.0975
            }
          ],
          gpxFile: 'route_1.gpx',
          createdAt: '2023-04-10T08:00:00.000Z'
        },
        {
          _id: '2',
          name: 'Victoria Falls Full Marathon',
          description: 'Official full marathon route through the scenic Victoria Falls area and surrounding wilderness',
          category: 'Full Marathon',
          distance: 42.195,
          isActive: true,
          checkpoints: [
            { 
              name: 'Start',
              location: { type: 'Point', coordinates: [25.8522, -17.9251] },
              distanceFromStart: 0
            },
            { 
              name: '10KM Mark',
              location: { type: 'Point', coordinates: [25.8622, -17.9351] },
              distanceFromStart: 10
            },
            { 
              name: '21KM Mark',
              location: { type: 'Point', coordinates: [25.8722, -17.9451] },
              distanceFromStart: 21
            },
            { 
              name: '30KM Mark',
              location: { type: 'Point', coordinates: [25.8822, -17.9551] },
              distanceFromStart: 30
            },
            { 
              name: '40KM Mark',
              location: { type: 'Point', coordinates: [25.8922, -17.9651] },
              distanceFromStart: 40
            },
            { 
              name: 'Finish',
              location: { type: 'Point', coordinates: [25.8522, -17.9251] },
              distanceFromStart: 42.195
            }
          ],
          gpxFile: 'route_2.gpx',
          createdAt: '2023-04-10T09:00:00.000Z'
        },
        {
          _id: '3',
          name: 'Victoria Falls Fun Run',
          description: 'A beginner-friendly 5K route perfect for all ages',
          category: 'Fun Run',
          distance: 5,
          isActive: true,
          checkpoints: [
            { 
              name: 'Start',
              location: { type: 'Point', coordinates: [25.8522, -17.9251] },
              distanceFromStart: 0
            },
            { 
              name: '2.5KM Mark',
              location: { type: 'Point', coordinates: [25.8572, -17.9301] },
              distanceFromStart: 2.5
            },
            { 
              name: 'Finish',
              location: { type: 'Point', coordinates: [25.8522, -17.9251] },
              distanceFromStart: 5
            }
          ],
          gpxFile: 'route_3.gpx',
          createdAt: '2023-04-10T10:00:00.000Z'
        }
      ];
      
      setRoutes(mockRoutes);
      setError(null);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err.response?.data?.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (route = null) => {
    if (route) {
      setCurrentRoute(route);
      setFormData({
        name: route.name,
        description: route.description,
        category: route.category,
        distance: route.distance,
        isActive: route.isActive
      });
    } else {
      setCurrentRoute(null);
      setFormData({
        name: '',
        description: '',
        category: 'Half Marathon',
        distance: 0,
        isActive: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRoute(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // In a real application, we would submit to the API
      if (currentRoute) {
        // Update existing route
        // const response = await axios.put(`/routes/${currentRoute._id}`, formData);
        // Update the routes array with the updated route
        setRoutes(routes.map(route => 
          route._id === currentRoute._id ? { ...route, ...formData } : route
        ));
      } else {
        // Create new route
        // const response = await axios.post('/routes', formData);
        // Add the new route to the routes array
        const newRoute = {
          _id: `${routes.length + 1}`,
          ...formData,
          checkpoints: [],
          createdAt: new Date().toISOString()
        };
        setRoutes([...routes, newRoute]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error saving route:', err);
      setError(err.response?.data?.message || 'Failed to save route');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (routeId, isActive) => {
    try {
      // In a real application, we would call the API
      // await axios.put(`/routes/${routeId}/activate`, { isActive });
      
      // Update the routes array
      setRoutes(routes.map(route => 
        route._id === routeId ? { ...route, isActive } : route
      ));
    } catch (err) {
      console.error('Error activating route:', err);
      setError(err.response?.data?.message || 'Failed to activate route');
    }
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    
    try {
      // In a real application, we would call the API
      // await axios.delete(`/routes/${routeId}`);
      
      // Remove from the routes array
      setRoutes(routes.filter(route => route._id !== routeId));
    } catch (err) {
      console.error('Error deleting route:', err);
      setError(err.response?.data?.message || 'Failed to delete route');
    }
  };

  const handleFileUpload = async (routeId) => {
    if (!fileInputRef.current.files[0]) {
      alert('Please select a GPX file to upload');
      return;
    }
    
    try {
      setUploadLoading(true);
      
      // In a real application, we would upload the file to the API
      // const formData = new FormData();
      // formData.append('file', fileInputRef.current.files[0]);
      // const response = await axios.put(`/routes/${routeId}/upload`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      
      // Mock successful upload
      setTimeout(() => {
        // Update the routes array with updated checkpoints
        setRoutes(routes.map(route => {
          if (route._id === routeId) {
            return {
              ...route,
              gpxFile: `route_${routeId}_${Date.now()}.gpx`,
              // Add mock checkpoints if none exist
              checkpoints: route.checkpoints.length ? route.checkpoints : [
                { 
                  name: 'Start',
                  location: { type: 'Point', coordinates: [25.8522, -17.9251] },
                  distanceFromStart: 0
                },
                { 
                  name: 'Checkpoint 1',
                  location: { type: 'Point', coordinates: [25.8572, -17.9301] },
                  distanceFromStart: route.distance / 2
                },
                { 
                  name: 'Finish',
                  location: { type: 'Point', coordinates: [25.8522, -17.9251] },
                  distanceFromStart: route.distance
                }
              ]
            };
          }
          return route;
        }));
        setUploadLoading(false);
        alert('GPX file uploaded successfully!');
        fileInputRef.current.value = '';
      }, 1500);
      
    } catch (err) {
      console.error('Error uploading GPX file:', err);
      setError(err.response?.data?.message || 'Failed to upload GPX file');
      setUploadLoading(false);
    }
  };

  const RouteModal = () => (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentRoute ? 'Edit Route' : 'Create New Route'}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Route Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="Half Marathon">Half Marathon</option>
                        <option value="Full Marathon">Full Marathon</option>
                        <option value="Fun Run">Fun Run</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        name="distance"
                        id="distance"
                        min="0"
                        step="0.01"
                        value={formData.distance}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Active Route
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {currentRoute ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Routes</h1>
          <p className="mt-1 text-sm text-gray-500">Manage marathon routes and courses</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Route
        </button>
      </div>

      {/* Routes Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <div key={route._id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{route.name}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    route.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {route.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{route.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Category:</span>
                  <span className="ml-2">{route.category}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Distance:</span>
                  <span className="ml-2">{route.distance} km</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Checkpoints:</span>
                  <span className="ml-2">{route.checkpoints?.length || 0}</span>
                </div>
                {route.gpxFile && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">GPX File:</span>
                    <span className="ml-2">{route.gpxFile}</span>
                  </div>
                )}
              </div>
              
              {/* Checkpoints preview */}
              {route.checkpoints && route.checkpoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Checkpoints</h4>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <ul className="divide-y divide-gray-200">
                      {route.checkpoints.map((checkpoint, idx) => (
                        <li key={idx} className="py-2">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{checkpoint.name}</span>
                            <span className="ml-auto text-xs text-gray-500">{checkpoint.distanceFromStart} km</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => openModal(route)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="h-4 w-4 mr-1" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleActivate(route._id, !route.isActive)}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                    route.isActive
                      ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {route.isActive ? (
                    <>
                      <XCircleIcon className="h-4 w-4 mr-1" /> Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-1" /> Activate
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(route._id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1" /> Delete
                </button>
              </div>
              
              {/* GPX Upload */}
              <div className="mt-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".gpx"
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleFileUpload(route._id)}
                    disabled={uploadLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ArrowUpTrayIcon className="h-4 w-4 mr-1" /> Upload GPX
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for create/edit */}
      {isModalOpen && <RouteModal />}
    </div>
  );
}