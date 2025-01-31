import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
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

      console.log("Face Enrollment Success:", response);


      await setDoc(doc(db, "users", user.uid), { faceID: response.facialId }, { merge: true });

      setMessage("Face ID registered successfully!");
    } catch (error: any) {
      console.error("Face Enrollment Error:", error);
      setMessage("Face ID registration failed. Try again.");
      faceioInstance.current.restartSession();
    }
    setLoading(false);
  };

  const deleteFacialID = async (facialId: string): Promise<boolean> => {
    if (!facialId) {
      console.error("Facial ID is required.");
      return false;
    }
  
    try {
      const response = await fetch(`/api/deleteFaceID?faceID=${facialId}`);
  
      const text = await response.text(); // Read response as text
  
      try {
        const data = JSON.parse(text); // Convert to JSON
  
        if (data.error) {
          console.error("FaceIO API Error:", data.error);
          return false;
        }
  
        console.log("Face ID successfully deleted from FaceIO");
        return true;
      } catch (parseError) {
        console.warn("Invalid JSON response, assuming success:", text);
        return true;
      }
    } catch (error) {
      console.error("Error deleting Face ID:", error);
      return false;
    }
  };
  
  

  const handleFaceRemove = async () => {
    if (!user?.uid) {
      setMessage("User not found. Please log in again.");
      return;
    }
  
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists() || !userDoc.data().faceID) {
        setMessage("No Face ID found for this user.");
        setLoading(false);
        return;
      }
  
      const faceID = userDoc.data().faceID;
  
      const success = await deleteFacialID(faceID);
      if (!success) {
        setMessage("Failed to remove Face ID from FaceIO.");
        setLoading(false);
        return;
      }
  
      await updateDoc(userDocRef, {
        faceID: null, // Remove faceID from Firestore
      });
  
      setMessage("Face ID removed successfully!");
    } catch (error: any) {
      console.error("Error removing Face ID:", error);
      setMessage("Failed to remove Face ID. Please try again.");
    }
    setLoading(false);
  };
  
  

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <img src={ocbcimg} alt="Bank Logo" className="h-16" />
        <button onClick={() => auth.signOut().then(() => navigate("/"))} className="text-sm font-medium text-gray-500">
          Log Out
        </button>
      </header>

      {/* Page Title */}
      <div className="text-center mt-4">
        <h1 className="text-2xl font-bold text-gray-700">Manage Your Face ID</h1>
        <p className="text-gray-500 mt-2">Register or remove your Face ID for secure access</p>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col gap-4">
        <button
          onClick={handleFaceEnroll}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Face ID"}
        </button>

        <button
          onClick={handleFaceRemove}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Removing..." : "Remove Face ID"}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 px-4 py-2 rounded-lg ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default FaceIDRegistration;
