"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import CoordinatorLayout from "@/components/layouts/CoordinatorLayout";
import TableSecurityLog from "@/components/TableSecurityLog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SecurityLogs } from "@/configs/types";

interface PaginationInfo {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

interface SecurityLogResponse {
  logs: SecurityLogs[];
  pagination: PaginationInfo;
}

export const SecurityLog: React.FC = () => {
  const { token, userRole, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState<SecurityLogs[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityLogs[]>([]); // State untuk logs yang sudah difilter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State untuk pencarian email
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      const response = await fetch(
        `http://localhost:5500/api/security-logs?page=${page}&perPage=${perPage}&showAll=${showAll}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load security logs");

      const data: SecurityLogResponse = await response.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
      setError(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load security logs. Please try again.";
      setError(errorMessage);
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!token || !userRole) {
      console.log(
        "Redirecting to login from SecurityLog - token:",
        token,
        "userRole:",
        userRole
      );
      navigate("/login");
      return;
    }

    if (userRole !== "COORDINATOR") {
      setError(
        "Access denied: You do not have permission to access this page."
      );
      navigate("/login");
      return;
    }

    fetchLogs();
  }, [authLoading, token, userRole, navigate, page, perPage, showAll]);

  // Efek untuk memfilter logs berdasarkan pencarian email
  useEffect(() => {
    const filtered = logs.filter((log) =>
      log.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLogs(filtered);
  }, [logs, searchQuery]);

  const getLogBadgeType = (action: string) => {
    const actionLower = action.toLowerCase();

    if (actionLower.includes("injection") || actionLower.includes("attack")) {
      return "danger";
    } else if (actionLower.includes("login failed")) {
      return "warning";
    } else if (actionLower.includes("login successful")) {
      return "success";
    } else if (actionLower.includes("registration successful")) {
      return "success";
    } else if (actionLower.includes("registration failed")) {
      return "warning";
    } else if (actionLower.includes("otp valid")) {
      return "success";
    } else if (actionLower.includes("otp invalid")) {
      return "warning";
    } else if (actionLower.includes("brute force")) {
      return "danger";
    } else {
      return "info";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <CoordinatorLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Log Keamanan
        </h1>
        <p className="text-primary md:text-base text-sm">
          Pantau aktivitas keamanan sistem
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden pt-2 pr-1 order-last">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex items-center">
              <input
                id="showAll"
                type="checkbox"
                checked={showAll}
                onChange={(e) => {
                  setShowAll(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showAll" className="ml-2 text-sm text-gray-700">
                Tampilkan semua log (termasuk yang lebih lama dari bulan lalu)
              </label>
            </div>
            <div className="ml-auto">
              <Button onClick={fetchLogs} size="sm">
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex gap-4 items-center mb-4 justify-between">
            <div className="relative flex-2 hidden md:block">
              <Search className="absolute left-2.5 top-1/4 h-4 w-4 text-primary-600" />
              <Input
                type="search"
                placeholder="Cari log berdasarkan email pengguna"
                className="w-full pl-8 bg-background border-primary-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={perPage.toString()}
              onValueChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Logs per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TableSecurityLog
            logs={filteredLogs}
            formatDate={formatDate}
            getLogBadgeType={getLogBadgeType}
            totalPages={totalPages}
            currentPage={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </div>
    </CoordinatorLayout>
  );
};

export default SecurityLog;
