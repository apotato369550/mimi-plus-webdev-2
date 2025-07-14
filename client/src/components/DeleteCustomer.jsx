"use client"
import { useState, useEffect } from "react"

export function DeleteCustomerModal({ isOpen, onClose, onDelete }) {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
    }
  }, [isOpen])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      } else {
        console.error("Failed to fetch customers")
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (selectedCustomer) {
      onDelete(selectedCustomer)
      setSelectedCustomer("")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Delete Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="customer-select" className="text-right text-sm font-medium text-gray-700">
              Select Customer
            </label>
            <select
              id="customer-select"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="col-span-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select a customer to delete</option>
              {customers.map((customer) => (
                <option key={customer.customerID} value={customer.customerID}>
                  {customer.name} - {customer.email} ({customer.pointsBalance} points)
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <p className="text-gray-500 text-sm col-span-4 text-center">Loading customers...</p>
          )}

          {selectedCustomer && (
            <div className="mt-2 p-3 border border-red-200 rounded-md bg-red-50">
              <p className="text-sm font-medium text-red-900">
                ⚠️ This action cannot be undone. The selected customer will be permanently deleted along with all their data.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!selectedCustomer}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              !selectedCustomer ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            Delete Customer
          </button>
        </div>
      </div>
    </div>
  )
}
