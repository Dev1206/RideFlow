import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { useAsyncData } from '../hooks/useAsyncData';
import * as api from '../services/api';
import { FiEdit2, FiX, FiUsers, FiSearch } from 'react-icons/fi';

interface User {
  _id: string;
  firebaseUID: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture?: string;
  activeBookings?: number;
  totalBookings?: number;
}

interface EditingUser {
  _id: string;
  firebaseUID: string;
  name: string;
  email: string;
  roles: string[];
}

export default function ManageUsersPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    data: users = [],  
    refetch: refetchUsers,
    setData: setUsers 
  } = useAsyncData(() => api.getAllUsers(), []);

  const availableRoles = ['customer', 'driver', 'admin', 'developer'];

  useEffect(() => {
    const handleUserRolesUpdated = (event: CustomEvent<{ id: string; roles: string[] }>) => {
      setUsers((prevUsers: User[]) => {
        return prevUsers.map((user: User) => 
          user._id === event.detail.id 
            ? { ...user, roles: event.detail.roles }
            : user
        );
      });
    };

    window.addEventListener('userRolesUpdated', handleUserRolesUpdated as EventListener);
    
    return () => {
      window.removeEventListener('userRolesUpdated', handleUserRolesUpdated as EventListener);
    };
  }, [setUsers]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      // Validate roles array
      if (!Array.isArray(editingUser.roles) || editingUser.roles.length === 0) {
        throw new Error('User must have at least one role');
      }

      // Get the original user's roles before update
      const originalUser = users.find((u: User) => u._id === editingUser._id);
      if (!originalUser) {
        throw new Error('Original user not found');
      }

      const wasDriver = originalUser.roles.includes('driver');
      const willBeDriver = editingUser.roles.includes('driver');

      console.log('Role update details:', {
        firebaseUID: editingUser.firebaseUID,
        oldRoles: originalUser.roles,
        newRoles: editingUser.roles,
        wasDriver,
        willBeDriver
      });

      // Update user roles
      const result = await api.updateUserRoles(editingUser.firebaseUID, editingUser.roles);
      console.log('Update result:', result);

      // Clear editing state
      setEditingUser(null);
      
      // Refresh the users list
      await refetchUsers();

      // Show success message
      alert('User roles updated successfully');

    } catch (error: any) {
      console.error('Error updating user roles:', error);
      alert(error.message || 'Failed to update user roles');
      
      // Refresh the data to ensure UI is in sync with backend
      await refetchUsers();
    }
  };

  const handleRoleToggle = (role: string) => {
    if (!editingUser) return;
    
    setEditingUser(prev => ({
      ...prev!,
      roles: prev!.roles.includes(role)
        ? prev!.roles.filter(r => r !== role)
        : [...prev!.roles, role]
    }));
  };

  const handleEditClick = (user: User) => {
    setEditingUser({
      _id: user._id,
      firebaseUID: user.firebaseUID,
      name: user.name,
      email: user.email,
      roles: [...user.roles]
    });
  };

  const filteredUsers = users.filter((u: User) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header - Improved mobile layout */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-12 md:mt-0">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Manage Users
              </h1>
              <div className="w-full md:w-auto">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            </header>

            {/* Users Grid - Improved mobile layout */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user: User) => (
                <div 
                  key={user._id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                >
                  {/* User Card Header - Improved mobile layout */}
                  <div className="p-4 md:p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0"> {/* Added min-w-0 for text truncation */}
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex-shrink-0 flex items-center justify-center text-white text-base md:text-lg font-bold">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0"> {/* Added min-w-0 for text truncation */}
                          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {editingUser?._id === user._id ? (
                          <button
                            onClick={() => setEditingUser(null)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-indigo-600 hover:text-indigo-700 rounded-lg"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Card Body - Improved mobile layout */}
                  <div className="p-4 md:p-6">
                    {editingUser?._id === user._id ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {availableRoles.map(role => (
                            <button
                              key={role}
                              onClick={() => handleRoleToggle(role)}
                              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors
                                ${editingUser.roles.includes(role)
                                  ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                              `}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          <button
                            onClick={() => handleSaveEdit()}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-gray-500">Current Roles</h4>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {user.roles.map(role => (
                            <span
                              key={role}
                              className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium
                                ${role === 'admin' ? 'bg-red-100 text-red-800' :
                                  role === 'driver' ? 'bg-green-100 text-green-800' :
                                  role === 'developer' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'
                                }
                              `}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State - Improved mobile layout */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-sm md:text-base text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 