import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { RefreshCw, Shield, Check, Clock, AlertCircle } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const supabase = createClient();

interface UserRole {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AdminPortalProps {
  userName: string;
}

export function AdminPortal({ userName }: AdminPortalProps) {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [assigningRole, setAssigningRole] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const roles = ["manager", "analyst", "reviewer"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !assigningRole) {
      toast.error("Please select a role");
      return;
    }

    try {
      setIsAssigning(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/admin/assign-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: selectedUser.email,
            role: assigningRole,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign role");
      }

      const data = await response.json();
      if (data.success) {
        toast.success(`Role assigned to ${selectedUser.email}`);
        setSelectedUser(null);
        setAssigningRole("");
        await fetchUsers();
      }
    } catch (error) {
      console.error("Assign error:", error);
      toast.error("Failed to assign role");
    } finally {
      setIsAssigning(false);
    }
  };

  const getPendingCount = () => users.filter((u) => !u.is_active).length;
  const getActiveCount = () => users.filter((u) => u.is_active).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Admin Panel</h2>
        <p className="text-[#7a8ba6]">Manage user roles and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111b2e] border-[#1a2742]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7a8ba6] mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <Shield className="h-8 w-8 text-[#22c55e]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111b2e] border-[#1a2742]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7a8ba6] mb-1">Active Users</p>
                <p className="text-3xl font-bold text-white">{getActiveCount()}</p>
              </div>
              <Check className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111b2e] border-[#1a2742]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7a8ba6] mb-1">Pending Assignment</p>
                <p className="text-3xl font-bold text-white">{getPendingCount()}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="bg-[#111b2e] border-[#1a2742]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-white">Users</CardTitle>
            <CardDescription className="text-[#7a8ba6]">
              Manage user roles and assignments
            </CardDescription>
          </div>
          <Button
            onClick={fetchUsers}
            disabled={loading}
            variant="outline"
            className="gap-2 border-[#2a3a4e] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-[#7a8ba6]">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#7a8ba6]">No users yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedUser?.id === user.id
                      ? "bg-[#1a2742] border-[#22c55e]/50"
                      : "bg-[#0b1120] border-[#2a3a4e] hover:border-[#3a4a5e]"
                  } cursor-pointer`}
                  onClick={() => {
                    setSelectedUser(user);
                    setAssigningRole(user.role);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white">{user.email}</p>
                      <p className="text-sm text-[#7a8ba6] mt-1">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {user.is_active ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 border border-green-500/30">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500 capitalize font-medium">
                            {user.role}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-amber-500 font-medium">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Assignment Panel */}
      {selectedUser && (
        <Card className="bg-[#111b2e] border-[#22c55e]/30 ring-1 ring-[#22c55e]/10">
          <CardHeader>
            <CardTitle className="text-white">Assign Role</CardTitle>
            <CardDescription className="text-[#7a8ba6]">
              Selected: <span className="text-[#c0cde0] font-medium">{selectedUser.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-[#c0cde0]">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setAssigningRole(role)}
                    className={`p-3 rounded-lg border-2 transition-all font-medium text-sm capitalize ${
                      assigningRole === role
                        ? "bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]"
                        : "bg-[#0b1120] border-[#2a3a4e] text-[#7a8ba6] hover:border-[#3a4a5e]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAssignRole}
                disabled={isAssigning || !assigningRole}
                className="flex-1 gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white disabled:opacity-50"
              >
                {isAssigning ? "Assigning..." : "Confirm Assignment"}
              </Button>
              <Button
                onClick={() => {
                  setSelectedUser(null);
                  setAssigningRole("");
                }}
                variant="outline"
                className="gap-2 border-[#2a3a4e] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
