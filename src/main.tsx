import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import QRGenerator from './QRGenerator';
import SignUp from './SignUp';
import FaceIDRegistration from './FaceIDRegistration';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/qr-generator" element={<QRGenerator />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/FaceIDRegistration" element={<FaceIDRegistration />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  </React.StrictMode>
);