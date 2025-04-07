"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

export default function VoucherDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [isLoading, setIsLoading] = useState(false);

  // Sample voucher data
  const [vouchers, setVouchers] = useState([
    {
      id: "v1",
      name: "Summer Discount",
      amount: "50",
      currency: "EUR",
      template: "classic",
      status: "active",
      createdAt: "2025-03-15",
      expiryDate: "2025-06-30",
      redemptions: 12,
      totalRedemptions: 50,
    },
    {
      id: "v2",
      name: "Welcome Gift",
      amount: "20",
      currency: "EUR",
      template: "modern",
      status: "active",
      createdAt: "2025-03-20",
      expiryDate: "2025-07-15",
      redemptions: 8,
      totalRedemptions: 100,
    },
    {
      id: "v3",
      name: "Winter Sale",
      amount: "100",
      currency: "EUR",
      template: "festive",
      status: "expired",
      createdAt: "2024-12-01",
      expiryDate: "2025-03-01",
      redemptions: 45,
      totalRedemptions: 50,
    },
    {
      id: "v4",
      name: "Loyalty Reward",
      amount: "25",
      currency: "EUR",
      template: "elegant",
      status: "active",
      createdAt: "2025-03-01",
      expiryDate: "2025-09-01",
      redemptions: 3,
      totalRedemptions: 200,
    },
    {
      id: "v5",
      name: "Spring Campaign",
      amount: "75",
      currency: "EUR",
      template: "modern",
      status: "draft",
      createdAt: "2025-04-01",
      expiryDate: "2025-08-15",
      redemptions: 0,
      totalRedemptions: 100,
    },
  ]);

  // Stats calculation
  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.status === "active").length,
    expired: vouchers.filter(v => v.status === "expired").length,
    draft: vouchers.filter(v => v.status === "draft").length,
  };

  const handleCreateVoucher = () => {
    router.push("/create-voucher");
  };

  const handleEditVoucher = (id: string) => {
    router.push(`/vouchers/edit/${id}`);
  };

  const handleDeleteVoucher = (id: string) => {
    if (confirm("Are you sure you want to delete this voucher?")) {
      setVouchers(vouchers.filter(v => v.id !== id));
    }
  };

  const handleDuplicateVoucher = (id: string) => {
    const voucherToDuplicate = vouchers.find(v => v.id === id);
    if (voucherToDuplicate) {
      const newVoucher = {
        ...voucherToDuplicate,
        id: `v${vouchers.length + 1}`,
        name: `${voucherToDuplicate.name} (Copy)`,
        status: "draft",
        createdAt: new Date().toISOString().split("T")[0],
        redemptions: 0,
      };
      setVouchers([...vouchers, newVoucher]);
    }
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    // Simulating an API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Filter and sort vouchers
  const filteredVouchers = vouchers
    .filter(voucher => {
      // Filter by status
      if (filterStatus !== "all" && voucher.status !== filterStatus) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        return voucher.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "amount") {
        return parseFloat(a.amount) - parseFloat(b.amount);
      } else if (sortBy === "expiryDate") {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      } else {
        // Default sort by createdAt
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expired": return "bg-gray-100 text-gray-800";
      case "draft": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-4">
              <Ticket className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-white font-bold text-3xl text-center">
              Voucher Dashboard
            </h1>
            <p className="text-white text-center mt-2">
              Manage and track all your vouchers in one place
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Vouchers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Expired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.draft}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Vouchers</CardTitle>
                  <CardDescription>
                    Manage your existing vouchers or create new ones
                  </CardDescription>
                </div>
                <Button 
                  className="mt-4 md:mt-0" 
                  onClick={handleCreateVoucher}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Voucher
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-grow">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search vouchers..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date Created</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="expiryDate">Expiry Date</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon" onClick={handleRefreshData}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Vouchers Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Voucher</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Redemptions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.length > 0 ? (
                      filteredVouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell className="font-medium">
                            <div>{voucher.name}</div>
                            <div className="text-sm text-gray-500">Created {voucher.createdAt}</div>
                          </TableCell>
                          <TableCell>
                            {voucher.currency} {voucher.amount}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(voucher.status)}>
                              {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{voucher.expiryDate}</TableCell>
                          <TableCell>
                            {voucher.redemptions}/{voucher.totalRedemptions}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(voucher.redemptions / voucher.totalRedemptions) * 100}%` }}
                              ></div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/vouchers/${voucher.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditVoucher(voucher.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateVoucher(voucher.id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => alert("Download functionality would go here")}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteVoucher(voucher.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No vouchers found. Create your first voucher to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredVouchers.length} of {vouchers.length} vouchers
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}