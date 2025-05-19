import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FaFileAlt, FaSpinner, FaExclamationTriangle, FaChevronRight, FaCalendarAlt, FaClock } from 'react-icons/fa';

interface Application {
  id: string;
  farmer_id: string;
  application_no: string;
  status: number;
  timestamp: string;
}

const FarmerApplication: React.FC = () => {
  const { id: farmerId } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/applications/${farmerId}`
        );
        
        setApplications(response.data || []);
      } catch (err) {
        setError('Failed to fetch applications.');
      } finally {
        setLoading(false);
      }
    };

    if (farmerId) {
      fetchApplications();
    }
  }, [farmerId]);

  const handleRowClick = (appId: string) => {
    navigate(`/farmers_details/farmerId/${farmerId}/applicationId/${appId}`);
  };

  const formatStatus = () => {
    return { 
      label: 'Pending', 
      className: 'bg-yellow-100 text-yellow-700',
      borderColor: 'border-yellow-200'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner className="h-8 w-8 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center justify-center">
            <FaExclamationTriangle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FaFileAlt className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Farmer Applications</h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage and view applications for Farmer ID: <span className="font-medium text-gray-900">{farmerId}</span>
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center">
              <FaFileAlt className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500">This farmer hasn't submitted any applications yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => {
              const { label, className, borderColor } = formatStatus();
              return (
                <div
                  key={app.id}
                  onClick={() => handleRowClick(app.id)}
                  className={`bg-white rounded-xl shadow-sm border ${borderColor} hover:shadow-md transition-all cursor-pointer group overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <FaFileAlt className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Application</p>
                          <h3 className="font-semibold text-gray-900">{app.application_no}</h3>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
                        {label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="h-4 w-4 mr-2" />
                        <span>Created on {new Date(app.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="h-4 w-4 mr-2" />
                        <span>Last updated {new Date(app.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end text-sm font-medium text-green-600 group-hover:text-green-700">
                      View Details
                      <FaChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerApplication;
