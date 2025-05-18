import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from '../utils/axios';
import axios from 'axios';
import FarmerKyc from "./FarmerKyc";
import ScoreCard from "./Scorecard";
import ReportRemark from './ReportRemark';
import { 
  FaUser, 
  FaIdCard, 
  FaChartLine, 
  FaSpinner, 
  FaClipboardList, 
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
  FaVenusMars,
  FaIdBadge,
  FaSignOutAlt
} from 'react-icons/fa';

interface Bio {
  id?: string;
  name?: string;
  dob?: string;
  email?: string;
  gender?: string | null;
  alt_phone?: string | null;
  full_address?: string | null;
  village?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  pin?: string | null;
  fpo_name?: string | null;
  fpo_code?: string | null;
  photo?: string | null;
}

interface KYCData {
  poi_version_id?: string | null;
  poa_version_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: string | null;
  remarks?: string | null;
}

interface SignedUrlResponse {
  filename: string;
  signed_url: string;
}

interface POIData {
  id?: string;
  poi_type?: string | null;
  poi_number?: string | null;
  name?: string | null;
  dob?: string | null;
  father?: string | null;
  gender?: string | null;
  husband?: string | null;
  mother?: string | null;
  yob?: number | null;
  address_full?: string | null;
  pin?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  relation?: string | null;
  poi_image_front_url?: string | null;
  poi_image_back_url?: string | null;
  is_verified?: boolean | null;
  verification_id?: string | null;
  updated_at?: string | null;
}

interface POAData {
  id?: string;
  poa_type?: string | null;
  poa_number?: string | null;
  name?: string | null;
  dob?: string | null;
  father?: string | null;
  gender?: string | null;
  husband?: string | null;
  mother?: string | null;
  yob?: number | null;
  address_full?: string | null;
  pin?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  relation?: string | null;
  poa_image_front_url?: string | null;
  poa_image_back_url?: string | null;
  is_verified?: boolean | null;
  verification_id?: string | null;
  updated_at?: string | null;
}

