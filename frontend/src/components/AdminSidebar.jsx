// src/components/Sidebar.jsx
import { LayoutDashboard, Users, Clock, ShieldAlert, X } from "lucide-react";
// ... باقي الـ imports

// بداخل مصفوفة الـ menuItems ضيف هذني أو فلترهم حسب الـ role
const adminItems = [
  { id: "admin-stats", label: "إحصائيات النظام", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
  { id: "pending-drivers", label: "طلبات السواق", icon: <Clock size={20} />, path: "/admin/pending" },
  { id: "all-users", label: "إدارة المستخدمين", icon: <Users size={20} />, path: "/admin/users" },
];