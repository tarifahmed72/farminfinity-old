import { useEffect, useState } from 'react';
import { FaPlus, FaSpinner, FaExclamationTriangle, FaEdit, FaComments, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import axiosInstance from '../utils/axios';
import DOMPurify from 'dompurify';

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
  status?: 'active' | 'deleted';
}

export default function ReportRemark({ farmerId, applicationId, financialYear }: ReportRemarkProps) {
  const [remarks, setRemarks] = useState<ReportRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<ReportRemark | null>(null);
  const [newRemark, setNewRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  // Fetch remarks
  useEffect(() => {
    let isMounted = true;

    async function fetchRemarks() {
      if (!applicationId || !financialYear) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const response = await axiosInstance.get(`/report-remarks/${applicationId}/${financialYear}`, {
          params: {
            skip: 0,
            limit: 50
          }
        });

        if (isMounted) {
          // Sort remarks by creation date (newest first)
          const sortedRemarks = response.data.sort((a: ReportRemark, b: ReportRemark) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setRemarks(sortedRemarks);
        }
      } catch (err: any) {
        console.error('Error fetching remarks:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load remarks. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRemarks();

    return () => {
      isMounted = false;
    };
  }, [applicationId, financialYear]);

  // Create new remark
  const createRemark = async () => {
    if (!newRemark.trim() || !applicationId || !financialYear || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      const sanitizedRemark = DOMPurify.sanitize(newRemark.trim());
      
      const response = await axiosInstance.post('/report-remark', {
        farmer_id: farmerId,
        application_id: applicationId,
        financial_year: financialYear,
        remark: sanitizedRemark,
        status: 'active'
      });

      // Add new remark to the list
      setRemarks(prev => [response.data, ...prev]);
      setNewRemark('');
      setIsAddingNew(false);
    } catch (err: any) {
      console.error('Error creating remark:', err);
      setError(err.response?.data?.message || 'Failed to create remark. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update remark
  const updateRemark = async () => {
    if (!selectedRemark || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      const sanitizedRemark = DOMPurify.sanitize(selectedRemark.remark.trim());
      
      const response = await axiosInstance.put(`/report-remark/${selectedRemark.id}`, {
        remark: sanitizedRemark
      });

      // Update the remark in the list
      setRemarks(prev => prev.map(r => 
        r.id === selectedRemark.id ? response.data : r
      ));
      setSelectedRemark(null);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating remark:', err);
      setError(err.response?.data?.message || 'Failed to update remark. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete remark
  const deleteRemark = async (remarkId: string) => {
    try {
      setIsSubmitting(true);
      setError('');

      await axiosInstance.patch(`/report-remark/${remarkId}`, {
        status: 'deleted'
      });

      // Remove the remark from the list
      setRemarks(prev => prev.filter(r => r.id !== remarkId));
      setDeleteConfirmation(null);
    } catch (err: any) {
      console.error('Error deleting remark:', err);
      setError(err.response?.data?.message || 'Failed to delete remark. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle missing required props
  if (!applicationId || !financialYear) {
    return (
      <div className="bg-yellow-50 rounded-lg p-4">
        <p className="text-yellow-700">Missing required information to load remarks.</p>
      </div>
    );
  }

  if (loading && !remarks.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="h-6 w-6 animate-spin text-purple-600 mr-3" />
        <p className="text-gray-600">Loading remarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 rounded-lg p-4 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaComments className="mr-2" />
          Report Remarks
        </h3>
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
            disabled={isSubmitting}
          >
            <FaPlus className="mr-2" />
            Add Remark
          </button>
        )}
      </div>

      {/* Add New Remark Form */}
      {isAddingNew && (
        <div className="bg-purple-50 rounded-lg p-4">
          <textarea
            value={newRemark}
            onChange={(e) => setNewRemark(e.target.value)}
            className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your remark..."
            rows={4}
            disabled={isSubmitting}
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setNewRemark('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={createRemark}
              disabled={!newRemark.trim() || isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Remark'
              )}
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
                  disabled={isSubmitting}
                />
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedRemark(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateRemark}
                    disabled={!selectedRemark.remark.trim() || isSubmitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(remark.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {remark.created_by && (
                      <p className="text-xs text-gray-400">
                        By: {remark.created_by}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRemark(remark);
                        setIsEditing(true);
                      }}
                      className="p-1 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                      disabled={isSubmitting}
                      title="Edit remark"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmation(remark.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors duration-200"
                      disabled={isSubmitting}
                      title="Delete remark"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{remark.remark}</p>
                </div>
                {remark.updated_at !== remark.created_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    Last edited: {new Date(remark.updated_at).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {remark.updated_by && ` by ${remark.updated_by}`}
                  </p>
                )}

                {/* Delete Confirmation Dialog */}
                {deleteConfirmation === remark.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <p className="text-red-700 mb-4">Are you sure you want to delete this remark?</p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setDeleteConfirmation(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center"
                        disabled={isSubmitting}
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteRemark(remark.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : (
                          <FaCheck className="mr-2" />
                        )}
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {!remarks.length && !loading && (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-6 inline-block">
              <FaComments className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No remarks available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 