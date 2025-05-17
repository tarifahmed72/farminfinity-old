import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
const Farmers = () => {
  const navigate = useNavigate();

  const hardcodedFarmers = [
    {
      id: 1,
      name: "Kaustav",
      gender: "Male",
      phone: "8399051459",
      city: "",
      createdOn: "11-Nov-2024",
      status: "Lead",
      approval: "None",
      amount: "",
    },
    {
      id: 2,
      name: "Pragyan",
      gender: "Male",
      phone: "7575985255",
      city: "",
      createdOn: "28-Aug-2024",
      status: "Lead",
      approval: "None",
      amount: "",
    },
    {
      id: 3,
      name: "Santanu",
      gender: "Male",
      phone: "8011051894",
      city: "",
      createdOn: "28-Aug-2024",
      status: "Lead",
      approval: "None",
      amount: "",
    },
    {
      id: 4,
      name: "Anant",
      gender: "Male",
      phone: "8822009123",
      city: "Golaghat",
      createdOn: "15-Jul-2024",
      status: "Lead",
      approval: "None",
      amount: "Rs.5,000-Rs.10,000",
    },
  ];

  const [farmers, setFarmers] = useState(hardcodedFarmers);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const farmersPerPage = 5;

  useEffect(() => {
    const fetchFarmers = async () => {
      const token = localStorage.getItem("keycloak-token");

      if (!token) {
        setError("No auth token found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("https://dev-api.farmeasytechnologies.com/api/farmers/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Adjust the data mapping to match the API response structure
        const fetchedFarmers = response.data.data.map((farmer: ApiFarmer) => ({
          id: farmer.id,
          name: farmer.name || "N/A", // Handle cases where name is null
          gender: "N/A", // Gender is not present in the API response
          phone: farmer.phone_no,
          city: farmer.village || "N/A", // Assuming 'village' maps to city
          createdOn: new Date(farmer.created_at).toLocaleDateString(), // Format the date
          status: getStatusText(farmer.status), // Function to convert status code to text
          approval: "N/A", // Approval is not present in the API response
          amount: "N/A", // Amount is not present in the API response
          // You might need to fetch additional details for gender, approval, and amount
        }));

        setFarmers([...hardcodedFarmers, ...fetchedFarmers]);
      } catch (err) {
        console.error("Error fetching farmers:", err);
        setError("Failed to fetch farmer data. Check token or permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const getStatusText = (status: Number|null) => {
    switch (status) {
      case 1:
        return "Lead";
      case 2:
        return "Contacted";
      // Add more status mappings as needed based on your API documentation
      default:
        return "Unknown";
    }
  };

  // Filtered farmers based on search query
  const filteredFarmers = farmers.filter(
    (farmer) =>
      (farmer.name && farmer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      farmer.phone.includes(searchQuery)
  );

  // Pagination logic
  const indexOfLastFarmer = currentPage * farmersPerPage;
  const indexOfFirstFarmer = indexOfLastFarmer - farmersPerPage;
  const currentFarmers = filteredFarmers.slice(indexOfFirstFarmer, indexOfLastFarmer);
  const totalPages = Math.ceil(filteredFarmers.length / farmersPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
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
          {/* Add more status options based on your getStatusText function */}
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
                {currentFarmers.map((farmer) => (
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
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ⬅ Prev
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
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