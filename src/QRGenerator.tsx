import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import ocbcimg from "./assets/OCBC-Logo.png";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string;
}

interface LocationState {
  user: UserData;
}

const generateToken = (userID: string, timestamp: number) => {
  return btoa(`${userID}:${timestamp}`); // Base64 encoding of userID and timestamp
};

const QRGenerator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const user = state?.user;

  const [qrData, setQrData] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const updateQRCode = () => {
      const timestamp = Math.floor(Date.now() / 10000); // Get current time in 10-second intervals
      const token = generateToken(user.uid, timestamp);

      const data = JSON.stringify({
        userID: user.uid,
        email: user.email,
        displayName: user.displayName,
        token,
      });
      setQrData(data);
      setProgress(0); // Reset progress
    };

    updateQRCode(); // Initial QR code
    const interval = setInterval(updateQRCode, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Update the progress bar every 100ms
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev > 0 ? prev - 1 : 100));
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/"); // Redirect to the login page after logout
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="w-full p-4 flex justify-between items-center">
        <img src={ocbcimg} alt="Bank Logo" className="h-16" />
        <button onClick={handleLogout} className="text-sm font-medium text-gray-500">Log Out</button>
      </header>

      <div className="text-center mt-4">
        <h1 className="text-2xl font-bold text-gray-700">Your QR Code</h1>
        <p className="text-gray-500 mt-2">Scan this code at the ATM to log in</p>
      </div>

      <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
        <QRCodeSVG value={qrData} size={350} />
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-6 bg-gray-300 rounded-full h-4">
        <div
          className="bg-blue-500 h-4 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QRGenerator;