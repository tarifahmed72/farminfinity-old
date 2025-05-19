import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axios';
import { FaSearch, FaSpinner, FaUser, FaList, FaThLarge, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import debounce from 'lodash/debounce';

interface ApiFarmer {
  id: string;
  farmer_id: string;
  phone_no: string;
  referral_id: string | null;
  name: string | null;
  village: string | null;
  status: number | null;
  created_at: string;
  updated_at: string;
}

interface DisplayFarmer {
  id: string;
  name: string;
  phone: string;
  city: string;
  status: number;
  gender: string;
  createdOn: string;
  approval: string;
  amount: string;
}

interface PaginationResponse {
  data: ApiFarmer[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const Farmers = () => {
  const [farmers, setFarmers] = useState<DisplayFarmer[]>([]);
  const [searchLoading, setSearchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const ITEMS_PER_PAGE = 20;

  // Create a debounced version of the fetch function
  const debouncedFetch = useCallback(
    debounce(async (query: string, status: string, page: number) => {
      try {
        setSearchLoading(true);
        setError(null);

        let url = `/farmers/?page=${page}&limit=${ITEMS_PER_PAGE}`;
        
        if (query.trim()) {
          url += `&search=${encodeURIComponent(query.trim())}`;
        }
        if (status !== 'all') {
          url += `&status=${status}`;
        }

        const token = localStorage.getItem('keycloak-token');
        const response = await axiosInstance.get<PaginationResponse>(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error('Invalid response format from API');
        }

        const fetchedFarmers = response.data.data.map((farmer: ApiFarmer) => ({
          id: farmer.id,
          name: farmer.name || "N/A",
          phone: farmer.phone_no,
          city: farmer.village || "N/A",
          status: farmer.status || 0,
          gender: "N/A",
          createdOn: new Date(farmer.created_at).toLocaleDateString(),
          approval: "N/A",
          amount: "N/A",
        }));

        setFarmers(fetchedFarmers);
        setTotalItems(response.data.total);
        setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
        setError(null);
      } catch (error: any) {
        console.error("Error fetching farmers:", error);
        setError(error.response?.data?.detail || "Failed to fetch farmers data. Please try again.");
        setFarmers([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch(searchQuery, selectedStatus, currentPage);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchQuery, selectedStatus, currentPage, debouncedFetch]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2:
        return 'bg-green-100 text-green-800';
      default: // Leads
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 2:
        return 'Submitted';
      default:
        return 'Leads';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when changing status
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            currentPage === i
              ? 'bg-green-100 text-green-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          disabled={searchLoading}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farmers Directory</h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalItems} farmers found
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <FaThLarge className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <FaList className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or phone number"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={searchLoading}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaSpinner className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="md:w-48">
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={searchLoading}
              >
                <option value="all">All Statuses</option>
                <option value="2">Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* No results message */}
        {!searchLoading && farmers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="flex flex-col items-center">
              <FaSearch className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try a different search term.`
                  : "No farmers available in the system."}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {searchLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner className="h-8 w-8 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Loading farmers...</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {farmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    onClick={() => navigate(`/farmers_applications/${farmer.id}`)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                            <p className="text-sm text-gray-500">{farmer.phone}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(farmer.status)}`}>
                          {getStatusText(farmer.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Location</span>
                          <span className="text-gray-900">{farmer.city}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Created</span>
                          <span className="text-gray-900">{farmer.createdOn}</span>
                        </div>
                        {farmer.amount !== "N/A" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Loan Amount</span>
                            <span className="text-gray-900">{farmer.amount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100">
                <table className="w-full text-sm text-left bg-white">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Created On</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmers.map((farmer) => (
                      <tr
                        key={farmer.id}
                        onClick={() => navigate(`/farmers_applications/${farmer.id}`)}
                        className="hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{farmer.name}</td>
                        <td className="px-6 py-4 text-blue-600">{farmer.phone}</td>
                        <td className="px-6 py-4 text-gray-600">{farmer.city}</td>
                        <td className="px-6 py-4 text-gray-600">{farmer.createdOn}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(farmer.status)}`}>
                            {getStatusText(farmer.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{farmer.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  Showing {farmers.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} farmers
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || searchLoading}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FaChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {renderPaginationNumbers()}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages || searchLoading}
                  className={`flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium ${
                    currentPage >= totalPages || searchLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50 cursor-pointer'
                  } transition-colors`}
                >
                  Next
                  <FaChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Farmers;