const FarmerDetails: React.FC = () => {
  const { farmerId, applicationId } = useParams<{ farmerId: string; applicationId: string }>();
  const navigate = useNavigate();
  const [bio, setBio] = useState<Bio | null>(null);
  const [kyc, setKyc] = useState<KYCData | null>(null);
  const [poi, setPoi] = useState<POIData | null>(null);
  const [poa, setPoa] = useState<POAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'activities' | 'scorecard'>('profile');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const baseUrl = "https://dev-api.farmeasytechnologies.com/api/uploads/";
  const token = localStorage.getItem('keycloak-token');

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    // First check if we have a signed URL
    if (signedUrls[imagePath]) {
      return signedUrls[imagePath];
    }
    // Fallback to token-based URL
    return `${baseUrl}${imagePath}?token=Bearer ${token}`;
  };

  const getSignedUrl = async (filename: string) => {
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

  const loadSignedUrls = async (poiData: POIData | null, poaData: POAData | null) => {
    const urlPromises = new Map();

    // Helper function to add image to promises
    const addImageToPromises = (image: string | null | undefined) => {
      if (image && !signedUrls[image]) {
        urlPromises.set(image, getSignedUrl(image));
      }
    };

    // Add POI images
    if (poiData) {
      addImageToPromises(poiData.poi_image_front_url);
      addImageToPromises(poiData.poi_image_back_url);
    }

    // Add POA images
    if (poaData) {
      addImageToPromises(poaData.poa_image_front_url);
      addImageToPromises(poaData.poa_image_back_url);
    }

    if (urlPromises.size > 0) {
      try {
        const urlResults = await Promise.all(urlPromises.values());
        const newSignedUrls: Record<string, string> = { ...signedUrls };
        let i = 0;
        urlPromises.forEach((_, key) => {
          if (urlResults[i]) {
            newSignedUrls[key] = urlResults[i];
          }
          i++;
        });
        setSignedUrls(newSignedUrls);
      } catch (error) {
        console.error('Error loading signed URLs:', error);
      }
    }
  };

  useEffect(() => {
    const fetchFarmerData = async () => {
      if (!farmerId || !applicationId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch Bio
        const bioHistoryResponse = await axiosInstance.get(
          `/bio-histories/${applicationId}?skip=0&limit=10`
        );

        if (bioHistoryResponse.data && bioHistoryResponse.data.length > 0) {
          const bio_version_id = bioHistoryResponse.data[0].bio_version_id;
          const bioResponse = await axiosInstance.get(`/bio/${bio_version_id}`);
          setBio(bioResponse.data);
        }

        // Fetch KYC
        const kycResponse = await axiosInstance.get(`/kyc-histories/${farmerId}`);
        setKyc(kycResponse.data[0]);

        let poiData = null;
        let poaData = null;

        // Fetch POI
        if (kycResponse.data[0].poi_version_id) {
          const poiResponse = await axiosInstance.get(
            `/poi/${kycResponse.data[0].poi_version_id}`
          );
          poiData = poiResponse.data;
          setPoi(poiData);
        }

        // Fetch POA
        if (kycResponse.data[0].poa_version_id) {
          const poaResponse = await axiosInstance.get(
            `/poa/${kycResponse.data[0].poa_version_id}`
          );
          poaData = poaResponse.data;
          setPoa(poaData);
        }

        // Load signed URLs for POI and POA images
        await loadSignedUrls(poiData, poaData);

      } catch (err: any) {
        setError('Failed to fetch data: ' + err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, [farmerId, applicationId]);

  const handleTabClick = (
    tab: 'profile' | 'kyc' | 'activities' | 'scorecard'
  ) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    // Clear token and any other stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/login');
  };

  const renderDocumentImage = (
    imageUrl: string | null | undefined,
    title: string,
    color: string
  ) => {
    if (!imageUrl) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <div className="relative group cursor-pointer">
          <img
            src={getImageUrl(imageUrl)}
            alt={title}
            className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover transform transition-transform duration-200 group-hover:scale-[1.02]"
            onClick={() => setSelectedImage(getImageUrl(imageUrl))}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(getImageUrl(imageUrl));
                  alert('Image URL copied to clipboard!');
                }}
                className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                Copy URL
              </button>
              <button
                onClick={() => setSelectedImage(getImageUrl(imageUrl))}
                className={`bg-${color}-500 text-white px-4 py-2 rounded-md hover:bg-${color}-600 transition-colors duration-200`}
              >
                View Image
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-600">Loading farmer details...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-center text-gray-900">Error Loading Data</h3>
          <p className="mt-2 text-center text-sm text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 -mt-12 text-white hover:text-gray-300 focus:outline-none"
            >
              <FaTimes className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Document"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {bio?.photo ? (
                    <img
                      src={getImageUrl(bio.photo)}
                      alt={bio.name}
                      className="h-20 w-20 rounded-full border-4 border-white shadow-md object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => setSelectedImage(getImageUrl(bio.photo))}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                      <FaUser className="h-8 w-8 text-white/80" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-white">{bio?.name || 'N/A'}</h1>
                    <p className="text-green-100 flex items-center mt-1">
                      <FaIdBadge className="mr-2" />
                      ID: {bio?.id || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaEnvelope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">{bio?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaPhone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1 text-sm text-gray-900">{bio?.alt_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaBuilding className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">FPO</p>
                    <p className="mt-1 text-sm text-gray-900">{bio?.fpo_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'profile', label: 'Profile', icon: FaUser },
                { id: 'kyc', label: 'KYC', icon: FaIdCard },
                { id: 'activities', label: 'Activities', icon: FaClipboardList },
                { id: 'scorecard', label: 'Score Card', icon: FaChartLine },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabClick(id as any)}
                  className={`${
                    activeTab === id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center space-x-2 py-4 px-1 border-b-2 font-medium transition-colors duration-200`}
                >
                  <Icon className={`h-5 w-5 ${activeTab === id ? 'text-green-500' : 'text-gray-400'}`} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && bio && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "Full Name", value: bio.name, icon: FaUser },
                    { label: "Date of Birth", value: bio.dob, icon: FaCalendarAlt },
                    { label: "Gender", value: bio.gender, icon: FaVenusMars },
                    { label: "Email", value: bio.email, icon: FaEnvelope },
                    { label: "Phone", value: bio.alt_phone, icon: FaPhone },
                    { label: "Village", value: bio.village, icon: FaMapMarkerAlt },
                    { label: "District", value: bio.district, icon: FaMapMarkerAlt },
                    { label: "State", value: bio.state, icon: FaMapMarkerAlt },
                    { label: "PIN Code", value: bio.pin, icon: FaMapMarkerAlt },
                    { label: "FPO Name", value: bio.fpo_name, icon: FaBuilding },
                    { label: "FPO Code", value: bio.fpo_code, icon: FaIdBadge },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">{label}</p>
                          <p className="mt-1 text-sm text-gray-900">{value || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full Address */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="ml-4 text-lg font-medium text-gray-900">Full Address</h3>
                  </div>
                  <p className="text-gray-600 ml-14">{bio.full_address || 'N/A'}</p>
                </div>

                {/* Photo */}
                {bio.photo && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FaUser className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="ml-4 text-lg font-medium text-gray-900">Profile Photo</h3>
                    </div>
                    <div className="ml-14">
                      <img
                        src={getImageUrl(bio.photo)}
                        alt="Farmer"
                        className="w-48 h-48 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                        onClick={() => setSelectedImage(getImageUrl(bio.photo))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-8">
                {/* KYC Status */}
                {kyc && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <FaIdCard className="mr-2" />
                        KYC Status
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className={`rounded-lg p-4 ${kyc.status === 'VERIFIED' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <div className="mt-1 flex items-center">
                            {kyc.status === 'VERIFIED' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⚠ Pending
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500">Remarks</p>
                          <p className="mt-1 text-sm text-gray-900">{kyc.remarks || 'No remarks'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500">Created At</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {kyc.created_at ? new Date(kyc.created_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500">Updated At</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {kyc.updated_at ? new Date(kyc.updated_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* POI Section */}
                {poi && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <FaIdCard className="mr-2" />
                        Proof of Identity (POI)
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { label: "Document Type", value: poi.poi_type, icon: FaIdCard },
                          { label: "Document Number", value: poi.poi_number, icon: FaIdBadge },
                          { label: "Name", value: poi.name, icon: FaUser },
                          { label: "Date of Birth", value: poi.dob, icon: FaCalendarAlt },
                          { label: "Father's Name", value: poi.father, icon: FaUser },
                          { label: "Gender", value: poi.gender, icon: FaVenusMars },
                          { label: "Mother's Name", value: poi.mother, icon: FaUser },
                          { label: "Address", value: poi.address_full, icon: FaMapMarkerAlt },
                          { label: "PIN", value: poi.pin, icon: FaMapMarkerAlt },
                          { label: "City", value: poi.city, icon: FaMapMarkerAlt },
                          { label: "District", value: poi.district, icon: FaMapMarkerAlt },
                          { label: "State", value: poi.state, icon: FaMapMarkerAlt },
                        ].map(({ label, value, icon: Icon }, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                              <Icon className="text-purple-500" />
                              <span className="text-sm text-gray-500">{label}</span>
                            </div>
                            <p className="mt-1 text-gray-900 font-medium">{value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Verification Status */}
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <FaIdCard className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">Verification Status</p>
                              <div className="mt-1 flex items-center">
                                {poi.is_verified ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    ⚠ Not Verified
                                  </span>
                                )}
                                {poi.verification_id && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    ID: {poi.verification_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {poi.updated_at ? new Date(poi.updated_at).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* POI Images */}
                      {(poi.poi_image_front_url || poi.poi_image_back_url) && (
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FaIdCard className="mr-2 text-purple-600" />
                            Document Images
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderDocumentImage(poi.poi_image_front_url, "Front Side", "purple")}
                            {renderDocumentImage(poi.poi_image_back_url, "Back Side", "purple")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* POA Section */}
                {poa && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <FaIdCard className="mr-2" />
                        Proof of Address (POA)
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { label: "Document Type", value: poa.poa_type, icon: FaIdCard },
                          { label: "Document Number", value: poa.poa_number, icon: FaIdBadge },
                          { label: "Name", value: poa.name, icon: FaUser },
                          { label: "Date of Birth", value: poa.dob, icon: FaCalendarAlt },
                          { label: "Father's Name", value: poa.father, icon: FaUser },
                          { label: "Gender", value: poa.gender, icon: FaVenusMars },
                          { label: "Mother's Name", value: poa.mother, icon: FaUser },
                          { label: "Address", value: poa.address_full, icon: FaMapMarkerAlt },
                          { label: "PIN", value: poa.pin, icon: FaMapMarkerAlt },
                          { label: "City", value: poa.city, icon: FaMapMarkerAlt },
                          { label: "District", value: poa.district, icon: FaMapMarkerAlt },
                          { label: "State", value: poa.state, icon: FaMapMarkerAlt },
                        ].map(({ label, value, icon: Icon }, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                              <Icon className="text-green-500" />
                              <span className="text-sm text-gray-500">{label}</span>
                            </div>
                            <p className="mt-1 text-gray-900 font-medium">{value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Verification Status */}
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <FaIdCard className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">Verification Status</p>
                              <div className="mt-1 flex items-center">
                                {poa.is_verified ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    ⚠ Not Verified
                                  </span>
                                )}
                                {poa.verification_id && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    ID: {poa.verification_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {poa.updated_at ? new Date(poa.updated_at).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* POA Images */}
                      {(poa.poa_image_front_url || poa.poa_image_back_url) && (
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FaIdCard className="mr-2 text-green-600" />
                            Document Images
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderDocumentImage(poa.poa_image_front_url, "Front Side", "green")}
                            {renderDocumentImage(poa.poa_image_back_url, "Back Side", "green")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && applicationId && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <FarmerKyc applicationId={applicationId} />
              </div>
            )}

            {activeTab === 'scorecard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Score Card</h3>
                  </div>
                  <div className="p-6">
                    <ScoreCard farmerId={farmerId} applicationId={applicationId} financialYear={"2024-25"} />
                  </div>
                </div>
                {farmerId && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <ReportRemark 
                      farmerId={farmerId} 
                      applicationId={applicationId} 
                      financialYear="2024-25" 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetails;
