import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from "./components/main_header";
import Footer from "./components/main_footer";
import BG from "./components/main_bg";
import Home from "./components/page_home";
import Login from './components/page_login';
import Signup from './components/page_signup';
import Dashboard from './components/page_dashboard';
import NotFound from './components/page_not-found';

export default function App() {
  return (
    <Router>
      <div className="content-wrapper max-w-screen-2xl text-lg mx-auto px-8">
        <Header />
        <BG />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}
