import { useEffect, useState } from 'react';
import { FaPlus, FaSpinner, FaExclamationTriangle, FaEdit, FaComments } from 'react-icons/fa';
import axiosInstance from '../utils/axios';

interface ReportRemarkProps {
  farmerId: string;
  applicationId?: string;
  financialYear?: string;
}

interface ReportRemark {
  id: string;
  farmer_id: string;
  application_id: string;
  financial_year: string;
  remark: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export default function ReportRemark({ farmerId, applicationId, financialYear }: ReportRemarkProps) {
  const [remarks, setRemarks] = useState<ReportRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<ReportRemark | null>(null);
  const [newRemark, setNewRemark] = useState('');

  // Fetch remarks
  useEffect(() => {
    async function fetchRemarks() {
      if (!applicationId || !financialYear) return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get('/report-remarks/', {
          params: {
            application_id: applicationId,
            financial_year: financialYear,
            skip: 0,
            limit: 10
          }
        });
        setRemarks(response.data);
      } catch (err) {
        console.error('Error fetching remarks:', err);
        setError('Failed to load remarks');
      } finally {
        setLoading(false);
      }
    }

    fetchRemarks();
  }, [applicationId, financialYear]);

  // Create new remark
  const createRemark = async () => {
    if (!newRemark.trim() || !applicationId || !financialYear) return;

    try {
      setLoading(true);
      await axiosInstance.post('/report-remark/', {
        farmer_id: farmerId,
        application_id: applicationId,
        financial_year: financialYear,
        remark: newRemark
      });

      // Refresh remarks list
      const response = await axiosInstance.get('/report-remarks/', {
        params: {
          application_id: applicationId,
          financial_year: financialYear,
          skip: 0,
          limit: 10
        }
      });
      setRemarks(response.data);
      setNewRemark('');
      setIsAddingNew(false);
    } catch (err) {
      console.error('Error creating remark:', err);
      setError('Failed to create remark');
    } finally {
      setLoading(false);
    }
  };

  // Update remark
  const updateRemark = async () => {
    if (!selectedRemark) return;

    try {
      setLoading(true);
      await axiosInstance.patch(`/report-remark/${selectedRemark.id}`, {
        remark: selectedRemark.remark
      });

      // Refresh remarks list
      const response = await axiosInstance.get('/report-remarks/', {
        params: {
          application_id: applicationId,
          financial_year: financialYear,
          skip: 0,
          limit: 10
        }
      });
      setRemarks(response.data);
      setSelectedRemark(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating remark:', err);
      setError('Failed to update remark');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !remarks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="h-8 w-8 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-600">Loading remarks...</p>
      </div>
    );
  }

  if (error && !remarks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <FaExclamationTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FaComments className="mr-2" />
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
          <div className="mb-6 bg-purple-50 rounded-lg p-4">
            <textarea
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your remark..."
              rows={4}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createRemark}
                disabled={!newRemark.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Remark
              </button>
            </div>
          </div>
        )}

        {/* Remarks List */}
        <div className="space-y-4">
          {remarks.map((remark) => (
            <div
              key={remark.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              {isEditing && selectedRemark?.id === remark.id ? (
                <div>
                  <textarea
                    value={selectedRemark.remark}
                    onChange={(e) => setSelectedRemark({ ...selectedRemark, remark: e.target.value })}
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                  />
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedRemark(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateRemark}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">
                      {new Date(remark.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRemark(remark);
                          setIsEditing(true);
                        }}
                        className="p-1 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{remark.remark}</p>
                </div>
              )}
            </div>
          ))}

          {!remarks.length && !loading && (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-6 inline-block">
                <FaComments className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No remarks available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 