import { useEffect, useState } from 'react';
import { FaPlus, FaSpinner, FaExclamationTriangle, FaEdit, FaComments, FaTrash, FaCheck, FaTimes, FaUpload, FaImage, FaFile, FaHistory } from 'react-icons/fa';
import axiosInstance from '../utils/axios';
import DOMPurify from 'dompurify';

interface ReportRemarkProps {
  applicationId?: string;
  financialYear?: string;
}

interface ReportRemark {
  id: string;
  farm_data_history_id: string;
  remark_text: string;
  uploads: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  status?: 'active' | 'deleted';
}

interface FarmDataHistory {
  id: string;
  application_id: string;
  farm_data_version_id: string;
  version_number: number;
  financial_year: string;
  timestamp: string;
}

export default function ReportRemark({ applicationId, financialYear }: ReportRemarkProps) {
  const [remarks, setRemarks] = useState<ReportRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<ReportRemark | null>(null);
  const [newRemark, setNewRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [histories, setHistories] = useState<FarmDataHistory[]>([]);
  const [loadingHistories, setLoadingHistories] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);

  // Fetch farm data histories
  useEffect(() => {
    const fetchHistories = async () => {
      if (!applicationId) return;

      try {
        setLoadingHistories(true);
        const response = await axiosInstance.get(`farm-data-histories/${applicationId}`);
        if (response.data) {
          // Filter histories to match the current financial year
          const matchingHistory = response.data.find((history: FarmDataHistory) => 
            history.financial_year === financialYear
          );
          setHistories(response.data);
          if (matchingHistory) {
            setCurrentVersionId(matchingHistory.id);
          }
        }
      } catch (err: any) {
        console.error('Error fetching histories:', err);
      } finally {
        setLoadingHistories(false);
      }
    };

    fetchHistories();
  }, [applicationId, financialYear]);

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
        
        const response = await axiosInstance.get(`report-remarks/${applicationId}/${financialYear}`, {
          params: {
            skip: 0,
            limit: 10
          }
        });

        if (isMounted) {
          if (!response.data) {
            throw new Error('No data received from server');
          }

          // Sort remarks by creation date (newest first)
          const sortedRemarks = response.data.sort((a: ReportRemark, b: ReportRemark) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          setRemarks(sortedRemarks);
        }
      } catch (err: any) {
        console.error('Error fetching remarks:', err);
        if (isMounted) {
          const errorMessage = err.response?.data?.detail || 
                             err.response?.data?.message || 
                             'Failed to load remarks. Please try again.';
          setError(errorMessage);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Each file must be less than 5MB');
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
        setError('Only JPG, JPEG, PNG & PDF files are allowed');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...validFiles]);
      
      // Create previews for images
      validFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUploadPreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else {
          // For PDFs, just add a placeholder
          setUploadPreviews(prev => [...prev, 'pdf']);
        }
      });
      
      setError('');
    }
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
    setUploadPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Generate random ID
  const generateRandomId = () => {
    return 'remark_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Create new remark
  const createRemark = async () => {
    if (!newRemark.trim() || !applicationId || !financialYear || isSubmitting) {
      console.log('Validation failed:', { 
        hasRemark: Boolean(newRemark.trim()), 
        hasApplicationId: Boolean(applicationId), 
        hasFinancialYear: Boolean(financialYear),
        isSubmitting
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const sanitizedRemark = DOMPurify.sanitize(newRemark.trim());
      
      // Upload files first if any
      const uploadedUrls: string[] = [];
      
      if (uploadFiles.length > 0) {
        for (const file of uploadFiles) {
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            console.log('Uploading file:', file.name);
            
            // Upload file to GCS first
            const uploadResponse = await axiosInstance.post('gcs-upload/', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('keycloak-token')}`
              },
            });
            
            if (uploadResponse.data?.filename) {
              // Store just the filename instead of full URL
              uploadedUrls.push(uploadResponse.data.filename);
              console.log('File uploaded successfully:', {
                filename: uploadResponse.data.filename
              });
            } else {
              console.warn('Upload response missing filename:', uploadResponse.data);
              throw new Error('Failed to get filename from upload');
            }
          } catch (uploadErr: any) {
            console.error('File upload failed:', {
              file: file.name,
              error: uploadErr.response?.data || uploadErr.message
            });
            throw new Error(`File upload failed: ${uploadErr.response?.data?.detail || uploadErr.message}`);
          }
        }
      }
      
      const requestData = {
        id: generateRandomId(),
        farm_data_history_id: currentVersionId,
        remark_text: sanitizedRemark,
        uploads: uploadedUrls
      };

      console.log('Creating remark with data:', requestData);
      
      const response = await axiosInstance.post('report-remark/', requestData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        console.error('Empty response from server');
        throw new Error('No response received from server');
      }

      console.log('Remark created successfully:', response.data);

      // Add new remark to the list
      setRemarks(prev => [response.data, ...prev]);
      setNewRemark('');
      setUploadFiles([]);
      setUploadPreviews([]);
      setIsAddingNew(false);
    } catch (err: any) {
      console.error('Error creating remark:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      let errorMessage = 'Failed to create remark. Please try again.';
      
      if (err.response?.data?.detail) {
        errorMessage = Array.isArray(err.response.data.detail) 
          ? err.response.data.detail[0]?.msg || 'Validation error'
          : err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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

      const sanitizedRemark = DOMPurify.sanitize(selectedRemark.remark_text.trim());
      
      const response = await axiosInstance.patch(`report-remark/${selectedRemark.id}`, {
        remark_text: sanitizedRemark,
        uploads: selectedRemark.uploads
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No response received from server');
      }

      // Update the remark in the list
      setRemarks(prev => prev.map(r => 
        r.id === selectedRemark.id ? response.data : r
      ));
      setSelectedRemark(null);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating remark:', err);
      const errorMessage = err.response?.data?.detail || 
                         err.response?.data?.message || 
                         'Failed to update remark. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete remark
  const deleteRemark = async (remarkId: string) => {
    if (!remarkId) {
      setError('Invalid remark ID. Cannot delete this remark.');
      setDeleteConfirmation(null);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await axiosInstance.delete(`report-remark/${remarkId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      // Remove the remark from the list
      setRemarks(prev => prev.filter(r => r.id !== remarkId));
      setDeleteConfirmation(null);
    } catch (err: any) {
      console.error('Error deleting remark:', err);
      const errorMessage = err.response?.data?.detail || 
                         err.response?.data?.message || 
                         'Failed to delete remark. Please try again.';
      setError(errorMessage);
      
      // Keep the delete confirmation dialog open on error
      if (err.response?.status !== 404) {
        setDeleteConfirmation(remarkId);
      } else {
        // If remark not found, remove it from the list
        setRemarks(prev => prev.filter(r => r.id !== remarkId));
        setDeleteConfirmation(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a validation function for remark ID
  const validateRemarkId = (id: string | null): boolean => {
    return Boolean(id && typeof id === 'string' && id.trim().length > 0);
  };

  // Update the delete confirmation handler
  const handleDeleteClick = (remarkId: string) => {
    if (!validateRemarkId(remarkId)) {
      setError('Invalid remark ID. Cannot delete this remark.');
      return;
    }
    setError(''); // Clear any existing errors
    setDeleteConfirmation(remarkId);
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
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaComments className="mr-2" />
            Report Remarks
          </h3>
          {loadingHistories ? (
            <FaSpinner className="animate-spin text-gray-400 h-4 w-4" />
          ) : histories.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <FaHistory className="mr-1" />
              <span>Version {histories[0]?.version_number || 1}</span>
            </div>
          )}
        </div>
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
          
          {/* History Information */}
          {histories.length > 0 && (
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <FaHistory className="mr-1" />
              <span>Adding remark for version {histories[0]?.version_number || 1}</span>
            </div>
          )}
          
          {/* File Upload Section */}
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaUpload className="text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Attachments</span>
            </div>
            
            {/* File Preview Grid */}
            {uploadPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {uploadPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    {preview === 'pdf' ? (
                      <div className="h-24 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaFile className="h-8 w-8 text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={preview}
                        alt={`Upload preview ${index + 1}`}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button */}
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors duration-200">
              <FaImage className="text-purple-600" />
              <span className="text-sm text-purple-600">Add Files</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: JPG, JPEG, PNG, PDF (max 5MB each)
            </p>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setNewRemark('');
                setUploadFiles([]);
                setUploadPreviews([]);
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
                  value={selectedRemark.remark_text}
                  onChange={(e) => setSelectedRemark({ ...selectedRemark, remark_text: e.target.value })}
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
                    disabled={!selectedRemark.remark_text.trim() || isSubmitting}
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
                      onClick={() => handleDeleteClick(remark.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors duration-200"
                      disabled={isSubmitting}
                      title="Delete remark"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{remark.remark_text}</p>
                </div>

                {/* Display Uploaded Files */}
                {remark.uploads && remark.uploads.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaFile className="text-gray-400" />
                      <span className="text-sm text-gray-600">Attachments</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {remark.uploads.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {url.toLowerCase().endsWith('.pdf') ? (
                            <div className="h-24 w-full bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                              <FaFile className="h-8 w-8 text-gray-400" />
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt={`Attachment ${index + 1}`}
                              className="h-24 w-full object-cover rounded-lg hover:opacity-75 transition-opacity duration-200"
                              onError={(e) => {
                                console.error('Image load failed:', url);
                                // Set a fallback image or hide the broken image
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

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