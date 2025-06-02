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
    no_of_farmers: 0,
    address: '',
    state: '',
    district: '',
    area_of_operation: 0,
    establishment_year: '',
    major_crop_produced: [''],
    previous_year_turnover: 0,
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
      await axiosInstance.post('/fpo/', formData);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create FPO');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
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
              required
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
              required
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Farmers
            </label>
            <input
              type="number"
              name="no_of_farmers"
              value={formData.no_of_farmers}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
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
              required
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
              required
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area of Operation (in acres)
            </label>
            <input
              type="number"
              name="area_of_operation"
              value={formData.area_of_operation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous Year Turnover
            </label>
            <input
              type="number"
              name="previous_year_turnover"
              value={formData.previous_year_turnover}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
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
              required
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
              required
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
              required
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
              required
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