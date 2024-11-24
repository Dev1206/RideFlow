import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  RiDashboardFill, 
  RiUserStarFill, 
  RiTaxiFill, 
  RiCalendarCheckFill, 
  RiAddCircleFill, 
  RiFileListFill, 
  RiHistoryFill, 
  RiLogoutCircleFill 
} from 'react-icons/ri';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { userRoles, isDeveloper } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <RiDashboardFill className="w-5 h-5 text-blue-400" />,
      roles: ['customer', 'driver', 'admin', 'developer']
    },
    {
      path: '/book-ride',
      label: 'Book Ride',
      icon: <RiAddCircleFill className="w-5 h-5 text-green-400" />,
      roles: ['customer']
    },
    {
      path: '/my-rides',
      label: 'My Rides',
      icon: <RiFileListFill className="w-5 h-5 text-purple-400" />,
      roles: ['driver', 'admin', 'developer']
    },
    {
      path: '/ride-history',
      label: 'Ride History',
      icon: <RiHistoryFill className="w-5 h-5 text-orange-400" />,
      roles: ['customer']
    },
    {
      path: '/manage-users',
      label: 'Manage Users',
      icon: <RiUserStarFill className="w-5 h-5 text-pink-400" />,
      roles: ['admin', 'developer']
    },
    {
      path: '/manage-drivers',
      label: 'Manage Drivers',
      icon: <RiTaxiFill className="w-5 h-5 text-cyan-400" />,
      roles: ['admin', 'developer']
    },
    {
      path: '/manage-rides',
      label: 'Manage Rides',
      icon: <RiCalendarCheckFill className="w-5 h-5 text-yellow-400" />,
      roles: ['admin', 'developer']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role) || isDeveloper())
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg"
      >
        {isOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiMenu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div 
        className={`
          fixed md:static inset-0 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-transform duration-300 ease-in-out
          w-64 bg-gradient-to-b from-indigo-600 via-indigo-700 to-purple-700 
          text-white flex flex-col h-screen
        `}
      >
        {/* Logo Section - Updated with right alignment and padding */}
        <div className="p-6 border-b border-white/10 md:pl-6 pl-16">
          <div className="text-right md:text-left">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              RideFlow
            </h1>
            <p className="text-indigo-200 text-sm mt-1">Ride Booking System</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="px-4 space-y-2">
            {filteredMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-white/15 text-white shadow-lg shadow-black/5 backdrop-blur-lg'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <span className={`transition-transform duration-200 ${
                  isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto"></div>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 space-y-2 mt-5">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RiLogoutCircleFill className="w-5 h-5 text-red-400" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
        
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}; 
