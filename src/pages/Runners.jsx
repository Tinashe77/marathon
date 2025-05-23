// src/pages/Runners.jsx
import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { listenToRunnerLocation, removeListeners } from '../utils/socket';

export default function Runners() {
  const [runners, setRunners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchRunners();

    // Listen for real-time runner location updates
    listenToRunnerLocation(updateRunnerLocation);
    
    // Clean up listeners when component unmounts
    return () => {
      removeListeners();
    };
  }, [pagination.page, filters]);

  const updateRunnerLocation = (data) => {
    // Update the runner's location in real-time
    setRunners(prevRunners => {
      return prevRunners.map(runner => {
        if (runner._id === data.runnerId || runner.runnerNumber === data.runnerNumber) {
          return {
            ...runner,
            lastKnownLocation: data.location,
            status: data.status || runner.status
          };
        }
        return runner;
      });
    });
  };

  const fetchRunners = async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;
      const { status, category, search } = filters;
      
      // Build query string
      let query = `?page=${page}&limit=${limit}`;
      if (status) query += `&status=${status}`;
      if (category) query += `&category=${category}`;
      if (search) query += `&search=${search}`;
      
      // Fetch runners from the API endpoint
      const response = await axios.get(`/runners${query}`);
      
      if (response.data?.success) {
        setRunners(response.data.data);
        
        // Set pagination data from API response
        setPagination({
          ...pagination,
          total: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / pagination.limit)
        });
        
        setError(null);
      } else {
        throw new Error(response.data?.error || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching runners:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch runners');
      setRunners([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 }); // Reset to first page when filter changes
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRunners(); // Explicitly fetch when form is submitted
  };

  const exportRunners = async () => {
    try {
      setExportLoading(true);
      
      // Use the specified endpoint for exporting runners
      const response = await axios.get('/runners/export', {
        responseType: 'blob' // Important for file download
      });
      
      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `runners-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting runners:', err);
      setError(err.response?.data?.error || err.message || 'Failed to export runners');
    } finally {
      setExportLoading(false);
    }
  };

  const updateRunnerStatus = async (runnerId, status, location = null) => {
    try {
      const data = { status };
      if (location) {
        data.lastKnownLocation = location;
      }
      
      // Use the API endpoint to update runner status
      const response = await axios.put(`/runners/${runnerId}`, data);
      
      if (response.data?.success) {
        // Update the runner in the local state
        setRunners(prevRunners => 
          prevRunners.map(runner => 
            runner._id === runnerId ? { ...runner, status, ...(location && { lastKnownLocation: location }) } : runner
          )
        );
      } else {
        throw new Error(response.data?.error || 'Failed to update runner status');
      }
    } catch (err) {
      console.error('Error updating runner status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update runner status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewRunnerDetails = async (runnerId) => {
    try {
      const response = await axios.get(`/runners/${runnerId}`);
      
      if (response.data?.success) {
        const runnerData = response.data.data;
        
        // Open a new window with runner details and map
        const detailWindow = window.open('', '_blank');
        detailWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Runner: ${runnerData.name}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.css" />
            <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.js"></script>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .container { max-width: 1000px; margin: 0 auto; }
              .header { margin-bottom: 20px; }
              .header h1 { color: #0891b2; margin-bottom: 5px; }
              .details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
              .info-section { margin-bottom: 30px; }
              .info-item { margin-bottom: 10px; }
              .info-label { font-weight: bold; color: #4b5563; }
              .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 600;
                margin-right: 4px;
              }
              .badge-blue { background-color: #dbeafe; color: #1e40af; }
              .badge-green { background-color: #d1fae5; color: #065f46; }
              .badge-purple { background-color: #ede9fe; color: #5b21b6; }
              .badge-gray { background-color: #f3f4f6; color: #1f2937; }
              #map { height: 400px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${runnerData.name}</h1>
                <div>Runner #${runnerData.runnerNumber}</div>
              </div>
              
              <div class="details">
                <div class="info-section">
                  <div class="info-item">
                    <div class="info-label">Status</div>
                    <div>
                      <span class="badge ${
                        runnerData.status === 'active' ? 'badge-green' : 
                        runnerData.status === 'registered' ? 'badge-blue' : 
                        runnerData.status === 'completed' ? 'badge-purple' : 'badge-gray'
                      }">
                        ${runnerData.status.charAt(0).toUpperCase() + runnerData.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">Categories</div>
                    <div>
                      ${runnerData.registeredCategories?.map(cat => 
                        `<span class="badge badge-blue">${cat}</span>`
                      ).join(' ') || 'None'}
                    </div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">Email</div>
                    <div>${runnerData.email || 'Not provided'}</div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div>${runnerData.phone || 'Not provided'}</div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">Registered On</div>
                    <div>${new Date(runnerData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</div>
                  </div>
                  
                  ${runnerData.lastKnownLocation ? `
                    <div class="info-item">
                      <div class="info-label">Last Known Location</div>
                      <div>
                        Latitude: ${runnerData.lastKnownLocation.coordinates[1].toFixed(6)}, 
                        Longitude: ${runnerData.lastKnownLocation.coordinates[0].toFixed(6)}
                      </div>
                    </div>
                  ` : ''}
                </div>
                
                <div class="map-section">
                  <h2>Location Map</h2>
                  <div id="map"></div>
                </div>
              </div>
            </div>
            
            <script>
              // Initialize map if location data exists
              ${runnerData.lastKnownLocation ? `
                const map = L.map('map').setView([
                  ${runnerData.lastKnownLocation.coordinates[1]}, 
                  ${runnerData.lastKnownLocation.coordinates[0]}
                ], 14);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                // Add marker for runner location
                L.marker([
                  ${runnerData.lastKnownLocation.coordinates[1]}, 
                  ${runnerData.lastKnownLocation.coordinates[0]}
                ]).addTo(map)
                  .bindPopup("${runnerData.name} (${runnerData.runnerNumber})")
                  .openPopup();
              ` : `
                document.getElementById('map').innerHTML = '<div style="height: 100%; display: flex; justify-content: center; align-items: center; background-color: #f3f4f6;"><p>No location data available</p></div>';
              `}
            </script>
          </body>
          </html>
        `);
        detailWindow.document.close();
      } else {
        throw new Error(response.data?.error || 'Failed to fetch runner details');
      }
    } catch (err) {
      console.error('Error fetching runner details:', err);
      alert('Failed to fetch runner details: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading && pagination.page === 1) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchRunners} />;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Runners</h1>
          <p className="mt-1 text-sm text-gray-500">Manage marathon participants</p>
        </div>
        <button
          onClick={exportRunners}
          disabled={exportLoading}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Export CSV
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="sm:flex-1">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Search by name, email, or runner number"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="status" className="sr-only">
              Filter by Status
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="category" className="sr-only">
              Filter by Category
            </label>
            <select
              id="category"
              name="category"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Half Marathon">Half Marathon</option>
              <option value="Full Marathon">Full Marathon</option>
              <option value="Fun Run">Fun Run</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <AdjustmentsHorizontalIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Apply Filters
          </button>
        </form>
      </div>

      {/* Runners Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Runner
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Categories
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Registered
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <Loading />
                  </td>
                </tr>
              ) : runners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No runners found
                  </td>
                </tr>
              ) : (
                runners.map((runner) => (
                  <tr key={runner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{runner.name}</div>
                          <div className="text-sm text-gray-500">{runner.runnerNumber}</div>
                          <div className="text-sm text-gray-500">{runner.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {runner.registeredCategories?.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          runner.status
                        )}`}
                      >
                        {runner.status.charAt(0).toUpperCase() + runner.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {runner.lastKnownLocation ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span>
                            {runner.lastKnownLocation.coordinates[1].toFixed(4)}, {runner.lastKnownLocation.coordinates[0].toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(runner.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        onClick={() => viewRunnerDetails(runner._id)}
                      >
                        View
                      </button>
                      <button
                        className="text-primary-600 hover:text-primary-900"
                        onClick={() => {
                          const newStatus = runner.status === 'active' ? 'completed' : 'active';
                          updateRunnerStatus(runner._id, newStatus);
                        }}
                      >
                        {runner.status === 'active' ? 'Complete' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === pagination.totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
            <div className="flex items-center justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.page === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <div className="text-sm text-gray-700">
                <span className="font-medium">{pagination.page}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.page === pagination.totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
