"use client";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, logout, isLoggingOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Money Tracker
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Hello, {user.name || user.email}!
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-8">
                <p>User ID: {user.id}</p>
                <p>Email: {user.email}</p>
                {user.name && <p>Name: {user.name}</p>}
              </div>
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}