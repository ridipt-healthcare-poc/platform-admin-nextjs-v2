"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Hospital, Plus, Search, MapPin, Phone, Mail, Clock, Calendar, Copy, CheckCircle2, Edit, Trash2, MoreVertical, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Facility {
  _id: string
  name: string
  registrationNumber: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
  contact: {
    phone: string
    email: string
    emergencyContact?: string
  }
  operatingHours?: Record<string, { open: string; close: string }>
  daysOfOperation?: string[]
  specializations?: string[]
  adminEmail?: string
  password?: string
}

interface CredentialsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credentials: {
    email: string
    password: string
    facilityName: string
    facilityType: string
  } | null
}

function CredentialsDialog({ open, onOpenChange, credentials }: CredentialsDialogProps) {
  const [copied, setCopied] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  })

  const copyToClipboard = (text: string, field: "email" | "password") => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [field]: true })
    toast.success(`${field === "email" ? "Email" : "Password"} copied to clipboard`)
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000)
  }

  if (!credentials) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            {credentials.facilityType} Created Successfully!
          </DialogTitle>
          <DialogDescription>
            {credentials.facilityName} has been created. Save these credentials for login.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <div className="flex items-center gap-2">
              <Input value={credentials.email} readOnly className="font-mono text-sm" />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(credentials.email, "email")}
              >
                {copied.email ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="flex items-center gap-2">
              <Input value={credentials.password} readOnly className="font-mono text-sm" />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(credentials.password, "password")}
              >
                {copied.password ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Important:</strong> Save these credentials securely. They cannot be recovered later.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// EditHospitalDialog removed - using separate edit pages instead

function CreateHospitalDialog({ onHospitalCreated }: { onHospitalCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string; facilityName: string; facilityType: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    superAdminEmail: "",
    superAdminPassword: "",
    emergencyContact: "",
    specializations: "",
    operatingHours: {
      Monday: { open: "09:00", close: "17:00" },
      Tuesday: { open: "09:00", close: "17:00" },
      Wednesday: { open: "09:00", close: "17:00" },
      Thursday: { open: "09:00", close: "17:00" },
      Friday: { open: "09:00", close: "17:00" },
      Saturday: { open: "09:00", close: "14:00" },
      Sunday: { open: "Closed", close: "Closed" },
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        email: formData.email,
        phone: formData.phone,
        superAdminEmail: formData.superAdminEmail,
        superAdminPassword: formData.superAdminPassword,
        facilityAdminRole: "SuperAdmin",
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: "India",
        },
        contact: {
          emergencyContact: formData.emergencyContact,
        },
        operatingHours: formData.operatingHours,
        specializations: formData.specializations
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      }

      const response = await api.post("/api/facilities/hospitals", payload)
      console.log("Hospital creation response:", response.data)
      toast.success("Hospital created successfully!")
      
      setCredentials({
        email: response.data.credentials.email,
        password: response.data.credentials.password,
        facilityName: formData.name,
        facilityType: "Hospital",
      })
      console.log("Set credentials:", {
        email: response.data.credentials.email,
        password: response.data.credentials.password,
      })
      
      setOpen(false)
      setShowCredentials(true)
      onHospitalCreated()
      
      // Reset form
      setFormData({
        name: "",
        registrationNumber: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        email: "",
        superAdminEmail: "",
        superAdminPassword: "",
        emergencyContact: "",
        specializations: "",
        operatingHours: {
          Monday: { open: "09:00", close: "17:00" },
          Tuesday: { open: "09:00", close: "17:00" },
          Wednesday: { open: "09:00", close: "17:00" },
          Thursday: { open: "09:00", close: "17:00" },
          Friday: { open: "09:00", close: "17:00" },
          Saturday: { open: "09:00", close: "14:00" },
          Sunday: { open: "Closed", close: "Closed" },
        },
      })
    } catch (error: unknown) {
      console.error("Create hospital error:", (error as { response?: { data?: unknown } })?.response?.data)
      const errorMsg = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message || "Failed to create hospital"
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Hospital
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Hospital</DialogTitle>
            <DialogDescription>Add a new hospital to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                 // required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="superAdminEmail">Super Admin Email</Label>
                <Input
                  id="superAdminEmail"
                  type="email"
                  value={formData.superAdminEmail}
                  onChange={(e) => setFormData({ ...formData, superAdminEmail: e.target.value })}
                  placeholder="superadmin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="superAdminPassword">Super Admin Password</Label>
                <Input
                  id="superAdminPassword"
                  type="password"
                  value={formData.superAdminPassword}
                  onChange={(e) => setFormData({ ...formData, superAdminPassword: e.target.value })}
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations (comma-separated)</Label>
              <Input
                id="specializations"
                placeholder="e.g., Cardiology, Neurology, Orthopedics"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Hospital"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CredentialsDialog
        open={showCredentials}
        onOpenChange={setShowCredentials}
        credentials={credentials}
      />
    </>
  )
}

