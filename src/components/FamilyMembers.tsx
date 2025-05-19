import { useEffect, useState } from 'react';
import { FaUser, FaSpinner, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import axiosInstance from '../utils/axios';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  education: string;
  occupation: string;
  annual_income: number;
  is_dependent: boolean;
  created_at: string;
  updated_at: string;
  bio_id: string;
}

interface FamilyMembersProps {
  bioId: string;
}

export default function FamilyMembers({ bioId }: FamilyMembersProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch family members
  useEffect(() => {
    async function fetchFamilyMembers() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/family-members/${bioId}`, {
          params: {
            skip: 0,
            limit: 10
          }
        });
        setFamilyMembers(response.data);
      } catch (err) {
        console.error('Error fetching family members:', err);
        setError('Failed to load family members');
      } finally {
        setLoading(false);
      }
    }

    if (bioId) {
      fetchFamilyMembers();
    }
  }, [bioId]);

  // Get single family member details
  const fetchMemberDetails = async (memberId: string) => {
    try {
      const response = await axiosInstance.get(`/family-member/${memberId}`);
      setSelectedMember(response.data);
      setIsEditing(true);
    } catch (err) {
      console.error('Error fetching member details:', err);
      setError('Failed to load member details');
    }
  };

  // Update family member
  const updateFamilyMember = async (memberId: string, data: Partial<FamilyMember>) => {
    try {
      await axiosInstance.patch(`/family-member/${memberId}`, data);
      // Refresh the list
      const response = await axiosInstance.get(`/family-members/${bioId}?skip=0&limit=10`);
      setFamilyMembers(response.data);
      setIsEditing(false);
      setSelectedMember(null);
    } catch (err) {
      console.error('Error updating family member:', err);
      setError('Failed to update family member');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Loading family members...</p>
      </div>
    );
  }

  if (error) {
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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FaUser className="mr-2" />
            Family Members
          </h3>
        </div>
        
        <div className="p-6">
          {familyMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyMembers.map(member => (
                <div 
                  key={member.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FaUser className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-purple-600">{member.relation}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchMemberDetails(member.id)}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Name: {member.name}</p>
                    <p>Gender: {member.gender}</p>
                    <p>Age: {member.age} years</p>
                    <p>Relation: {member.relation}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-6 inline-block">
                <FaUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No family members found</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Edit Family Member</h3>
            </div>
            <div className="p-6">
              {/* Add your edit form here */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form fields */}
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateFamilyMember(selectedMember.id, selectedMember)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 