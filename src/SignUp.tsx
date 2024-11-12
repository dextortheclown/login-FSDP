import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, NavLink } from "react-router-dom";
import ocbcimg from "./assets/OCBC-Logo.png";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      

      // Add the new user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        userID: user.uid,
        email: user.email,
      });

      // set default preferences in new account 
      await setDoc(doc(db, "preferences", user.uid), {
        userID: user.uid,
        theme: "light",
        font: "Inter",
        fontWeight: "normal",
        iconSize: "medium",
        textToSpeech: false,
      });


      setSuccess("Account created successfully!");
      setTimeout(() => navigate("/"), 2000); // Redirect to login after a short delay
    } catch (err) {
      setError("Failed to create account. Please try again.");
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-md rounded-lg">
        <header className="w-full p-4 flex flex-col items-center">
          <img src={ocbcimg} alt="Bank Logo" className="h-16 mb-2" />
        </header>

        <form onSubmit={handleSignUp} className="space-y-6">
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
          {success && <p className="text-sm text-green-500 text-center">{success}</p>}

          <div>
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <NavLink to="/" className="text-blue-500 hover:underline">
            Log in
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