// EditClinicDialog removed - using separate edit pages instead

function CreateClinicDialog({ onClinicCreated }: { onClinicCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string; facilityName: string; facilityType: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    superAdminEmail: "",
    superAdminPassword: "",
    emergencyContact: "",
    specializations: "",
    daysOfOperation: [] as string[],
  })

  const daysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      daysOfOperation: formData.daysOfOperation.includes(day)
        ? formData.daysOfOperation.filter((d) => d !== day)
        : [...formData.daysOfOperation, day],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        email: formData.email,
        phone: formData.phone,
        superAdminEmail: formData.superAdminEmail,
        superAdminPassword: formData.superAdminPassword,
        facilityAdminRole: "SuperAdmin",
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: "India",
        },
        contact: {
          emergencyContact: formData.emergencyContact,
        },
        daysOfOperation: formData.daysOfOperation,
        specializations: formData.specializations
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      }

      const response = await api.post("/api/facilities/clinics", payload)
      toast.success("Clinic created successfully!")
      
      setCredentials({
        email: response.data.credentials.email,
        password: response.data.credentials.password,
        facilityName: formData.name,
        facilityType: "Clinic",
      })
      
      setOpen(false)
      setShowCredentials(true)
      onClinicCreated()
      
      // Reset form
      setFormData({
        name: "",
        registrationNumber: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        email: "",
        superAdminEmail: "",
        superAdminPassword: "",
        emergencyContact: "",
        specializations: "",
        daysOfOperation: [],
      })
    } catch (error: unknown) {
      console.error("Create clinic error:", (error as { response?: { data?: unknown } })?.response?.data)
      const errorMsg = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message || "Failed to create clinic"
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Clinic
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Clinic</DialogTitle>
            <DialogDescription>Add a new clinic to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Clinic Name *</Label>
                <Input
                  id="clinic-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-registrationNumber">Registration Number *</Label>
                <Input
                  id="clinic-registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-street">Street Address *</Label>
              <Input
                id="clinic-street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-city">City *</Label>
                <Input
                  id="clinic-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-state">State *</Label>
                <Input
                  id="clinic-state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-pincode">Pincode *</Label>
                <Input
                  id="clinic-pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-phone">Phone *</Label>
                <Input
                  id="clinic-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-email">Email *</Label>
                <Input
                  id="clinic-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-superAdminEmail">Super Admin Email</Label>
                <Input
                  id="clinic-superAdminEmail"
                  type="email"
                  value={formData.superAdminEmail}
                  onChange={(e) => setFormData({ ...formData, superAdminEmail: e.target.value })}
                  placeholder="superadmin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-superAdminPassword">Super Admin Password</Label>
                <Input
                  id="clinic-superAdminPassword"
                  type="password"
                  value={formData.superAdminPassword}
                  onChange={(e) => setFormData({ ...formData, superAdminPassword: e.target.value })}
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-emergencyContact">Emergency Contact</Label>
              <Input
                id="clinic-emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-specializations">Specializations (comma-separated)</Label>
              <Input
                id="clinic-specializations"
                placeholder="e.g., General Medicine, Pediatrics"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Days of Operation *</Label>
              <div className="flex flex-wrap gap-2">
                {daysOptions.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={formData.daysOfOperation.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                  >
                    {day.substring(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || formData.daysOfOperation.length === 0}>
                {loading ? "Creating..." : "Create Clinic"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CredentialsDialog
        open={showCredentials}
        onOpenChange={setShowCredentials}
        credentials={credentials}
      />
    </>
  )
}

function FacilityCard({ facility, type, onEdit, onDelete, onResetPassword }: { facility: Facility; type: "hospital" | "clinic"; onEdit: (facility: Facility) => void; onDelete: (id: string) => void; onResetPassword: (facility: Facility, type: "hospital" | "clinic") => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === "hospital" ? "bg-blue-100" : "bg-green-100"}`}>
              {type === "hospital" ? (
                <Hospital className={`w-5 h-5 ${type === "hospital" ? "text-blue-600" : "text-green-600"}`} />
              ) : (
                <Building2 className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{facility.name}</CardTitle>
              <CardDescription>Reg: {facility.registrationNumber}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{type === "hospital" ? "Hospital" : "Clinic"}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onResetPassword(facility, type)}>
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(facility)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(facility._id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {facility.address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <span className="text-gray-600">
              {facility.address.street}, {facility.address.city}, {facility.address.state} - {facility.address.pincode}
            </span>
          </div>
        )}
        {facility.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{facility.phone}</span>
          </div>
        )}
        {facility.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{facility.email}</span>
          </div>
        )}
        {type === "hospital" && facility.operatingHours && (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
            <span className="text-gray-600">24/7 Services Available</span>
          </div>
        )}
        {type === "clinic" && facility.daysOfOperation && facility.daysOfOperation.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {facility.daysOfOperation.map((day) => (
                <Badge key={day} variant="secondary" className="text-xs">
                  {day.substring(0, 3)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {facility.specializations && Array.isArray(facility.specializations) && facility.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {facility.specializations.slice(0, 3).map((spec, index) => (
              <Badge key={`${spec}-${index}`} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
            {facility.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{facility.specializations.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ResetPasswordDialog({ facility, type, open, onOpenChange, onPasswordReset }: { facility: Facility | null; type: "hospital" | "clinic"; open: boolean; onOpenChange: (open: boolean) => void; onPasswordReset: () => void }) {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facility) return
    setLoading(true)

    try {
      const endpoint = type === "hospital" ? "/api/facilities/hospitals" : "/api/facilities/clinics"
      await api.put(`${endpoint}/${facility._id}`, { superAdminPassword: newPassword })
      toast.success("Password reset successfully!")
      onOpenChange(false)
      setNewPassword("")
      onPasswordReset()
    } catch (error: unknown) {
      console.error("Reset password error:", error)
      const errorMsg = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message || "Failed to reset password"
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for {facility?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password *</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || newPassword.length < 6}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function FacilitiesPage() {
  const router = useRouter()
  const [hospitals, setHospitals] = useState<Facility[]>([])
  const [clinics, setClinics] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [resetPasswordFacility, setResetPasswordFacility] = useState<{ facility: Facility; type: "hospital" | "clinic" } | null>(null)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)

  const fetchHospitals = async () => {
    try {
      const response = await api.get("/api/facilities/hospitals")
      setHospitals(response.data.data || [])
    } catch {
      toast.error("Failed to fetch hospitals")
    }
  }

  const fetchClinics = async () => {
    try {
      const response = await api.get("/api/facilities/clinics")
      setClinics(response.data.data || [])
    } catch {
      toast.error("Failed to fetch clinics")
    }
  }

  const handleEditHospital = (facility: Facility) => {
    router.push(`/facilities/edit/hospital/${facility._id}`)
  }

  const handleEditClinic = (facility: Facility) => {
    router.push(`/facilities/edit/clinic/${facility._id}`)
  }

  const handleDeleteHospital = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return
    
    try {
      await api.delete(`/api/facilities/hospitals/${id}`)
      toast.success("Hospital deleted successfully")
      fetchHospitals()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to delete hospital"
      toast.error(errorMessage)
    }
  }

  const handleDeleteClinic = async (id: string) => {
    if (!confirm("Are you sure you want to delete this clinic?")) return
    
    try {
      await api.delete(`/api/facilities/clinics/${id}`)
      toast.success("Clinic deleted successfully")
      fetchClinics()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to delete clinic"
      toast.error(errorMessage)
    }
  }


  const handleResetPassword = (facility: Facility, type: "hospital" | "clinic") => {
    setResetPasswordFacility({ facility, type })
    setResetPasswordOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchHospitals(), fetchClinics()])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredClinics = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Facilities</h1>
          <p className="text-gray-500 mt-1">Manage hospitals and clinics in your network</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hospitals" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="hospitals" className="gap-2">
              <Hospital className="w-4 h-4" />
              Hospitals ({filteredHospitals.length})
            </TabsTrigger>
            <TabsTrigger value="clinics" className="gap-2">
              <Building2 className="w-4 h-4" />
              Clinics ({filteredClinics.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="hospitals" className="space-y-4">
          <div className="flex justify-end">
            <CreateHospitalDialog onHospitalCreated={fetchHospitals} />
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading hospitals...</div>
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <Hospital className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hospitals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHospitals.map((hospital) => (
                <FacilityCard 
                  key={hospital._id} 
                  facility={hospital} 
                  type="hospital" 
                  onEdit={handleEditHospital}
                  onDelete={handleDeleteHospital}
                  onResetPassword={handleResetPassword}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clinics" className="space-y-4">
          <div className="flex justify-end">
            <CreateClinicDialog onClinicCreated={fetchClinics} />
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading clinics...</div>
          ) : filteredClinics.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No clinics found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClinics.map((clinic) => (
                <FacilityCard 
                  key={clinic._id} 
                  facility={clinic} 
                  type="clinic" 
                  onEdit={handleEditClinic}
                  onDelete={handleDeleteClinic}
                  onResetPassword={handleResetPassword}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ResetPasswordDialog
        facility={resetPasswordFacility?.facility || null}
        type={resetPasswordFacility?.type || "hospital"}
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        onPasswordReset={() => {
          fetchHospitals()
          fetchClinics()
        }}
      />
    </div>
  )
}
