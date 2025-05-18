import { useState, useEffect } from 'react';
import { AxiosResponse } from 'axios';
import axiosInstance from '../utils/axios';
import axios from 'axios';
import { FaBuilding, FaSpinner, FaExclamationTriangle, FaUsers, FaMapMarkerAlt, FaPhoneAlt, FaFileAlt, FaTimesCircle, FaCheckCircle, FaSeedling, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

interface FPOData {
  id: string;
  fpo_id: string;
  constitution: string;
  entity_name: string;
  no_of_farmers: number;
  address: string;
  state: string;
  district: string;
  area_of_operation: number;
  establishment_year: string;
  major_crop_produced: string[];
  previous_year_turnover: number;
  contact_person_name: string;
  contact_person_phone: string;
  pan_no: string;
  is_pan_copy_collected: boolean;
  pan_image: string;
  is_incorporation_doc_collected: boolean;
  incorporation_doc_img: string;
  is_registration_no_collected: boolean;
  registration_no: string;
  registration_no_img: string;
  is_director_shareholder_list_collected: boolean;
  director_shareholder_list_image: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface SignedUrlResponse {
  filename: string;
  signed_url: string;
}

const FPO = () => {
  const [fpos, setFpos] = useState<FPOData[]>([]);
  const [selectedFPO, setSelectedFPO] = useState<FPOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const getSignedUrl = async (filename: string) => {
    if (!filename) return null;
    try {
      const response = await axios.get<SignedUrlResponse>(
        `https://dev-api.farmeasytechnologies.com/api/gcs-get-signed-image-url/${filename}`
      );
      return response.data.signed_url;
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      return null;
    }
  };

  const loadSignedUrls = async (images: string[]) => {
    const urlPromises = new Map();
    images.forEach(filename => {
      if (filename) {
        urlPromises.set(filename, getSignedUrl(filename));
      }
    });

    const urlResults = await Promise.all(urlPromises.values());
    const newSignedUrls: Record<string, string> = {};
    let i = 0;
    urlPromises.forEach((_, key) => {
      if (urlResults[i]) {
        newSignedUrls[key] = urlResults[i];
      }
      i++;
    });

    setSignedUrls(prev => ({ ...prev, ...newSignedUrls }));
  };

  useEffect(() => {
    const fetchFPOs = async () => {
      try {
        const response: AxiosResponse<FPOData[]> = await axiosInstance.get(
          '/fpos/?skip=0&limit=100'
        );
        setFpos(response.data);

        // Load signed URLs for all FPO images
        const allImages = response.data.flatMap(fpo => [
          fpo.pan_image,
          fpo.incorporation_doc_img,
          fpo.registration_no_img,
          fpo.director_shareholder_list_image
        ].filter(Boolean) as string[]);

        await loadSignedUrls(allImages);
      } catch (err: any) {
        setError(`Error fetching FPO list: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFPOs();
  }, []);

  const filteredFPOs = fpos.filter(fpo => {
    const matchesSearch = fpo.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fpo.fpo_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'all' || fpo.state === selectedState;
    return matchesSearch && matchesState;
  });

  const states = Array.from(new Set(fpos.map(fpo => fpo.state))).sort();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderImages = (images: string[], title: string) => {
    if (!images?.length) return null;
    return (
      <div className="my-6">
        <h3 className="text-lg font-semibold mb-3">{title}:</h3>
        <div className="flex flex-wrap gap-4">
          {images.map((filename, idx) => (
            <img
              key={idx}
              src={signedUrls[filename] || ''}
              alt={`${title} ${idx + 1}`}
              className="w-40 h-40 object-cover rounded-lg shadow-md border hover:scale-105 transition-transform"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner className="h-8 w-8 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Loading FPOs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center justify-center">
            <FaExclamationTriangle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredFPOs.map((fpo) => (
        <div
          key={fpo.id}
          onClick={() => setSelectedFPO(fpo)}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FaBuilding className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{fpo.entity_name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{fpo.fpo_id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${fpo.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {fpo.active ? <FaCheckCircle className="h-3 w-3" /> : <FaTimesCircle className="h-3 w-3" />}
                {fpo.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mr-2" />
                <span>{fpo.district}, {fpo.state}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FaUsers className="h-4 w-4 text-gray-400 mr-2" />
                <span>{fpo.no_of_farmers} Farmers</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FaPhoneAlt className="h-4 w-4 text-gray-400 mr-2" />
                <span>{fpo.contact_person_phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <FaCalendarAlt className="h-4 w-4 mr-1" />
                  <span>Est. {fpo.establishment_year}</span>
                </div>
                <div className="font-medium text-green-600">
                  {formatCurrency(fpo.previous_year_turnover)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmers</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredFPOs.map((fpo) => (
            <tr
              key={fpo.id}
              onClick={() => setSelectedFPO(fpo)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaBuilding className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{fpo.entity_name}</div>
                    <div className="text-sm text-blue-600">{fpo.fpo_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {fpo.district}, {fpo.state}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {fpo.contact_person_name}<br />
                {fpo.contact_person_phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {fpo.no_of_farmers}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {formatCurrency(fpo.previous_year_turnover)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${fpo.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {fpo.active ? <FaCheckCircle className="h-3 w-3" /> : <FaTimesCircle className="h-3 w-3" />}
                  {fpo.active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farmer Producer Organizations</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and view all registered FPOs</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <FaBuilding className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <FaFileAlt className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name or FPO ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="md:w-48">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? renderGridView() : renderListView()}

        {/* Modal */}
        {selectedFPO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 sm:p-8 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setSelectedFPO(null)}
              >
                <FaTimesCircle className="h-6 w-6" />
              </button>

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <FaBuilding className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedFPO.entity_name}</h2>
                    <p className="text-blue-600 font-medium">{selectedFPO.fpo_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaUsers className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-gray-900">Farmers</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedFPO.no_of_farmers}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaMoneyBillWave className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-gray-900">Turnover</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedFPO.previous_year_turnover)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaSeedling className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-gray-900">Major Crops</h3>
                    </div>
                    <p className="text-sm text-gray-600">{selectedFPO.major_crop_produced.join(', ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
                    <div>
                      <p className="text-sm text-gray-500">Constitution</p>
                      <p className="font-medium text-gray-900">{selectedFPO.constitution}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{selectedFPO.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{selectedFPO.district}, {selectedFPO.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Area of Operation</p>
                      <p className="font-medium text-gray-900">{selectedFPO.area_of_operation} sq. km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Establishment Year</p>
                      <p className="font-medium text-gray-900">{selectedFPO.establishment_year}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Documents</h3>
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium text-gray-900">{selectedFPO.contact_person_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{selectedFPO.contact_person_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PAN Number</p>
                      <p className="font-medium text-gray-900">{selectedFPO.pan_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="font-medium text-gray-900">{selectedFPO.registration_no}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Documents</h3>
                  
                  {renderImages([selectedFPO.pan_image].filter(Boolean), "PAN Documents")}
                  {renderImages([selectedFPO.incorporation_doc_img].filter(Boolean), "Incorporation Documents")}
                  {renderImages([selectedFPO.registration_no_img].filter(Boolean), "Registration Documents")}
                  {renderImages([selectedFPO.director_shareholder_list_image].filter(Boolean), "Director/Shareholder List")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FPO;