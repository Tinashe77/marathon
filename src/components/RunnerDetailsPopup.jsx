// src/components/RunnerDetailsPopup.jsx
import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { MapPinIcon } from '@heroicons/react/24/outline';
import RunnerMap from './RunnerMap';

export default function RunnerDetailsPopup({ runnerId, onClose }) {
  const [runner, setRunner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const viewRunnerDetails = async (runnerId) => {
        try {
          const response = await axios.get(`/runners/${runnerId}`);
          
          if (response.data?.success) {
            const runnerData = response.data.data;
            
            // First, create the window with some initial content
            const detailWindow = window.open('', '_blank');
            
            // Check if the window was created successfully
            if (!detailWindow || detailWindow.closed || typeof detailWindow.document === 'undefined') {
              alert('Please allow popups for this website to view runner details');
              return;
            }
            
            // Set up basic HTML structure first
            detailWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Runner: ${runnerData.name}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body>
                <h1>Loading runner details...</h1>
              </body>
              </html>
            `);
            
            // Now we know the document exists, add the full content
            detailWindow.document.open();
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
                  // Initialize map when Leaflet is fully loaded
                  document.addEventListener('DOMContentLoaded', function() {
                    // Initialize map if location data exists
                    ${runnerData.lastKnownLocation ? `
                      // Wait for Leaflet to be available
                      function initMap() {
                        if (typeof L !== 'undefined') {
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
                        } else {
                          // If Leaflet isn't loaded yet, try again shortly
                          setTimeout(initMap, 100);
                        }
                      }
                      
                      // Start the initialization process
                      initMap();
                    ` : `
                      document.getElementById('map').innerHTML = '<div style="height: 100%; display: flex; justify-content: center; align-items: center; background-color: #f3f4f6;"><p>No location data available</p></div>';
                    `}
                  });
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

    if (runnerId) {
      fetchRunnerDetails();
    }
  }, [runnerId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full mx-4">
          <div className="animate-pulse text-center p-4">Loading runner details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full mx-4">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!runner) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Runner Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{runner.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Runner Number:</span>
                <span className="ml-2 text-gray-900">{runner.runnerNumber}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{runner.email || 'Not provided'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{runner.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    runner.status === 'active' ? 'bg-green-100 text-green-800' :
                    runner.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                    runner.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {runner.status.charAt(0).toUpperCase() + runner.status.slice(1)}
                  </span>
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Registered Categories:</span>
                <div className="mt-1 space-y-1">
                  {runner.registeredCategories?.map(category => (
                    <span 
                      key={category}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Registered Date:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(runner.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              {runner.lastKnownLocation && (
                <div>
                  <span className="font-medium text-gray-700">Last Known Location:</span>
                  <div className="mt-1 flex items-center text-gray-700">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mr-1" />
                    <span>
                      {runner.lastKnownLocation.coordinates[1].toFixed(6)}, 
                      {runner.lastKnownLocation.coordinates[0].toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Location Map</h3>
            {runner.lastKnownLocation ? (
              <RunnerMap location={runner.lastKnownLocation} height="250px" />
            ) : (
              <div className="h-[250px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MapPinIcon className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2">No location data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
