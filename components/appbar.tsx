"use client"

import { useState, useEffect } from "react"
import { 
  Activity, 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation";
  import axios from "axios";
  import { toast } from "sonner";
import { api } from "@/lib/api"

export default function HealthcareAppBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminName, setAdminName] = useState("Admin User")
  const [adminRole, setAdminRole] = useState("User")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Load admin data from localStorage only on client side
    const name = localStorage.getItem("adminName")
    const role = localStorage.getItem("adminRole")
    if (name) setAdminName(name)
    if (role) setAdminRole(role)
  }, [])

  // Define routes for navigation items
  const navigationItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "staff", label: "Manage Staff", icon: Users, href: "/staff" },
    { id: "appointments", label: "Appointments", icon: Calendar, href: "/appointments" },
    { id: "reports", label: "Reports", icon: FileText, href: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ]

  // Determine the activeTab from the current pathname
  function getActiveTab() {
    // Find the navigation item whose href matches the start of the pathname
    const match = navigationItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )
    return match ? match.id : "home"
  }

  const activeTab = getActiveTab()

  const handleLogout = async () => {
    try {
      await api.post(
        "api/admin/logout",
        {},
      );
      // Clear user info from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminRole");
      }
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      // Show error toast
      toast.error(
        error?.response?.data?.error ||
          "Logout failed. Please try again."
      );
      // Always try to clear user info and redirect regardless
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminRole");
      }
      router.push("/login");
    }
  };

  return (
    <div className="w-full">
      {/* Main AppBar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">HealthCare</h1>
                  <p className="text-xs text-gray-500">Admin Portal</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Search Bar - Hidden on mobile
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-64 h-9"
                />
              </div> */}

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
                      <AvatarFallback>
                        {adminName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {adminName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {adminRole}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-30">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-1">
              {/* Mobile Search */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-full"
                />
              </div>

              {/* Mobile Navigation Items */}
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Demo Content Area
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            {(() => {
              const ActiveIcon = navigationItems.find(item => item.id === activeTab)?.icon || Home
              return <ActiveIcon className="w-8 h-8 text-blue-600" />
            })()}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {navigationItems.find(item => item.id === activeTab)?.label}
          </h2>
          <p className="text-gray-600 mb-6">
            This is the {navigationItems.find(item => item.id === activeTab)?.label.toLowerCase()} section of your healthcare admin portal.
          </p>
          <Button className="">
            Get Started
          </Button>
        </div>
      </div> */}
    </div>
  )
}