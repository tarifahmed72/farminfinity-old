import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import axiosInstance from '../utils/axios';

interface CreateFPOProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateFPO: React.FC<CreateFPOProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fpo_id: '',
    constitution: '',
    entity_name: '',
    no_of_farmers: null as number | null,
    address: '',
    state: '',
    district: '',
    area_of_operation: null as number | null,
    establishment_year: '',
    major_crop_produced: [''],
    previous_year_turnover: null as number | null,
    contact_person_name: '',
    contact_person_phone: '',
    pan_no: '',
    is_pan_copy_collected: false,
    pan_image: '',
    is_incorporation_doc_collected: false,
    incorporation_doc_img: '',
    is_registration_no_collected: false,
    registration_no: '',
    registration_no_img: '',
    is_director_shareholder_list_collected: false,
    director_shareholder_list_image: '',
    active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format the data before sending
      const formattedData = {
        ...formData,
        // Convert empty strings to null
        fpo_id: formData.fpo_id || null,
        constitution: formData.constitution || null,
        entity_name: formData.entity_name || null,
        no_of_farmers: formData.no_of_farmers,
        address: formData.address || null,
        state: formData.state || null,
        district: formData.district || null,
        area_of_operation: formData.area_of_operation,
        establishment_year: formData.establishment_year || null,
        previous_year_turnover: formData.previous_year_turnover,
        contact_person_name: formData.contact_person_name || null,
        contact_person_phone: formData.contact_person_phone || null,
        pan_no: formData.pan_no || null,
        registration_no: formData.registration_no || null,
        // Handle image fields
        pan_image: formData.pan_image || null,
        incorporation_doc_img: formData.incorporation_doc_img || null,
        registration_no_img: formData.registration_no_img || null,
        director_shareholder_list_image: formData.director_shareholder_list_image || null,
        // Handle arrays
        major_crop_produced: formData.major_crop_produced.filter(crop => crop.trim() !== '') || null
      };

      // Log the request data in development
      if (import.meta.env.DEV) {
        console.log('Creating FPO with data:', formattedData);
      }

      const response = await axiosInstance.post('/fpo/', formattedData);
      
      // Log the response in development
      if (import.meta.env.DEV) {
        console.log('FPO created successfully:', response.data);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error creating FPO:', error);
      
      // Handle different types of error responses
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (typeof error.response?.data === 'string') {
        setError(error.response.data);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to create FPO. Please check your input and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      major_crop_produced: value ? [value] : [''] // Allow empty array
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New FPO</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FPO ID
            </label>
            <input
              type="text"
              name="fpo_id"
              value={formData.fpo_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Name
            </label>
            <input
              type="text"
              name="entity_name"
              value={formData.entity_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Constitution
            </label>
            <input
              type="text"
              name="constitution"
              value={formData.constitution}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Farmers
            </label>
            <input
              type="number"
              name="no_of_farmers"
              value={formData.no_of_farmers ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Location Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area of Operation (in acres)
            </label>
            <input
              type="number"
              name="area_of_operation"
              value={formData.area_of_operation ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Business Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Establishment Year
            </label>
            <input
              type="text"
              name="establishment_year"
              value={formData.establishment_year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous Year Turnover
            </label>
            <input
              type="number"
              name="previous_year_turnover"
              value={formData.previous_year_turnover ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person Name
            </label>
            <input
              type="text"
              name="contact_person_name"
              value={formData.contact_person_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person Phone
            </label>
            <input
              type="text"
              name="contact_person_phone"
              value={formData.contact_person_phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Document Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PAN Number
            </label>
            <input
              type="text"
              name="pan_no"
              value={formData.pan_no}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              name="registration_no"
              value={formData.registration_no}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Document Collection Status */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_pan_copy_collected"
              checked={formData.is_pan_copy_collected}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              PAN Copy Collected
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_incorporation_doc_collected"
              checked={formData.is_incorporation_doc_collected}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Incorporation Document Collected
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_registration_no_collected"
              checked={formData.is_registration_no_collected}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Registration Number Collected
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_director_shareholder_list_collected"
              checked={formData.is_director_shareholder_list_collected}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Director/Shareholder List Collected
            </label>
          </div>
        </div>

        {/* Add Major Crops field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major Crops Produced
          </label>
          <input
            type="text"
            name="major_crop_produced"
            value={formData.major_crop_produced[0] || ''}
            onChange={handleCropChange}
            placeholder="Enter major crops (comma separated)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create FPO'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFPO; 