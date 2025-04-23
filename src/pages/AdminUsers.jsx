// src/pages/AdminUsers.jsx
import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { 
  UserIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import Error from '../components/Error';

export default function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor'
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // In a real application, we would fetch from the API
      // const response = await axios.get('/auth/admins');
      // setAdmins(response.data.data);
      
      // Mock data for demonstration
      const mockAdmins = [
        {
          _id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: '2023-04-10T08:00:00.000Z'
        },
        {
          _id: '2',
          name: 'Editor User',
          email: 'editor@example.com',
          role: 'editor',
          createdAt: '2023-04-11T09:00:00.000Z'
        },
        {
          _id: '3',
          name: 'Staff User',
          email: 'staff@example.com',
          role: 'editor',
          createdAt: '2023-04-12T10:00:00.000Z'
        }
      ];
      
      setAdmins(mockAdmins);
      setError(null);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError(err.response?.data?.message || 'Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (admin = null) => {
    if (admin) {
      setCurrentAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role
      });
    } else {
      setCurrentAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'editor'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAdmin(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // In a real application, we would submit to the API
      if (currentAdmin) {
        // Update existing admin
        // const response = await axios.put(`/auth/admins/${currentAdmin._id}`, formData);
        // Update the admins array with the updated admin
        setAdmins(admins.map(admin => 
          admin._id === currentAdmin._id ? { ...admin, name: formData.name, email: formData.email, role: formData.role } : admin
        ));
      } else {
        // Create new admin
        // const response = await axios.post('/auth/create-admin', formData);
        // Add the new admin to the admins array
        const newAdmin = {
          _id: `${admins.length + 1}`,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          createdAt: new Date().toISOString()
        };
        setAdmins([...admins, newAdmin]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error saving admin:', err);
      setError(err.response?.data?.message || 'Failed to save admin user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin user?')) return;
    
    try {
      // In a real application, we would call the API
      // await axios.delete(`/auth/admins/${adminId}`);
      
      // Remove from the admins array
      setAdmins(admins.filter(admin => admin._id !== adminId));
    } catch (err) {
      console.error('Error deleting admin:', err);
      setError(err.response?.data?.message || 'Failed to delete admin user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Admin Modal
  const AdminModal = () => (
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
                    {currentAdmin ? 'Edit Admin User' : 'Create New Admin User'}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
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
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        {currentAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!currentAdmin}
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        name="role"
                        id="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="admin">Admin (Full Access)</option>
                        <option value="editor">Editor (Limited Access)</option>
                      </select>
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
                {currentAdmin ? 'Update' : 'Create'}
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
          <h1 className="text-2xl font-semibold text-gray-900">Admin Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage administrator accounts and permissions</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Admin
        </button>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="px-6 py-4 flex items-center justify-center">
            <Loading />
          </div>
        ) : admins.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500">
            No admin users found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {admins.map((admin) => (
              <li key={admin._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                        <UserIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{admin.name}</h3>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`mr-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                          admin.role
                        )}`}
                      >
                        {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => openModal(admin)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(admin._id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          disabled={admin.role === 'admin' && admins.filter(a => a.role === 'admin').length === 1}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <LockClosedIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>
                        Account created on {formatDate(admin.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal for create/edit */}
      {isModalOpen && <AdminModal />}
    </div>
  );
}