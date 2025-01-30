import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import ocbcimg from "./assets/OCBC-Logo.png";
import faceIO from "@faceio/fiojs";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string;
}

interface LocationState {
  user: UserData;
}

const FaceIDRegistration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const user = state?.user;

  const faceioInstance = useRef<any>(null);

  useEffect(() => {
    if (!faceioInstance.current) {
      faceioInstance.current = new faceIO(import.meta.env.VITE_FACEIO_API_KEY);
    }
  }, []);

  const handleFaceEnroll = async () => {
  if (!user?.email) {
    setMessage("No user email found. Please log in again.");
    return;
  }

  setLoading(true);
  try {
    const response = await faceioInstance.current.enroll({
      locale: "auto",
      payload: {
        email: user.email,
        uid: user.uid,
      },
    });

    // ✅ Update Firestore with the generated Face ID
    await setDoc(doc(db, "users", user.uid), { faceID: response.facialId }, { merge: true });

    setMessage("Face ID registered successfully!");
  } catch (error: any) {
    if (error.code === 10) {
      setMessage("Invalid FaceIO Public ID. Please check and update it.");
    } else {
      setMessage("Face ID registration failed. Try again.");
    }
    console.error("FaceIO Error:", error);
    faceioInstance.current.restartSession();
  }
  setLoading(false);
};


  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="w-full p-4 flex justify-between items-center">
        <img src={ocbcimg} alt="Bank Logo" className="h-16" />
        <button onClick={() => auth.signOut().then(() => navigate("/"))} className="text-sm font-medium text-gray-500">
          Log Out
        </button>
      </header>

      <div className="text-center mt-4">
        <h1 className="text-2xl font-bold text-gray-700">Register Your Face ID</h1>
        <p className="text-gray-500 mt-2">Let us recognize your face for secure access</p>
      </div>

      <div className="mt-6">
        <button
          onClick={handleFaceEnroll}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Face ID"}
        </button>
      </div>

      {message && (
        <div className={`mt-4 px-4 py-2 rounded-lg ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default FaceIDRegistration;
