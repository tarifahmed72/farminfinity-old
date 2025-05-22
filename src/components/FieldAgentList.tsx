import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaUserPlus, FaSpinner, FaUpload, FaCheck, FaTimes, FaPhone, FaIdCard, FaUniversity, FaUser } from 'react-icons/fa';

interface FieldAgent {
  id: string;
  agent_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  registered_phone: string;
  profession: string;
  qualification: string;
  address: string;
  pan: string;
  poa_image: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  alternate_phone: string;
  fpo_reference_no: string;
  is_mapped: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
}

interface FormValidation {
  phone: boolean;
  pan: boolean;
  ifsc: boolean;
}

const FieldAgentList: React.FC = () => {
  const [agents, setAgents] = useState<FieldAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<FieldAgent | null>(null);
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<any>({});
  const [addSaving, setAddSaving] = useState(false);
  const [addErrorMsg, setAddErrorMsg] = useState<string | null>(null);
  
  // New state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10
  });

  const [poaFile, setPoaFile] = useState<File | null>(null);
  const [poaPreview, setPoaPreview] = useState<string>('');
  const [validation, setValidation] = useState<FormValidation>({
    phone: true,
    pan: true,
    ifsc: true
  });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://dev-api.farmeasytechnologies.com/api/field_agents/?skip=${(pagination.page - 1) * pagination.limit}&limit=${pagination.limit}`
      );
      setAgents(response.data);
      // If the API returns total count in headers or response metadata, update it
      if (response.headers['x-total-count']) {
        setPagination(prev => ({ ...prev, total: parseInt(response.headers['x-total-count']) }));
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [pagination.page, pagination.limit]);

  // Filter and search functions
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = searchTerm === '' || 
      `${agent.first_name} ${agent.middle_name} ${agent.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.registered_phone.includes(searchTerm) ||
      agent.agent_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && agent.active) || 
      (filterStatus === 'inactive' && !agent.active);
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handleRowClick = (agent: FieldAgent) => {
    setSelectedAgent(agent);
    setDetailsLoading(true);
    axios.get(`https://dev-api.farmeasytechnologies.com/api/field_agent/${agent.agent_id}`)
      .then(res => setAgentDetails(res.data))
      .finally(() => setDetailsLoading(false));
  };

  const closeModal = () => {
    setSelectedAgent(null);
    setAgentDetails(null);
    setEditMode(false);
    setEditForm({});
    setErrorMsg(null);
  };

  const handleEditClick = () => {
    setEditForm(agentDetails);
    setEditMode(true);
    setErrorMsg(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const patchFields: any = {};
      Object.keys(editForm).forEach(key => {
        if (editForm[key] !== agentDetails[key]) {
          patchFields[key] = editForm[key];
        }
      });
      await axios.patch(`https://dev-api.farmeasytechnologies.com/api/field_agent/${agentDetails.agent_id}`, patchFields);
      setAgentDetails({ ...agentDetails, ...patchFields });
      setEditMode(false);
      setAgents(prev => prev.map(a => a.agent_id === agentDetails.agent_id ? { ...a, ...patchFields } : a));
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to update agent');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  // Validation functions
  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);
  const validatePAN = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validateIFSC = (ifsc: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setAddErrorMsg('File size should be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setAddErrorMsg('Only JPG, JPEG & PNG files are allowed');
        return;
      }
      setPoaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPoaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAddErrorMsg(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    setAddErrorMsg(null);

    // Validate form
    const newValidation = {
      phone: validatePhone(addForm.registered_phone),
      pan: validatePAN(addForm.pan),
      ifsc: validateIFSC(addForm.ifsc_code)
    };
    setValidation(newValidation);

    if (!newValidation.phone || !newValidation.pan || !newValidation.ifsc) {
      setAddErrorMsg('Please correct the validation errors');
      setAddSaving(false);
      return;
    }

    try {
      let poaImageUrl = addForm.poa_image;
      
      // If there's a file to upload
      if (poaFile) {
        const formData = new FormData();
        formData.append('file', poaFile);
        
        // Upload the file first
        const uploadResponse = await axios.post('https://dev-api.farmeasytechnologies.com/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        poaImageUrl = uploadResponse.data.url; // Assuming the API returns the URL in this format
      }

      // Create the agent with the file URL
      await axios.post('https://dev-api.farmeasytechnologies.com/api/field_agent/', {
        ...addForm,
        poa_image: poaImageUrl
      });

      setShowAddModal(false);
      setAddForm({});
      setPoaFile(null);
      setPoaPreview('');
      fetchAgents();
    } catch (err: any) {
      setAddErrorMsg(err?.response?.data?.detail || 'Failed to create agent');
    } finally {
      setAddSaving(false);
    }
  };

  if (loading) {
    return <div>Loading field agents...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Field Agents</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            <FaUserPlus />
            <span>Add Agent</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, page: 1, limit: Number(e.target.value) }))}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-green-600 text-3xl" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No agents found
          </div>
        ) : (
          filteredAgents.map(agent => (
            <div
              key={agent.id}
              onClick={() => handleRowClick(agent)}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {[agent.first_name, agent.middle_name, agent.last_name].filter(Boolean).join(' ')}
                    </h3>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaIdCard className="text-gray-400" />
                      <span>{agent.agent_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="text-gray-400" />
                      <span>{agent.registered_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaUniversity className="text-gray-400" />
                      <span>{agent.profession}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  agent.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {agent.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={closeModal}
            >
              <span className="text-2xl">&times;</span>
            </button>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Field Agent Details</h3>
              {detailsLoading ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin text-green-600 text-3xl" />
                </div>
              ) : editMode ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">First Name</label>
                      <input name="first_name" value={editForm.first_name || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Middle Name</label>
                      <input name="middle_name" value={editForm.middle_name || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Last Name</label>
                      <input name="last_name" value={editForm.last_name || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Phone</label>
                      <input name="registered_phone" value={editForm.registered_phone || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Alternate Phone</label>
                      <input name="alternate_phone" value={editForm.alternate_phone || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Profession</label>
                      <input name="profession" value={editForm.profession || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Qualification</label>
                      <input name="qualification" value={editForm.qualification || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Address</label>
                      <input name="address" value={editForm.address || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">PAN</label>
                      <input name="pan" value={editForm.pan || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Bank Account No</label>
                      <input name="bank_account_no" value={editForm.bank_account_no || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Bank Name</label>
                      <input name="bank_name" value={editForm.bank_name || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">IFSC Code</label>
                      <input name="ifsc_code" value={editForm.ifsc_code || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                    </div>
                  </div>
                  {errorMsg && <div className="text-red-600 font-medium">{errorMsg}</div>}
                  <div className="flex gap-4 mt-4">
                    <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditMode(false)} disabled={saving}>Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </form>
              ) : agentDetails ? (
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Full Name</div>
                        <div className="mt-1 text-gray-900">
                          {[agentDetails.first_name, agentDetails.middle_name, agentDetails.last_name].filter(Boolean).join(' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Agent ID</div>
                        <div className="mt-1 text-gray-900">{agentDetails.agent_id}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Phone Number</div>
                        <div className="mt-1 text-gray-900">{agentDetails.registered_phone}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Alternate Phone</div>
                        <div className="mt-1 text-gray-900">{agentDetails.alternate_phone || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Profession</div>
                        <div className="mt-1 text-gray-900">{agentDetails.profession}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Qualification</div>
                        <div className="mt-1 text-gray-900">{agentDetails.qualification}</div>
                      </div>
                    </div>
                  </div>

                  {/* Address & Identity */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Address & Identity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                      <div className="col-span-full">
                        <div className="text-sm font-medium text-gray-500">Address</div>
                        <div className="mt-1 text-gray-900">{agentDetails.address}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">PAN</div>
                        <div className="mt-1 text-gray-900">{agentDetails.pan}</div>
                      </div>
                      {agentDetails.poa_image && (
                        <div className="col-span-full">
                          <div className="text-sm font-medium text-gray-500">Proof of Address</div>
                          <div className="mt-2">
                            <img src={agentDetails.poa_image} alt="Proof of Address" className="max-h-48 rounded-lg" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Bank Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Bank Name</div>
                        <div className="mt-1 text-gray-900">{agentDetails.bank_name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Account Number</div>
                        <div className="mt-1 text-gray-900">{agentDetails.bank_account_no}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">IFSC Code</div>
                        <div className="mt-1 text-gray-900">{agentDetails.ifsc_code}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Status Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-500">FPO Reference</div>
                        <div className="mt-1 text-gray-900">{agentDetails.fpo_reference_no}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Status</div>
                        <div className="mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            agentDetails.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {agentDetails.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Is Mapped</div>
                        <div className="mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            agentDetails.is_mapped
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {agentDetails.is_mapped ? 'Mapped' : 'Not Mapped'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Created At</div>
                        <div className="mt-1 text-gray-900">
                          {new Date(agentDetails.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={handleEditClick}
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">No details found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Field Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => { setShowAddModal(false); setAddForm({}); setAddErrorMsg(null); }}
            >
              <span className="text-2xl">&times;</span>
            </button>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold mb-4 text-green-700">Add Field Agent</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">First Name</label>
                    <input name="first_name" value={addForm.first_name || ''} onChange={handleAddChange} className="w-full border rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Middle Name</label>
                    <input name="middle_name" value={addForm.middle_name || ''} onChange={handleAddChange} className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Last Name</label>
                    <input name="last_name" value={addForm.last_name || ''} onChange={handleAddChange} className="w-full border rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registered Phone</label>
                    <div className="mt-1 relative">
                      <input
                        name="registered_phone"
                        value={addForm.registered_phone || ''}
                        onChange={(e) => {
                          handleAddChange(e);
                          setValidation(prev => ({
                            ...prev,
                            phone: validatePhone(e.target.value)
                          }));
                        }}
                        className={`w-full border rounded-lg p-2 pr-10 ${
                          !validation.phone && addForm.registered_phone
                            ? 'border-red-500 focus:ring-red-500'
                            : 'focus:ring-green-500'
                        }`}
                        required
                      />
                      {addForm.registered_phone && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {validation.phone ? (
                            <FaCheck className="text-green-500" />
                          ) : (
                            <FaTimes className="text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {!validation.phone && addForm.registered_phone && (
                      <p className="mt-1 text-sm text-red-500">
                        Please enter a valid 10-digit phone number starting with 6-9
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Alternate Phone</label>
                    <input name="alternate_phone" value={addForm.alternate_phone || ''} onChange={handleAddChange} className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Profession</label>
                    <input name="profession" value={addForm.profession || ''} onChange={handleAddChange} className="w-full border rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Qualification</label>
                    <input name="qualification" value={addForm.qualification || ''} onChange={handleAddChange} className="w-full border rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input name="address" value={addForm.address || ''} onChange={handleAddChange} className="w-full border rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PAN</label>
                    <div className="mt-1 relative">
                      <input
                        name="pan"
                        value={addForm.pan || ''}
                        onChange={(e) => {
                          handleAddChange(e);
                          setValidation(prev => ({
                            ...prev,
                            pan: validatePAN(e.target.value)
                          }));
                        }}
                        className={`w-full border rounded-lg p-2 pr-10 ${
                          !validation.pan && addForm.pan
                            ? 'border-red-500 focus:ring-red-500'
                            : 'focus:ring-green-500'
                        }`}
                        required
                      />
                      {addForm.pan && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {validation.pan ? (
                            <FaCheck className="text-green-500" />
                          ) : (
                            <FaTimes className="text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {!validation.pan && addForm.pan && (
                      <p className="mt-1 text-sm text-red-500">
                        Please enter a valid PAN (e.g., ABCDE1234F)
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Proof of Address</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {poaPreview ? (
                          <div className="relative">
                            <img src={poaPreview} alt="POA Preview" className="max-h-40 mx-auto" />
                            <button
                              type="button"
                              onClick={() => {
                                setPoaFile(null);
                                setPoaPreview('');
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <>
                            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Bank Account No</label>
                    <input name="bank_account_no" value={addForm.bank_account_no || ''} onChange={handleAddChange} className="w-full border rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Bank Name</label>
                    <input name="bank_name" value={addForm.bank_name || ''} onChange={handleAddChange} className="w-full border rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">IFSC Code</label>
                    <div className="mt-1 relative">
                      <input
                        name="ifsc_code"
                        value={addForm.ifsc_code || ''}
                        onChange={(e) => {
                          handleAddChange(e);
                          setValidation(prev => ({
                            ...prev,
                            ifsc: validateIFSC(e.target.value)
                          }));
                        }}
                        className={`w-full border rounded-lg p-2 pr-10 ${
                          !validation.ifsc && addForm.ifsc_code
                            ? 'border-red-500 focus:ring-red-500'
                            : 'focus:ring-green-500'
                        }`}
                        required
                      />
                      {addForm.ifsc_code && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {validation.ifsc ? (
                            <FaCheck className="text-green-500" />
                          ) : (
                            <FaTimes className="text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {!validation.ifsc && addForm.ifsc_code && (
                      <p className="mt-1 text-sm text-red-500">
                        Please enter a valid IFSC code (e.g., HDFC0123456)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">FPO Reference No</label>
                    <input name="fpo_reference_no" value={addForm.fpo_reference_no || ''} onChange={handleAddChange} className="w-full border rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Is Mapped</label>
                    <select name="is_mapped" value={addForm.is_mapped || ''} onChange={handleAddChange} className="w-full border rounded p-2" required>
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Active</label>
                    <select name="active" value={addForm.active || ''} onChange={handleAddChange} className="w-full border rounded p-2" required>
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
                {addErrorMsg && <div className="text-red-600 font-medium">{addErrorMsg}</div>}
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddForm({});
                      setAddErrorMsg(null);
                      setPoaFile(null);
                      setPoaPreview('');
                    }}
                    disabled={addSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-600 text-white"
                    disabled={addSaving}
                  >
                    {addSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldAgentList; 