import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { defaulturl } from "@/utils/constants";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if(isAuthenticated){
    navigate('/contests')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${defaulturl}api/auth/login`, formData);

      if (data.token && data.user) {
        login(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}! 🎉`);
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed! Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen relative bg-white dark:bg-background overflow-hidden text-white">
      {/* Welcome Back Text */}
      <div className="text-center mb-6">
        <LogIn className="mx-auto dark:text-gray-300 text-gray-500" size={36} />
        <h1 className="text-3xl font-bold dark:text-white text-black">Welcome Back!</h1>
        <p className="dark:text-gray-400 text-sm mt-1 text-black">Login to continue your journey with us.</p>
      </div>

      {/* Static Blobs */}
      <div className="absolute w-80 h-80 dark:block  bg-green-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4"></div>
      <div className="absolute w-64 h-64 dark:block  bg-green-500 opacity-20 blur-3xl rounded-full bottom-1/4 right-1/4"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 bg-white/10 dark:bg-background/30 backdrop-blur-lg p-8 rounded-xl shadow-lg w-96 border border-white/20">
        <h2 className="text-4xl font-semibold text-center mb-6 dark:text-white text-black">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 pl-10 border border-gray-600 rounded bg-transparent text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 pl-10 pr-10 border border-gray-600 rounded bg-transparent text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {showPassword ? (
              <EyeOff
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>
          <button
            type="submit"
            className="w-full dark:bg-gray-700 bg-black hover:cursor-pointer text-white py-3 rounded-md font-semibold shadow-md transition-transform duration-300 hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm dark:text-gray-400 text-gray-700">
          <p className="dark:hover:text-white hover:text-gray-800 cursor-pointer transition-colors duration-300">
            Forgot password?
          </p>
          <Link to="/signup">
            <p className="mt-1 dark:hover:text-white hover:text-gray-800 cursor-pointer transition-colors duration-300">
              New here? Create an account
            </p>
          </Link>
        </div>
      </div>

      {/* Why Login Section */}
      <div className="absolute bottom-6 text-center text-gray-300 text-sm max-w-md px-4">
        <h3 className="text-lg font-semibold dark:text-white text-black">Why Login?</h3>
        <p className="dark:text-white text-black">
          Get access to all upcoming contests, video solutions.Bookmark your contest
        </p>
      </div>
    </div>
  );
};

export default Login;