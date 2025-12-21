"use client";
import { OrganizerHeader } from "@/components/organizer/header";
import { useEffect, useRef, useState } from "react";
import { Search, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { adminUserService, AdminUser } from "@/lib/services/admin.user.service";

type Role = "student" | "staff" | "organizer";

export default function ManageUserPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<Role[]>(["staff", "student"]);

  /* ===== VIEW / EDIT ===== */
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [updating, setUpdating] = useState(false);

  /* ===== CREATE USER ===== */
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<Role | "">("");
  const [newPassword, setNewPassword] = useState("");

  const fetchedRef = useRef(false);

  /* =========================
     FETCH USERS
  ========================= */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getUsersByRole({
        role: undefined as any,
        page: 1,
        pageSize: 100,
      });
      setUsers(res.data.data);
    } catch {
      toast.error("Không thể tải danh sách users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUsers();
  }, []);

  /* =========================
     FILTER
  ========================= */
  const filteredUsers = users.filter((u) => {
    const matchRole = roles.length === 0 || roles.includes(u.roleId as Role);
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const toggleRole = (role: Role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  /* =========================
     UPDATE ROLE
  ========================= */
  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;

    if (selectedRole === selectedUser.roleId) {
      toast.info("Role không thay đổi");
      return;
    }

    setUpdating(true);
    try {
      await adminUserService.updateUserRole(selectedUser.userId, selectedRole);
      toast.success("Cập nhật role thành công");
      setSelectedUser(null);
      fetchUsers();
    } catch {
      toast.error("Cập nhật role thất bại");
    } finally {
      setUpdating(false);
    }
  };

  /* =========================
     CREATE USER (FormData)
  ========================= */
  const handleCreateUser = async () => {
    if (!newName || !newEmail || !newRole || !newPassword) {
      toast.warning("Vui lòng nhập đầy đủ Name, Email, Password và Role");
      return;
    }

    const formData = new FormData();
    formData.append("name", newName);
    formData.append("email", newEmail);
    formData.append("password", newPassword);
    formData.append("confirmPassword", newPassword);
    formData.append("roleId", newRole);
    if (newPhone) formData.append("phone", newPhone);

    setCreating(true);
    try {
      await adminUserService.createUser(formData);
      toast.success("Tạo user thành công");
      setOpenCreate(false);

      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewRole("");
      setNewPassword("");

      fetchUsers();
    } catch {
      toast.error("Tạo user thất bại");
    } finally {
      setCreating(false);
    }
  };

 return (
   <>
     <OrganizerHeader title="Manage Users" />

     <main className="flex-1 p-4 lg:p-6 space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-semibold">
             Quản lý tài khoản theo role
           </h1>

         </div>

         <Button onClick={() => setOpenCreate(true)}>
           <Plus className="h-4 w-4 mr-2" />
          Tạo tài khoản người dùng 
         </Button>
       </div>

       {/* Filters */}
       <div className="flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center gap-6">
           {(["staff", "student", "organizer"] as Role[]).map((role) => (
             <div key={role} className="flex items-center gap-2">
               <Checkbox
                 checked={roles.includes(role)}
                 onCheckedChange={() => toggleRole(role)}
               />
               <Label className="capitalize">{role}</Label>
             </div>
           ))}
         </div>

         <div className="relative w-64">
           <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input
             className="pl-9"
             placeholder="tìm kiếm..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
         </div>
       </div>

       {/* Table */}
       {loading ? (
         <Skeleton className="h-64 w-full" />
       ) : (
         <div className="border rounded-lg">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Tên</TableHead>
                 <TableHead>Email</TableHead>
                 <TableHead>Số điện thoại</TableHead>
                 <TableHead>Role</TableHead>
                 <TableHead>Trạng thái</TableHead>
                 <TableHead>Tạo lúc</TableHead>
               </TableRow>
             </TableHeader>

             <TableBody>
               {filteredUsers.map((u) => (
                 <TableRow
                   key={u.userId}
                   className="cursor-pointer hover:bg-muted/50"
                   onClick={() => {
                     setSelectedUser(u);
                     setSelectedRole(u.roleId as Role);
                   }}
                 >
                   <TableCell className="font-medium">{u.name}</TableCell>
                   <TableCell>{u.email}</TableCell>
                   <TableCell>{u.phone || "—"}</TableCell>
                   <TableCell>
                     <Badge variant="outline">{u.roleName}</Badge>
                   </TableCell>
                   <TableCell>
                     <Badge
                       variant={u.status === "active" ? "default" : "secondary"}
                     >
                       {u.status}
                     </Badge>
                   </TableCell>
                   <TableCell>
                     {new Date(u.createdAt).toLocaleDateString()}
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       )}

       {/* ================= CREATE USER ================= */}
       <Dialog open={openCreate} onOpenChange={setOpenCreate}>
         <DialogContent className="max-w-xl">
           <DialogHeader>
             <DialogTitle>Tạo tài khoản người dùng</DialogTitle>
           </DialogHeader>

           <div className="space-y-4">
             <div className="space-y-1">
               <Label>Tên *</Label>
               <Input
                 value={newName}
                 onChange={(e) => setNewName(e.target.value)}
               />
             </div>

             <div className="space-y-1">
               <Label>Email *</Label>
               <Input
                 type="email"
                 value={newEmail}
                 onChange={(e) => setNewEmail(e.target.value)}
               />
             </div>

             <div className="space-y-1">
               <Label>Mật khẩu *</Label>
               <Input
                 type="password"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
               />
             </div>

             <div className="space-y-1">
               <Label>Số điện thoại</Label>
               <Input
                 value={newPhone}
                 onChange={(e) => setNewPhone(e.target.value)}
               />
             </div>

             <div className="space-y-1">
               <Label>Role *</Label>
               <Select
                 value={newRole}
                 onValueChange={(v) => setNewRole(v as Role)}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Chọn Role" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="student">Student</SelectItem>
                   <SelectItem value="staff">Staff</SelectItem>
                   <SelectItem value="organizer">Organizer</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="flex justify-end gap-3 pt-4">
               <Button variant="outline" onClick={() => setOpenCreate(false)}>
                 Hủy
               </Button>
               <Button onClick={handleCreateUser} disabled={creating}>
                 {creating ? "Creating..." : "Tạo "}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* ================= EDIT USER ROLE ================= */}
       <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
         <DialogContent className="max-w-xl">
           <DialogHeader>
             <DialogTitle>Chỉnh sửa người dùng </DialogTitle>
           </DialogHeader>

           {selectedUser && (
             <div className="space-y-5">
               {/* NAME */}
               <div className="space-y-1">
                 <Label>Tên</Label>
                 <Input value={selectedUser.name} disabled />
               </div>

               {/* EMAIL */}
               <div className="space-y-1">
                 <Label>Email</Label>
                 <Input value={selectedUser.email} disabled />
               </div>

               {/* PHONE */}
               <div className="space-y-1">
                 <Label>Số điện thoại</Label>
                 <Input value={selectedUser.phone || "—"} disabled />
               </div>

               {/* ROLE + STATUS */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <Label>Role</Label>
                   <Select
                     value={selectedRole}
                     onValueChange={(v) => setSelectedRole(v as Role)}
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="student">Student</SelectItem>
                       <SelectItem value="staff">Staff</SelectItem>
                       <SelectItem value="organizer">Organizer</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="space-y-1">
                   <Label>Trạng Thái</Label>
                   <Input value={selectedUser.status} disabled />
                 </div>
               </div>

               {/* CREATED AT */}
               <div className="space-y-1">
                 <Label>Tạo lúc </Label>
                 <Input
                   value={new Date(selectedUser.createdAt).toLocaleString()}
                   disabled
                 />
               </div>

               {/* FOOTER */}
               <div className="flex justify-end gap-3 pt-4">
                 <Button
                   variant="outline"
                   onClick={() => setSelectedUser(null)}
                 >
                   Hủy
                 </Button>
                 <Button onClick={handleUpdateRole} disabled={updating}>
                   {updating ? "Saving..." : "Lưu thay đổi"}
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </main>
   </>
 );
}
