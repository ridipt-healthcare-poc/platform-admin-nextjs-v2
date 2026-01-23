"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
];

function getInitialPermissions() {
  return {
    manageHome: false,
    managePlatformStaffs: false,
    platformStaffActions: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    manageFacilities: false,
    facilitiesActions: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
  };
}

export default function UpdatePlatformStaffPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [permissions, setPermissions] = useState(getInitialPermissions());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/api/admin/staffs/${id}`)
      .then((res) => {
        const staff = res.data.user || res.data.staff || res.data;
        setForm({
          name: staff.name || "",
          email: staff.email || "",
          phone: staff.phone || "",
        });
        // Merge to ensure fields present, but preserve existing structure
        setPermissions((old) => ({
          ...old,
          ...staff.permissions,
          platformStaffActions: {
            ...old.platformStaffActions,
            ...(staff.permissions?.platformStaffActions || {}),
          },
          facilitiesActions: {
            ...old.facilitiesActions,
            ...(staff.permissions?.facilitiesActions || {}),
          },
        }));
        setLoading(false);
      })
      .catch((err: unknown) => {
        setFetchError(
          (err as { response?: { data?: { message?: string; error?: string } }; message?: string })?.response?.data?.message ||
          (err as { response?: { data?: { message?: string; error?: string } }; message?: string })?.response?.data?.error ||
          (err as { response?: { data?: { message?: string; error?: string } }; message?: string })?.message ||
          "Failed to fetch staff data"
        );
        setLoading(false);
      });
  }, [id]);

  const handlePermChange = (permKey: string, checked: boolean) => {
    if (permKey.startsWith("platformStaffActions.")) {
      const p = permKey.split(".")[1];
      setPermissions((curr) => ({
        ...curr,
        platformStaffActions: { ...curr.platformStaffActions, [p]: checked },
      }));
    } else if (permKey.startsWith("facilitiesActions.")) {
      const p = permKey.split(".")[1];
      setPermissions((curr) => ({
        ...curr,
        facilitiesActions: { ...curr.facilitiesActions, [p]: checked },
      }));
    } else {
      setPermissions((curr) => ({
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
    setSaving(true);
    setFetchError(null);
    try {
      const res = await api.put(`/api/admin/staffs/${id}/permissions`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        permissions,
      });
      if (res.data.success) {
        toast.success("Platform Staff updated!");
        router.push("/platform-staffs");
      } else {
        toast.error(res.data.message || res.data.error || "Failed to update staff.");
      }
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string; error?: string } }; message?: string })?.response?.data?.message ||
        (err as { response?: { data?: { message?: string; error?: string } }; message?: string })?.response?.data?.error ||
        (err as { response?: { data?: { message?: string; error?: string } }; message?: string })?.message ||
        "Failed to update staff. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Platform Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading...
            </div>
          ) : fetchError ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          ) : (
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
              </div>

              {/* Permissions Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.group} className="border rounded-md p-4">
                      <div className="font-semibold mb-2">{group.group}</div>
                      <div className="flex flex-col gap-2">
                        {group.permissions.map((perm) => {
                          let checked = false;
                          if (perm.key.startsWith("platformStaffActions.")) {
                            const p = perm.key.split(".")[1] as keyof typeof permissions.platformStaffActions;
                            checked = !!permissions.platformStaffActions?.[p];
                          } else if (perm.key.startsWith("facilitiesActions.")) {
                            const p = perm.key.split(".")[1] as keyof typeof permissions.facilitiesActions;
                            checked = !!permissions.facilitiesActions?.[p];
                          } else {
                            checked = !!permissions[perm.key as keyof typeof permissions];
                          }
                          return (
                            <label key={perm.key} className="inline-flex items-center gap-2 cursor-pointer">
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
                <Button type="submit" className="ml-auto" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
