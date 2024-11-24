import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RiCarLine, RiMapPinLine, RiUserStarLine, RiShieldCheckLine } from 'react-icons/ri';

// Add Google icon SVG component
const GoogleIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 48 48" 
    className="w-6 h-6"
  >
    <path 
      fill="#FFC107" 
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path 
      fill="#FF3D00" 
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path 
      fill="#4CAF50" 
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path 
      fill="#1976D2" 
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const features = [
    {
      icon: <RiCarLine className="w-8 h-8 text-blue-500" />,
      title: "Easy Booking",
      description: "Book your ride in seconds with our streamlined process"
    },
    {
      icon: <RiMapPinLine className="w-8 h-8 text-green-500" />,
      title: "Real-time Tracking",
      description: "Track your ride's location and status in real-time"
    },
    {
      icon: <RiUserStarLine className="w-8 h-8 text-purple-500" />,
      title: "Professional Drivers",
      description: "Experienced and vetted drivers for your safety"
    },
    {
      icon: <RiShieldCheckLine className="w-8 h-8 text-indigo-500" />,
      title: "Secure Rides",
      description: "Your safety and comfort are our top priorities"
    }
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-right gradient blob */}
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl animate-blob"></div>
        
        {/* Center gradient blob */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        
        {/* Bottom-left gradient blob */}
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Hero Section */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                RideFlow
              </h1>
              <p className="text-2xl md:text-3xl text-gray-700 mb-12 max-w-3xl mx-auto">
                Your Premium Ride Booking Experience
              </p>

              {/* Google Sign In Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-3 px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 border border-gray-100"
                >
                  <GoogleIcon />
                  <span className="font-medium">Sign in with Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/50"
              >
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white/30 backdrop-blur-md border-t border-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>© 2024 RideFlow. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 