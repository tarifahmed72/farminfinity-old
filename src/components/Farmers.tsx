import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axios';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<PaginationResponse>(
          `/farmers/?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );

        // Adjust the data mapping to match the API response structure
        const fetchedFarmers = response.data.data.map((farmer: ApiFarmer) => ({
          id: farmer.id,
          name: farmer.name || "N/A",
          phone: farmer.phone_no,
          city: farmer.village || "N/A",
          status: farmer.status || 0,
          gender: "N/A", // Not available in API
          createdOn: new Date(farmer.created_at).toLocaleDateString(),
          approval: "N/A", // Not available in API
          amount: "N/A", // Not available in API
        }));

        setFarmers(fetchedFarmers);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error("Error fetching farmers:", error);
        setError("Failed to fetch farmers data");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, [currentPage]); // Re-fetch when page changes

  // Filtered farmers based on search query
  const filteredFarmers = farmers.filter(
    (farmer) =>
      (farmer.name && farmer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      farmer.phone.includes(searchQuery)
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">👨‍🌾 Farmer List</h1>

      {/* Filter section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <input
          placeholder="🔍 Search farmers"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 border border-blue-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700">
          <option>All Statuses</option>
          <option>Lead</option>
          <option>Contacted</option>
        </select>
      </div>

      {/* Error message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="text-gray-500">Loading farmers...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full text-sm text-left bg-white">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">City/Town</th>
                  <th className="px-4 py-3">Created On</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Loan Amt.</th>
                  <th className="px-4 py-3 text-center">⋮</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    onClick={() => navigate(`/farmers_applications/${farmer.id}`)}
                    className="hover:bg-blue-50 cursor-pointer border-b"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{farmer.name}</td>
                    <td className="px-4 py-3">{farmer.gender}</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{farmer.phone}</td>
                    <td className="px-4 py-3">{farmer.city || "—"}</td>
                    <td className="px-4 py-3">{farmer.createdOn}</td>
                    <td className="px-4 py-3 text-yellow-600">{farmer.status}</td>
                    <td className="px-4 py-3">{farmer.approval}</td>
                    <td className="px-4 py-3">{farmer.amount || "—"}</td>
                    <td className="px-4 py-3 text-center text-xl text-gray-500">⋮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={handlePrevPage}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              ⬅ Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Farmers;