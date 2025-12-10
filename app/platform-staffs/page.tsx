"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { hasModule } from "@/lib/permissions";
import { useAuth } from "@/components/AuthContext/AuthContext";

// UPDATED INTERFACE ACCORDING TO THE NEW API DATA STRUCTURE
type StaffPermissions =
  | string[]
  | {
      manageHome?: boolean;
      managePlatformStaffs?: boolean;
      platformStaffActions?: {
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
      };
      [key: string]: any;
    }
  | undefined;

interface PlatformStaff {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  systemrole?: string;
  permissions?: StaffPermissions;
}

export default function PlatformStaffsPage() {
  const [staffs, setStaffs] = useState<PlatformStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<PlatformStaff | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const permissions = user?.permissions || {};

  useEffect(() => {
    fetchStaffs();
  }, []);

  async function fetchStaffs() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/admin/staffs");
      const data = response.data.users;

      let staffData: PlatformStaff[] = Array.isArray(data)
        ? data
        : data.staffs || [];

      setStaffs(staffData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load platform staffs"
      );
    } finally {
      setLoading(false);
    }
  }

  // Instead of opening dialog, redirect to edit page
  function handleEditRedirect(staff: PlatformStaff) {
    router.push(`/platform-staffs/${staff.id}`);
  }

  // DELETE
  function openDeleteDialog(staff: PlatformStaff) {
    setDeletingStaff(staff);
    setDeleteDialogOpen(true);
  }
  async function handleDeleteStaff() {
    if (!deletingStaff) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/staffs/${deletingStaff.id}`);
      setStaffs((prev) =>
        prev.filter((staff) => staff.id !== deletingStaff.id)
      );
      toast.success("Platform staff deleted.");
      setDeleteDialogOpen(false);
      setDeletingStaff(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete staff."
      );
    } finally {
      setDeleting(false);
    }
  }

  // Utility to render permissions column
  function renderPermissions(permissions: StaffPermissions) {
    if (!permissions) return <span>—</span>;
    if (Array.isArray(permissions)) {
      return (
        <ul className="list-disc ml-4">
          {permissions.length === 0 ? (
            <li>—</li>
          ) : (
            permissions.map((perm) => <li key={perm}>{perm}</li>)
          )}
        </ul>
      );
    }
    if (typeof permissions === "object") {
      const list: string[] = [];
      for (const [k, v] of Object.entries(permissions)) {
        if (typeof v === "boolean") {
          list.push(`${k}: ${v ? "Yes" : "No"}`);
        } else if (typeof v === "object" && v !== null) {
          for (const [vk, vv] of Object.entries(v as object)) {
            list.push(`${k}.${vk}: ${vv ? "Yes" : "No"}`);
          }
        }
      }
      return (
        <ul className="list-disc ml-4">
          {list.length === 0 ? (
            <li>—</li>
          ) : (
            list.map((item) => <li key={item}>{item}</li>)
          )}
        </ul>
      );
    }
    return <span>—</span>;
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Platform Staffs</CardTitle>
          {hasModule(permissions, "managePlatformStaffs") && (
            <Button
              className="flex items-center gap-2"
              onClick={() => router.push("/platform-staffs/create")}
            >
              <Plus className="h-4 w-4" />
              Create Platform Staff
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading...
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No platform staffs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  staffs.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>{staff.phone || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            staff.isActive
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {staff.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>{staff.systemrole || "—"}</TableCell>

                      <TableCell>
                        {hasModule(permissions, "managePlatformStaffs") ? (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              aria-label="Edit"
                              onClick={() => handleEditRedirect(staff)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              aria-label="Delete"
                              onClick={() => openDeleteDialog(staff)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No Access
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Platform Staff</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deletingStaff?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteStaff}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
