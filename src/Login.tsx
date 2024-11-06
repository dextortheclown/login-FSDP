import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { signInWithEmailAndPassword} from "firebase/auth";
import { auth } from "./firebase";
import ocbcimg from "./assets/OCBC-Logo.png";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Only pass serializable data, like uid, email, and displayName
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "User",
      };
  
      navigate("/qr-generator", { state: { user: userData } }); // Pass only serializable properties
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error("Login error:", err);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-md rounded-lg">
      <header className="w-full p-4 flex flex-col items-center">
        <img src={ocbcimg} alt="Bank Logo" className="h-16 mb-2" />
        </header>

        <form onSubmit={onLogin} className="space-y-6">
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
            >
              Login
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          No account yet?{' '}
          <NavLink to="/SignUp" className="text-blue-500 hover:underline">
            Sign up
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
