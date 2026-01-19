"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";

const PERMISSION_GROUPS = [
  {
    group: "Home",
    permissions: [
      { key: "manageHome", label: "Manage Home" },
    ],
  },
  {
    group: "Platform Staffs",
    permissions: [
      { key: "managePlatformStaffs", label: "Manage Platform Staffs" },
      { key: "platformStaffActions.create", label: "Create Staff" },
      { key: "platformStaffActions.read", label: "Read Staff" },
      { key: "platformStaffActions.update", label: "Update Staff" },
      { key: "platformStaffActions.delete", label: "Delete Staff" },
    ],
  },
  {
    group: "Facilities",
    permissions: [
      { key: "manageFacilities", label: "Manage Facilities" },
      { key: "facilitiesActions.create", label: "Create Facility" },
      { key: "facilitiesActions.read", label: "Read Facility" },
      { key: "facilitiesActions.update", label: "Update Facility" },
      { key: "facilitiesActions.delete", label: "Delete Facility" },
    ],
  },
  // You can add more groups/permissions as desired
];

function getInitialPermissions(): any {
  return {
    manageHome: true,
    managePlatformStaffs: true,
    platformStaffActions: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    manageFacilities: true,
    facilitiesActions: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
  };
}

export default function CreatePlatformStaffPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [permissions, setPermissions] = useState<any>(getInitialPermissions());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePermChange = (permKey: string, checked: boolean) => {
    if (permKey.startsWith("platformStaffActions.")) {
      const p = permKey.split(".")[1];
      setPermissions((curr: any) => ({
        ...curr,
        platformStaffActions: { ...curr.platformStaffActions, [p]: checked },
      }));
    } else if (permKey.startsWith("facilitiesActions.")) {
      const p = permKey.split(".")[1];
      setPermissions((curr: any) => ({
        ...curr,
        facilitiesActions: { ...curr.facilitiesActions, [p]: checked },
      }));
    } else {
      setPermissions((curr: any) => ({
        ...curr,
        [permKey]: checked,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/admin/create-staff", {
        ...form,
        permissions,
      });
      if (res.data.success) {
        toast.success("Platform Staff created!");
        router.push("/platform-staff");
      } else {
        toast.error(res.data.error || "Failed to create staff.");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
        "Failed to create staff. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Platform Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* 3x3 Grid for main fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone (optional)"
                  className="mt-1"
                />
              </div>
              {/* Second row: Password and two empty columns */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  className="mt-1"
                />
              </div>
              <div />
              <div />
            </div>

            {/* Permissions Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PERMISSION_GROUPS.map((group, idx) => (
                  <div key={group.group} className="border rounded-md p-4">
                    <div className="font-semibold mb-2">{group.group}</div>
                    <div className="flex flex-col gap-2">
                      {group.permissions.map((perm) => {
                        let checked = false;
                        if (perm.key.startsWith("platformStaffActions.")) {
                          const p = perm.key.split(".")[1];
                          checked = !!permissions.platformStaffActions?.[p];
                        } else if (perm.key.startsWith("facilitiesActions.")) {
                          const p = perm.key.split(".")[1];
                          checked = !!permissions.facilitiesActions?.[p];
                        } else {
                          checked = !!permissions[perm.key];
                        }
                        return (
                          <label
                            key={perm.key}
                            className="inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                handlePermChange(perm.key, !!value)
                              }
                            />
                            <span>{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex mt-6">
              <Button type="submit" className="ml-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Staff"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
