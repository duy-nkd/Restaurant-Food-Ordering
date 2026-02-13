import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from './layout/Navbar';
import Home from './pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddCustomer from './components/AddCustomer';
import EditCustomer from './components/EditCustomer';

import Admin from './pages/Admin';
import Menu from './pages/Menu';
import Orders from './pages/Order';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Statistics from './pages/Statistics';
import StaffDashboard from './pages/StaffDashboard';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminReviewManagement from './pages/AdminReviewManagement';
import PaymentResult from './pages/PaymentResult';
import Footer from './components/Footer';
import GoToTop from './components/GoToTop';
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './components/Chatbot';

function App() {
  return (


    <div className="App">
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/edit-customer/:id" element={<EditCustomer />} />
          <Route path="/products" element={<Admin />} />
          <Route path="/orders" element={<Orders />} />

          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/admin/reviews" element={<AdminReviewManagement />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/payment-result" element={<PaymentResult />} />
        </Routes>
        <Footer />
        <GoToTop />
        <Chatbot />
      </Router>
    </div>
  );
}

export default App;