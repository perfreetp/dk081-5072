import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Routing from "@/pages/Routing";
import Workers from "@/pages/Workers";
import Warehouse from "@/pages/Warehouse";
import AfterSales from "@/pages/AfterSales";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<div className="p-8 text-center text-neutral-500">订单详情页开发中...</div>} />
          <Route path="routing" element={<Routing />} />
          <Route path="workers" element={<Workers />} />
          <Route path="warehouse" element={<Warehouse />} />
          <Route path="aftersales" element={<AfterSales />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
