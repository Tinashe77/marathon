// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { 
  UsersIcon, 
  MapIcon, 
  FlagIcon, 
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Loading from '../components/Loading';
import Error from '../components/Error';

const StatCard = ({ title, value, icon: Icon, trend, prefix = '', info }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
        {info && <p className="text-xs text-gray-500 mt-1">{info}</p>}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRunners: 0,
      activeRunners: 0,
      completedRaces: 0,
      activeRaces: 0,
      totalRoutes: 0,
      runnerTrend: 0,
      recentRaces: []
    },
    charts: {
      raceData: [],
      categoryPopularity: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // In a real implementation, these would be actual endpoints for dashboard data
      const [statsRes, chartsRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/dashboard/charts')
      ]);

      setDashboardData({
        stats: statsRes.data.data,
        charts: chartsRes.data.data
      });
      setError(null);
    } catch (err) {
      console.error('Dashboard data error:', err);
      // For demo purposes, let's create mock data instead of showing an error
      setDashboardData({
        stats: {
          totalRunners: 248,
          activeRunners: 156,
          completedRaces: 89,
          activeRaces: 67,
          totalRoutes: 3,
          runnerTrend: 12,
          recentRaces: [
            {
              _id: '1',
              runner: { name: 'John Doe', runnerNumber: 'ECO2023' },
              route: { name: 'Victoria Falls Half Marathon' },
              category: 'Half Marathon',
              completionTime: 5400,
              status: 'completed',
              startTime: new Date().toISOString(),
              finishTime: new Date(Date.now() + 5400000).toISOString()
            },
            {
              _id: '2',
              runner: { name: 'Jane Smith', runnerNumber: 'ECO2024' },
              route: { name: 'Victoria Falls Fun Run' },
              category: 'Fun Run',
              completionTime: 1800,
              status: 'completed',
              startTime: new Date().toISOString(),
              finishTime: new Date(Date.now() + 1800000).toISOString()
            }
          ]
        },
        charts: {
          raceData: [
            { date: '2023-04-10', participants: 45, completions: 40 },
            { date: '2023-04-11', participants: 52, completions: 48 },
            { date: '2023-04-12', participants: 49, completions: 45 },
            { date: '2023-04-13', participants: 63, completions: 58 },
            { date: '2023-04-14', participants: 58, completions: 50 },
            { date: '2023-04-15', participants: 72, completions: 65 },
            { date: '2023-04-16', participants: 83, completions: 78 }
          ],
          categoryPopularity: [
            { name: 'Half Marathon', count: 120 },
            { name: 'Full Marathon', count: 75 },
            { name: 'Fun Run', count: 53 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const { stats, charts } = dashboardData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of Victoria Falls Marathon metrics</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Runners"
          value={stats.totalRunners}
          icon={UsersIcon}
          trend={stats.runnerTrend}
          info={`${stats.activeRunners} active runners`}
        />
        <StatCard
          title="Active Races"
          value={stats.activeRaces}
          icon={FlagIcon}
          info="Currently ongoing races"
        />
        <StatCard
          title="Completed Races"
          value={stats.completedRaces}
          icon={CheckCircleIcon}
          info="Successfully finished races"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Participation Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Participation & Completion Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={charts.raceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatDate}
                />
                <Line 
                  name="Participants"
                  type="monotone" 
                  dataKey="participants" 
                  stroke="#0891b2" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  name="Completions"
                  type="monotone" 
                  dataKey="completions" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Popularity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Race Category Popularity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.categoryPopularity}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#16a34a"
                  name="Participants"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Races */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Races</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentRaces && stats.recentRaces.length > 0 ? (
            stats.recentRaces.map((race) => (
              <div key={race._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {race.runner?.name || 'Unknown Runner'}
                      </p>
                      <p className="ml-2 text-sm text-gray-500">
                        ({race.runner?.runnerNumber || 'No Number'})
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">
                      {race.route?.name} - {race.category}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Completion Time: {formatTime(race.completionTime)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      race.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : race.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {race.status === 'completed' ? 'Completed' : 
                       race.status === 'in-progress' ? 'In Progress' : 
                       race.status}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(race.startTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              No recent races
            </div>
          )}
        </div>
      </div>
    </div>
  );
}