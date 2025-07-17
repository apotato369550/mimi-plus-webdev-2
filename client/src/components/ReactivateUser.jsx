"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./Dialog";
import { Label } from "./Label";
import Button from "./Button";

export function ReactivateUserModal({ isOpen, onClose, onReactivate }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch only inactive users for reactivation
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/customers?showInactive=true", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Filter users based on status - only show inactive users for reactivation
          const inactiveUsers = data.users.filter(user => user.status === 'inactive');
          setUsers(inactiveUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      onReactivate(selectedUser);
      setSelectedUser("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reactivate Customer</DialogTitle>
          <DialogDescription>
            This will reactivate the selected customer. Reactivated customers will be able to use their account again.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user">Select Customer to Reactivate</Label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a customer</option>
                {users.map((user) => (
                  <option key={user.userID} value={user.userID}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedUser}
            >
              Reactivate Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 