import { Routes, Route, Navigate } from "react-router";

import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import BusinessSetup from "../pages/BusinessSetup";

import Dashboard from "../pages/Dashboard";
import Customers from "../pages/Customers";
import Products from "../pages/Products";
import Rates from "../pages/Rates";
import Services from "../pages/Services";
import Quotations from "../pages/Quotations";
import Estimates from "../pages/Estimates";
import ProformaInvoices from "../pages/ProformaInvoices";
import Invoices from "../pages/Invoices";
import DeliveryChallans from "../pages/DeliveryChallans";
import Payments from "../pages/Payments";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Onboarding / Glass Business Setup Route (Requires authenticated user, but allows unconfigured business) */}
      <Route
        path="/setup"
        element={
          <ProtectedRoute requireBusiness={false}>
            <BusinessSetup />
          </ProtectedRoute>
        }
      />

      {/* Protected App Routes (Requires authenticated user and completed business configuration) */}
      <Route
        element={
          <ProtectedRoute requireBusiness={true}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/rates" element={<Rates />} />
        <Route path="/services" element={<Services />} />
        <Route path="/estimates" element={<Estimates />} />
        <Route path="/quotations" element={<Quotations />} />
        <Route path="/proforma-invoices" element={<ProformaInvoices />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/delivery-challans" element={<DeliveryChallans />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}