"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"

export default function EditFacilityPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as string // 'hospital' or 'clinic'
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [facility, setFacility] = useState<Record<string, unknown> | null>(null)

  // Hospital form data
  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    registrationNumber: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    establishedYear: "",
    numberOfBeds: "",
    website: "",
    description: "",
    emergencyContact: "",
    superAdminEmail: "",
    superAdminPassword: "",
    admins: [] as Array<{ name: string; mobile: string; email: string; password: string }>,
    specializations: [] as string[],
    departments: [] as string[],
    facilities: [] as string[],
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

  // Clinic form data
  const [clinicForm, setClinicForm] = useState({
    name: "",
    registrationNumber: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    establishedYear: "",
    specialization: "",
    website: "",
    description: "",
    emergencyContact: "",
    superAdminEmail: "",
    superAdminPassword: "",
    admins: [] as Array<{ name: string; mobile: string; email: string; password: string }>,
    specializations: [] as string[],
    facilities: [] as string[],
    daysOfOperation: [] as string[],
  })

  const departmentOptions = [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology",
    "Oncology", "Emergency", "ICU", "Surgery", "Radiology", "Laboratory",
    "Pharmacy", "Dermatology", "ENT", "Ophthalmology", "Psychiatry",
    "General Medicine", "Other"
  ]

  const hospitalFacilityOptions = [
    "24/7 Emergency", "ICU", "NICU", "Blood Bank", "Pharmacy", "Laboratory",
    "X-Ray", "CT Scan", "MRI", "Ambulance Service", "Operation Theater",
    "Dialysis", "Cafeteria", "Parking"
  ]

  const clinicFacilityOptions = [
    "Consultation", "Pharmacy", "Laboratory", "X-Ray", "ECG",
    "Minor Surgery", "Vaccination", "Health Checkup", "Home Visit", "Telemedicine"
  ]

  const clinicSpecializationOptions = [
    "General Practice", "Dental", "Dermatology", "Pediatrics", "Gynecology",
    "Ophthalmology", "ENT", "Orthopedics", "Physiotherapy", "Diagnostics",
    "Ayurvedic", "Homeopathy", "Multi-Specialty", "Other"
  ]

  const daysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  useEffect(() => {
    fetchFacility()
  }, [id, type])

  const fetchFacility = async () => {
    try {
      setLoading(true)
      const endpoint = type === "hospital" ? `/api/facilities/hospitals/${id}` : `/api/facilities/clinics/${id}`
      const response = await api.get(endpoint)
      const data = response.data.data
      setFacility(data)

      if (type === "hospital") {
        setHospitalForm({
          name: data.name || "",
          registrationNumber: data.registrationNumber || "",
          email: data.email || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
          country: data.address?.country || "India",
          establishedYear: data.establishedYear?.toString() || "",
          numberOfBeds: data.numberOfBeds?.toString() || "",
          website: data.website || "",
          description: data.description || "",
          emergencyContact: data.contact?.emergencyContact || "",
          superAdminEmail: data.superAdminEmail || "",
          superAdminPassword: "",
          admins: data.admins || [],
          specializations: data.specializations || [],
          departments: data.departments || [],
          facilities: data.facilities || [],
          operatingHours: data.operatingHours || {
            Monday: { open: "09:00", close: "17:00" },
            Tuesday: { open: "09:00", close: "17:00" },
            Wednesday: { open: "09:00", close: "17:00" },
            Thursday: { open: "09:00", close: "17:00" },
            Friday: { open: "09:00", close: "17:00" },
            Saturday: { open: "09:00", close: "14:00" },
            Sunday: { open: "Closed", close: "Closed" },
          },
        })
      } else {
        setClinicForm({
          name: data.name || "",
          registrationNumber: data.registrationNumber || "",
          email: data.email || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
          country: data.address?.country || "India",
          establishedYear: data.establishedYear?.toString() || "",
          specialization: data.specialization || "",
          website: data.website || "",
          description: data.description || "",
          emergencyContact: data.contact?.emergencyContact || "",
          superAdminEmail: data.superAdminEmail || "",
          superAdminPassword: "",
          admins: data.admins || [],
          specializations: data.specializations || [],
          facilities: data.facilities || [],
          daysOfOperation: data.daysOfOperation || [],
        })
      }
    } catch (error: any) {
      console.error("Fetch error:", error)
      toast.error("Failed to load facility details")
      router.push("/facilities")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const endpoint = type === "hospital" ? `/api/facilities/hospitals/${id}` : `/api/facilities/clinics/${id}`
      
      let payload: Record<string, unknown>
      if (type === "hospital") {
        payload = {
          name: hospitalForm.name,
          email: hospitalForm.email,
          phone: hospitalForm.phone,
          address: {
            street: hospitalForm.street,
            city: hospitalForm.city,
            state: hospitalForm.state,
            pincode: hospitalForm.pincode,
            country: hospitalForm.country,
          },
          establishedYear: hospitalForm.establishedYear ? parseInt(hospitalForm.establishedYear) : undefined,
          numberOfBeds: hospitalForm.numberOfBeds ? parseInt(hospitalForm.numberOfBeds) : undefined,
          website: hospitalForm.website,
          description: hospitalForm.description,
          contact: {
            emergencyContact: hospitalForm.emergencyContact,
          },
          superAdminEmail: hospitalForm.superAdminEmail,
          admins: hospitalForm.admins,
          specializations: hospitalForm.specializations,
          departments: hospitalForm.departments,
          facilities: hospitalForm.facilities,
          operatingHours: hospitalForm.operatingHours,
        }
        
        if (hospitalForm.superAdminPassword) {
          payload.superAdminPassword = hospitalForm.superAdminPassword
        }
        
        if (facility && hospitalForm.registrationNumber !== (facility as Record<string, unknown>).registrationNumber) {
          payload.registrationNumber = hospitalForm.registrationNumber
        }
      } else {
        payload = {
          name: clinicForm.name,
          email: clinicForm.email,
          phone: clinicForm.phone,
          address: {
            street: clinicForm.street,
            city: clinicForm.city,
            state: clinicForm.state,
            pincode: clinicForm.pincode,
            country: clinicForm.country,
          },
          establishedYear: clinicForm.establishedYear ? parseInt(clinicForm.establishedYear) : undefined,
          specialization: clinicForm.specialization,
          website: clinicForm.website,
          description: clinicForm.description,
          contact: {
            emergencyContact: clinicForm.emergencyContact,
          },
          superAdminEmail: clinicForm.superAdminEmail,
          admins: clinicForm.admins,
          specializations: clinicForm.specializations,
          facilities: clinicForm.facilities,
          daysOfOperation: clinicForm.daysOfOperation,
        }
        
        if (clinicForm.superAdminPassword) {
          payload.superAdminPassword = clinicForm.superAdminPassword
        }
        
        if (facility && clinicForm.registrationNumber !== (facility as Record<string, unknown>).registrationNumber) {
          payload.registrationNumber = clinicForm.registrationNumber
        }
      }

      await api.put(endpoint, payload)
      toast.success(`${type === "hospital" ? "Hospital" : "Clinic"} updated successfully!`)
      router.push("/facilities")
    } catch (error) {
      console.error("Save error:", error)
      const errorMsg = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message || "Failed to update facility"
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/facilities")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit {type === "hospital" ? "Hospital" : "Clinic"}</h1>
            <p className="text-muted-foreground">{facility ? String((facility as Record<string, unknown>).name) : ''}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {type === "hospital" ? (
        // Hospital Edit Form
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about the hospital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hospital Name *</Label>
                  <Input
                    id="name"
                    value={hospitalForm.name}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    value={hospitalForm.registrationNumber}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, registrationNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={hospitalForm.email}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={hospitalForm.phone}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={hospitalForm.establishedYear}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, establishedYear: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfBeds">Number of Beds</Label>
                  <Input
                    id="numberOfBeds"
                    type="number"
                    min="10"
                    value={hospitalForm.numberOfBeds}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, numberOfBeds: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={hospitalForm.website}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description about the hospital..."
                  value={hospitalForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHospitalForm({ ...hospitalForm, description: e.target.value })}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">{hospitalForm.description.length}/1000 characters</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Physical location of the hospital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={hospitalForm.street}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, street: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={hospitalForm.city}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={hospitalForm.state}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={hospitalForm.pincode}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, pincode: e.target.value })}
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={hospitalForm.country}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, country: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  type="tel"
                  value={hospitalForm.emergencyContact}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, emergencyContact: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Super Admin & Additional Admins</CardTitle>
              <CardDescription>Manage admin access for this hospital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 pb-4 border-b">
                <h3 className="text-sm font-semibold">Super Admin</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="superAdminEmail">Super Admin Email</Label>
                    <Input
                      id="superAdminEmail"
                      type="email"
                      value={hospitalForm.superAdminEmail}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, superAdminEmail: e.target.value })}
                      placeholder="superadmin@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="superAdminPassword">Super Admin Password</Label>
                    <Input
                      id="superAdminPassword"
                      type="password"
                      value={hospitalForm.superAdminPassword}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, superAdminPassword: e.target.value })}
                      placeholder="Leave empty to keep current"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Additional Admins</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setHospitalForm({
                        ...hospitalForm,
                        admins: [...hospitalForm.admins, { name: "", mobile: "", email: "", password: "" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </div>

                {hospitalForm.admins.map((admin, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Admin {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setHospitalForm({
                            ...hospitalForm,
                            admins: hospitalForm.admins.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={admin.name}
                          onChange={(e) => {
                            const newAdmins = [...hospitalForm.admins]
                            newAdmins[index].name = e.target.value
                            setHospitalForm({ ...hospitalForm, admins: newAdmins })
                          }}
                          placeholder="Admin name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile</Label>
                        <Input
                          value={admin.mobile}
                          onChange={(e) => {
                            const newAdmins = [...hospitalForm.admins]
                            newAdmins[index].mobile = e.target.value
                            setHospitalForm({ ...hospitalForm, admins: newAdmins })
                          }}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={admin.email}
                          onChange={(e) => {
                            const newAdmins = [...hospitalForm.admins]
                            newAdmins[index].email = e.target.value
                            setHospitalForm({ ...hospitalForm, admins: newAdmins })
                          }}
                          placeholder="admin@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={admin.password}
                          onChange={(e) => {
                            const newAdmins = [...hospitalForm.admins]
                            newAdmins[index].password = e.target.value
                            setHospitalForm({ ...hospitalForm, admins: newAdmins })
                          }}
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {hospitalForm.admins.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No additional admins. Click "Add Admin" to create one.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Select all applicable departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {departmentOptions.map((dept) => (
                  <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hospitalForm.departments.includes(dept)}
                      onChange={() =>
                        toggleArrayItem(hospitalForm.departments, dept, (arr) =>
                          setHospitalForm({ ...hospitalForm, departments: arr })
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{dept}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
              <CardDescription>Available facilities and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {hospitalFacilityOptions.map((fac) => (
                  <label key={fac} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hospitalForm.facilities.includes(fac)}
                      onChange={() =>
                        toggleArrayItem(hospitalForm.facilities, fac, (arr) =>
                          setHospitalForm({ ...hospitalForm, facilities: arr })
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{fac}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
              <CardDescription>Enter specializations separated by commas</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., Heart Surgery, Brain Surgery, Cancer Treatment"
                value={hospitalForm.specializations.join(", ")}
                onChange={(e) =>
                  setHospitalForm({
                    ...hospitalForm,
                    specializations: e.target.value.split(",").map((s) => s.trim()).filter((s) => s),
                  })
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>Set working hours for each day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(hospitalForm.operatingHours).map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <Label className="w-28">{day}</Label>
                  <Input
                    type="time"
                    value={hospitalForm.operatingHours[day as keyof typeof hospitalForm.operatingHours].open}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        operatingHours: {
                          ...hospitalForm.operatingHours,
                          [day]: { ...hospitalForm.operatingHours[day as keyof typeof hospitalForm.operatingHours], open: e.target.value },
                        },
                      })
                    }
                    className="w-32"
                    disabled={hospitalForm.operatingHours[day as keyof typeof hospitalForm.operatingHours].open === "Closed"}
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={hospitalForm.operatingHours[day as keyof typeof hospitalForm.operatingHours].close}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        operatingHours: {
                          ...hospitalForm.operatingHours,
                          [day]: { ...hospitalForm.operatingHours[day as keyof typeof hospitalForm.operatingHours], close: e.target.value },
                        },
                      })
                    }
                    className="w-32"
                    disabled={hospitalForm.operatingHours[day as keyof typeof hospitalForm.operatingHours].close === "Closed"}
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hospitalForm.operatingHours[day as keyof typeof hospitalForm.operatingHours].open === "Closed"}
                      onChange={(e) =>
                        setHospitalForm({
                          ...hospitalForm,
                          operatingHours: {
                            ...hospitalForm.operatingHours,
                            [day]: e.target.checked ? { open: "Closed", close: "Closed" } : { open: "09:00", close: "17:00" },
                          },
                        })
                      }
                    />
                    <span className="text-sm">Closed</span>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Clinic Edit Form
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about the clinic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Clinic Name *</Label>
                  <Input
                    id="name"
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    value={clinicForm.registrationNumber}
                    onChange={(e) => setClinicForm({ ...clinicForm, registrationNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clinicForm.email}
                    onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={clinicForm.phone}
                    onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={clinicForm.establishedYear}
                    onChange={(e) => setClinicForm({ ...clinicForm, establishedYear: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <select
                    id="specialization"
                    value={clinicForm.specialization}
                    onChange={(e) => setClinicForm({ ...clinicForm, specialization: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Select specialization</option>
                    {clinicSpecializationOptions.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={clinicForm.website}
                  onChange={(e) => setClinicForm({ ...clinicForm, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description about the clinic..."
                  value={clinicForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClinicForm({ ...clinicForm, description: e.target.value })}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">{clinicForm.description.length}/1000 characters</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Physical location of the clinic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={clinicForm.street}
                  onChange={(e) => setClinicForm({ ...clinicForm, street: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={clinicForm.city}
                    onChange={(e) => setClinicForm({ ...clinicForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={clinicForm.state}
                    onChange={(e) => setClinicForm({ ...clinicForm, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={clinicForm.pincode}
                    onChange={(e) => setClinicForm({ ...clinicForm, pincode: e.target.value })}
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={clinicForm.country}
                    onChange={(e) => setClinicForm({ ...clinicForm, country: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  type="tel"
                  value={clinicForm.emergencyContact}
                  onChange={(e) => setClinicForm({ ...clinicForm, emergencyContact: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Super Admin & Additional Admins</CardTitle>
              <CardDescription>Manage admin access for this clinic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 pb-4 border-b">
                <h3 className="text-sm font-semibold">Super Admin</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-superAdminEmail">Super Admin Email</Label>
                    <Input
                      id="clinic-superAdminEmail"
                      type="email"
                      value={clinicForm.superAdminEmail}
                      onChange={(e) => setClinicForm({ ...clinicForm, superAdminEmail: e.target.value })}
                      placeholder="superadmin@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-superAdminPassword">Super Admin Password</Label>
                    <Input
                      id="clinic-superAdminPassword"
                      type="password"
                      value={clinicForm.superAdminPassword}
                      onChange={(e) => setClinicForm({ ...clinicForm, superAdminPassword: e.target.value })}
                      placeholder="Leave empty to keep current"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Additional Admins</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setClinicForm({
                        ...clinicForm,
                        admins: [...clinicForm.admins, { name: "", mobile: "", email: "", password: "" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </div>

                {clinicForm.admins.map((admin, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Admin {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setClinicForm({
                            ...clinicForm,
                            admins: clinicForm.admins.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={admin.name}
                          onChange={(e) => {
                            const newAdmins = [...clinicForm.admins]
                            newAdmins[index].name = e.target.value
                            setClinicForm({ ...clinicForm, admins: newAdmins })
                          }}
                          placeholder="Admin name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile</Label>
                        <Input
                          value={admin.mobile}
                          onChange={(e) => {
                            const newAdmins = [...clinicForm.admins]
                            newAdmins[index].mobile = e.target.value
                            setClinicForm({ ...clinicForm, admins: newAdmins })
                          }}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={admin.email}
                          onChange={(e) => {
                            const newAdmins = [...clinicForm.admins]
                            newAdmins[index].email = e.target.value
                            setClinicForm({ ...clinicForm, admins: newAdmins })
                          }}
                          placeholder="admin@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={admin.password}
                          onChange={(e) => {
                            const newAdmins = [...clinicForm.admins]
                            newAdmins[index].password = e.target.value
                            setClinicForm({ ...clinicForm, admins: newAdmins })
                          }}
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {clinicForm.admins.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No additional admins. Click "Add Admin" to create one.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
              <CardDescription>Available facilities and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {clinicFacilityOptions.map((fac) => (
                  <label key={fac} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clinicForm.facilities.includes(fac)}
                      onChange={() =>
                        toggleArrayItem(clinicForm.facilities, fac, (arr) =>
                          setClinicForm({ ...clinicForm, facilities: arr })
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{fac}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
              <CardDescription>Enter specializations separated by commas</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., Pediatric Care, Dental Surgery, Skin Treatment"
                value={clinicForm.specializations.join(", ")}
                onChange={(e) =>
                  setClinicForm({
                    ...clinicForm,
                    specializations: e.target.value.split(",").map((s) => s.trim()).filter((s) => s),
                  })
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Days of Operation</CardTitle>
              <CardDescription>Select operating days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {daysOptions.map((day) => (
                  <label key={day} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clinicForm.daysOfOperation.includes(day)}
                      onChange={() =>
                        toggleArrayItem(clinicForm.daysOfOperation, day, (arr) =>
                          setClinicForm({ ...clinicForm, daysOfOperation: arr })
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={() => router.push("/facilities")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
