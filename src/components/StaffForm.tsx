import { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaUserTie, FaCalendarAlt } from 'react-icons/fa';

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  joining_date: string;
  status: 'active' | 'inactive';
  profile_photo?: File | null;
}

interface StaffFormProps {
  initialData?: Partial<StaffFormData>;
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const StaffForm: React.FC<StaffFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<StaffFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'staff',
    joining_date: initialData?.joining_date || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'active',
    profile_photo: null
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.joining_date) {
      newErrors.joining_date = 'Joining date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profile_photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo Upload */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <FaUser className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <label
            htmlFor="profile_photo"
            className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors duration-200"
          >
            <FaUser className="h-4 w-4" />
          </label>
          <input
            type="file"
            id="profile_photo"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Click to upload profile photo</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`pl-10 w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            placeholder="Enter full name"
          />
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`pl-10 w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            placeholder="Enter email address"
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaPhone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`pl-10 w-full border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            placeholder="Enter phone number"
          />
        </div>
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUserTie className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Joining Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaCalendarAlt className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            value={formData.joining_date}
            onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
            className={`pl-10 w-full border ${errors.joining_date ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          />
        </div>
        {errors.joining_date && <p className="mt-1 text-sm text-red-600">{errors.joining_date}</p>}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="active"
              checked={formData.status === 'active'}
              onChange={() => setFormData({ ...formData, status: 'active' })}
              className="form-radio h-4 w-4 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-gray-700">Active</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="inactive"
              checked={formData.status === 'inactive'}
              onChange={() => setFormData({ ...formData, status: 'inactive' })}
              className="form-radio h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-gray-700">Inactive</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          {isEditing ? 'Update Staff' : 'Add Staff'}
        </button>
      </div>
    </form>
  );
};

export default StaffForm; 