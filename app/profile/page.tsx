"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthContext/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface AdminProfile {
  name: string;
  email: string;
  phone?: string;
  systemrole?: string;
  profileImage?: string | null;
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get("/api/admin/profile")
      .then((res) => setProfile(res.data.data))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await api.post("/api/admin/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newImageUrl = res.data.data.profileImage;
      setProfile((prev) => (prev ? { ...prev, profileImage: newImageUrl } : prev));
      if (user) setUser({ ...user, profileImage: newImageUrl });
      toast.success("Profile photo updated");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload profile photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return <div className="m-4 text-muted-foreground">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="m-4 text-muted-foreground">No profile data available</div>;
  }

  const initials = profile.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="m-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="size-20">
              <AvatarImage src={profile.profileImage ?? undefined} alt={profile.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              size="icon"
              className="absolute -bottom-1 -right-1 size-7 rounded-full"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          <div className="space-y-1">
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
            {profile.systemrole && (
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {profile.systemrole}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
