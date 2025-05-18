import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

interface ReportRemark {
  id: string;
  remark: string;
  created_at: string;
  updated_at: string;
}

interface ReportRemarkProps {
  farmerId: string;
  applicationId?: string;
  financialYear?: string;
}

const ReportRemark: React.FC<ReportRemarkProps> = ({ 
  farmerId, 
  applicationId, 
  financialYear = "2024-25" // Default financial year
}) => {
  const [remarks, setRemarks] = useState<ReportRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRemark, setNewRemark] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Configure headers with token
  const getHeaders = () => ({
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Fetch remarks
  useEffect(() => {
    const fetchRemarks = async () => {
      try {
        setLoading(true);
        let response;
        
        // If applicationId is provided, use the new endpoint
        if (applicationId) {
          response = await axiosInstance.get(
            `/report-remarks/${applicationId}/${financialYear}?skip=0&limit=10`,
            getHeaders()
          );
        } else {
          // Fallback to farmer ID based endpoint if needed
          response = await axiosInstance.get(
            `/report-remark/${farmerId}`,
            getHeaders()
          );
        }
        
        setRemarks(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch remarks');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRemarks();
    } else {
      setError('Authentication token not found');
    }
  }, [farmerId, applicationId, financialYear, token]);

  // Add new remark
  const handleAddRemark = async () => {
    if (!newRemark.trim() || !token) return;

    try {
      const response = await axiosInstance.post('/report-remark', {
        farmer_id: farmerId,
        application_id: applicationId,
        financial_year: financialYear,
        remark: newRemark
      }, getHeaders());

      setRemarks([...remarks, response.data]);
      setNewRemark('');
      setIsAddingNew(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add remark');
    }
  };

  // Update remark
  const handleUpdateRemark = async (id: string) => {
    if (!editText.trim() || !token) return;

    try {
      const response = await axiosInstance.put(`/report-remark/${id}`, {
        remark: editText,
        application_id: applicationId,
        financial_year: financialYear
      }, getHeaders());

      setRemarks(remarks.map(r => r.id === id ? response.data : r));
      setEditingId(null);
      setEditText('');
    } catch (err: any) {
      setError(err.message || 'Failed to update remark');
    }
  };

  // Delete remark
  const handleDeleteRemark = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this remark?') || !token) return;

    try {
      await axiosInstance.delete(`/report-remark/${id}`, getHeaders());
      setRemarks(remarks.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete remark');
    }
  };

  if (!token) {
    return (
      <div className="p-4 text-red-600">
        Error: Authentication token not found. Please log in again.
      </div>
    );
  }

  if (loading) {
    return <div className="p-4">Loading remarks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            Report Remarks
          </h3>
          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center px-3 py-1 bg-white/10 rounded-md text-white hover:bg-white/20 transition-colors duration-200"
            >
              <FaPlus className="mr-2" />
              Add Remark
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Add New Remark Form */}
        {isAddingNew && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter your remark..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddRemark}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                <FaSave className="inline-block mr-2" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewRemark('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                <FaTimes className="inline-block mr-2" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Remarks List */}
        <div className="space-y-4">
          {remarks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No remarks found</p>
          ) : (
            remarks.map((remark) => (
              <div key={remark.id} className="bg-gray-50 rounded-lg p-4">
                {editingId === remark.id ? (
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleUpdateRemark(remark.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <FaSave className="inline-block mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                    >
                      <FaTimes className="inline-block mr-2" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800">{remark.remark}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(remark.created_at).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(remark.id);
                          setEditText(remark.remark);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteRemark(remark.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportRemark; 