import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import axiosInstance from '../utils/axios';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

interface CreateFPOProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const generateRandomString = (prefix: string = '') => {
  return `${prefix}${Math.random().toString(36).substring(2, 10)}`;
};

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomPhone = () => {
  return `${generateRandomNumber(6, 9)}${Array(9).fill(0).map(() => generateRandomNumber(0, 9)).join('')}`;
};

const CROPS = [
  'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize',
  'Pulses', 'Soybeans', 'Groundnut', 'Mustard', 'Potato'
];

const CONSTITUTIONS = [
  'Farmer Producer Company', 'Cooperative Society', 'Trust',
  'Society', 'Partnership Firm', 'Private Limited Company'
];

const CreateFPO: React.FC<CreateFPOProps> = ({ onSuccess, onCancel }) => {
  // Add token refresh hook
  useTokenRefresh();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fpo_id: '',
    entity_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedData = {
        fpo_id: formData.fpo_id,
        entity_name: formData.entity_name,
        constitution: CONSTITUTIONS[generateRandomNumber(0, CONSTITUTIONS.length - 1)],
        no_of_farmers: generateRandomNumber(100, 5000),
        address: 'Golaghat',
        state: 'Assam',
        district: 'Golaghat',
        area_of_operation: generateRandomNumber(50, 500),
        establishment_year: `${generateRandomNumber(2010, 2023)}`,
        major_crop_produced: Array(generateRandomNumber(1, 3))
          .fill(0)
          .map(() => CROPS[generateRandomNumber(0, CROPS.length - 1)]),
        previous_year_turnover: generateRandomNumber(1000000, 50000000),
        contact_person_name: "NRL",
        contact_person_phone: generateRandomPhone(),
        pan_no: `${generateRandomString().toUpperCase().substring(0, 5)}${generateRandomNumber(1000, 9999)}${generateRandomString().toUpperCase().substring(0, 1)}`,
        is_pan_copy_collected: true,
        pan_image: generateRandomString('pan-'),
        is_incorporation_doc_collected: true,
        incorporation_doc_img: generateRandomString('inc-'),
        is_registration_no_collected: true,
        registration_no: generateRandomString('REG-'),
        registration_no_img: generateRandomString('reg-'),
        is_director_shareholder_list_collected: true,
        director_shareholder_list_image: generateRandomString('dir-'),
        active: true
      };

      if (import.meta.env.DEV) {
        console.log('Creating FPO with data:', formattedData);
      }

      const response = await axiosInstance.post('/fpo/', formattedData);
      
      if (import.meta.env.DEV) {
        console.log('FPO created successfully:', response.data);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error creating FPO:', error);
      
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New FPO</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FPO ID*
            </label>
            <input
              type="text"
              name="fpo_id"
              value={formData.fpo_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter FPO ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Name*
            </label>
            <input
              type="text"
              name="entity_name"
              value={formData.entity_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter Entity Name"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
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