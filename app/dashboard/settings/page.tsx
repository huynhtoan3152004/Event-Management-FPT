"use client";

import { useEffect, useState } from "react";
import { User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

import { userService, StudentProfile } from "@/lib/services/user.service";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [studentCode, setStudentCode] = useState("");

  /* =========================
     GET profile
  ========================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const data = res.data.data;

        setProfile(data);
        setName(data.name);
        setPhone(data.phone || "");
        setStudentCode(data.studentCode || "");
      } catch {
        toast.error("Không thể tải thông tin profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* =========================
     UPDATE profile
  ========================= */
  const handleSave = async () => {
    if (!name.trim()) {
      toast.warning("Tên không được để trống");
      return;
    }

    setSaving(true);
    try {
      await userService.updateProfile({
        name,
        phone,
        studentCode: studentCode || null,
      });

      toast.success("Cập nhật thông tin thành công");
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin sinh viên
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Họ và tên</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>

            <div className="grid gap-2">
              <Label>Số điện thoại</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="grid gap-2">
              <Label>Mã sinh viên</Label>
              <Input
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="Nhập mã sinh viên"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
