import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from '../utils/axios';
import FarmerKyc from "./FarmerKyc";
import ScoreCard from "./Scorecard";
import { FaUser, FaIdCard, FaChartLine, FaSpinner, FaClipboardList, FaTimes } from 'react-icons/fa';

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
  building?: string | null;
  city?: string | null;
  district?: string | null;
  floor?: string | null;
  house?: string | null;
  locality?: string | null;
  state?: string | null;
  street?: string | null;
  complex?: string | null;
  landmark?: string | null;
  relation?: string | null;
  number_cs?: number | null;
  name_cs?: number | null;
  dob_cs?: number | null;
  father_cs?: number | null;
  gender_cs?: number | null;
  husband_cs?: number | null;
  mother_cs?: number | null;
  yob_cs?: number | null;
  address_cs?: string | null;
  pin_cs?: string | null;
  poi_image_front_url?: string | null;
  poi_image_back_url?: string | null;
  is_verified?: boolean | null;
  verification_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface POAData {
  id?: string;
  poa_type?: string | null;
  name?: string | null;
  poa_number?: string | null;
  dob?: string | null;
  father?: string | null;
  gender?: string | null;
  husband?: string | null;
  mother?: string | null;
  yob?: number | null;
  address_full?: string | null;
  pin?: string | null;
  building?: string | null;
  city?: string | null;
  district?: string | null;
  floor?: string | null;
  house?: string | null;
  locality?: string | null;
  state?: string | null;
  street?: string | null;
  complex?: string | null;
  landmark?: string | null;
  relation?: string | null;
  number_cs?: number | null;
  name_cs?: number | null;
  dob_cs?: number | null;
  father_cs?: number | null;
  gender_cs?: number | null;
  husband_cs?: number | null;
  mother_cs?: number | null;
  yob_cs?: number | null;
  address_cs?: string | null;
  pin_cs?: string | null;
  poa_image_front_url?: string | null;
  poa_image_back_url?: string | null;
  is_verified?: boolean | null;
  verification_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const FarmerDetails: React.FC = () => {
  const { farmerId, applicationId } = useParams<{ farmerId: string; applicationId: string }>();
  const [bio, setBio] = useState<Bio | null>(null);
  const [kyc, setKyc] = useState<KYCData | null>(null);
  const [poi, setPoi] = useState<POIData | null>(null);
  const [poa, setPoa] = useState<POAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'activities' | 'scorecard'>('profile');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const imageBaseUrl = "https://dev-api.farmeasytechnologies.com/api/uploads/";

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
          const bioResponse = await axiosInstance.get<Bio>(
            `/bio/${bio_version_id}`
          );
          setBio(bioResponse.data);
        } else {
          console.log("No bio history found for this application.");
          setBio({});
        }

        // Fetch KYC
        const kycResponse = await axiosInstance.get(
          `/kyc-histories/${farmerId}`
        );

        if (kycResponse.data && kycResponse.data.length > 0) {
          const kycData = kycResponse.data[0];
          setKyc(kycData);

          // Fetch POI
          if (kycData.poi_version_id) {
            const poiResponse = await axiosInstance.get<POIData>(
              `/poi/${kycData.poi_version_id}`
            );
            setPoi(poiResponse.data);
          }

          // Fetch POA
          if (kycData.poa_version_id) {
            const poaResponse = await axiosInstance.get<POAData>(
              `/poa/${kycData.poa_version_id}`
            );
            setPoa(poaResponse.data);
          }
        }
      } catch (err: any) {
        setError("Failed to fetch data: " + err.message);
        console.error("Fetch error:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Farmer Profile</h1>
            <p className="mt-2 text-sm text-gray-600">Manage and view farmer details</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
            <p className="mt-4 text-gray-600">Loading farmer details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => handleTabClick('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <FaUser className="mr-2" />
                Profile
              </button>
              <button
                onClick={() => handleTabClick('kyc')}
                className={`${
                  activeTab === 'kyc'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <FaIdCard className="mr-2" />
                KYC
              </button>
              <button
                onClick={() => handleTabClick('activities')}
                className={`${
                  activeTab === 'activities'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <FaClipboardList className="mr-2" />
                Activities
              </button>
              <button
                onClick={() => handleTabClick('scorecard')}
                className={`${
                  activeTab === 'scorecard'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <FaChartLine className="mr-2" />
                Score Card
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && bio && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "Full Name", value: bio.name },
                    { label: "Date of Birth", value: bio.dob },
                    { label: "Gender", value: bio.gender },
                    { label: "Email", value: bio.email },
                    { label: "Phone", value: bio.alt_phone },
                    { label: "Village", value: bio.village },
                    { label: "District", value: bio.district },
                    { label: "State", value: bio.state },
                    { label: "PIN Code", value: bio.pin },
                    { label: "FPO Name", value: bio.fpo_name },
                    { label: "FPO Code", value: bio.fpo_code },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">{label}</p>
                      <p className="mt-1 text-gray-900">{value || 'N/A'}</p>
                    </div>
                  ))}

                  {/* Full Address */}
                  <div className="col-span-full bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Full Address</p>
                    <p className="mt-1 text-gray-900">{bio.full_address || 'N/A'}</p>
                  </div>

                  {/* Photo */}
                  {bio.photo && (
                    <div className="col-span-full bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-2">Photo</p>
                      <img
                        src={`${imageBaseUrl}${bio.photo}`}
                        alt="Farmer"
                        className="w-48 h-48 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-8">
                {/* KYC Status */}
                {kyc && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-blue-900">KYC Status</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          ["Status", kyc.status],
                          ["Remarks", kyc.remarks],
                          ["Created At", new Date(kyc.created_at || '').toLocaleDateString()],
                          ["Updated At", new Date(kyc.updated_at || '').toLocaleDateString()],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">{label}</p>
                            <p className="mt-1 text-gray-900">{value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* POI Section */}
                {poi && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-blue-900">Proof of Identity (POI)</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          ["Document Type", poi.poi_type],
                          ["Document Number", poi.poi_number],
                          ["Name", poi.name],
                          ["Date of Birth", poi.dob],
                          ["Father's Name", poi.father],
                          ["Gender", poi.gender],
                          ["Mother's Name", poi.mother],
                          ["Address", poi.address_full],
                          ["PIN", poi.pin],
                          ["City", poi.city],
                          ["District", poi.district],
                          ["State", poi.state],
                          ["Created At", new Date(poi.created_at || '').toLocaleDateString()],
                          ["Updated At", new Date(poi.updated_at || '').toLocaleDateString()],
                          ["Verification Status", poi.is_verified ? "✅ Verified" : "❌ Not Verified"],
                          ["Verification ID", poi.verification_id],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">{label}</p>
                            <p className="mt-1 text-gray-900">{value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>

                      {/* POI Images */}
                      {(poi.poi_image_front_url || poi.poi_image_back_url) && (
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Document Images</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {poi.poi_image_front_url && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Front Side</p>
                                <div className="relative group cursor-pointer">
                                  <img
                                    src={`${imageBaseUrl}${poi.poi_image_front_url}`}
                                    alt="POI Front"
                                    className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover"
                                    onClick={() => setSelectedImage(`${imageBaseUrl}${poi.poi_image_front_url}`)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                    <div className="flex flex-col items-center space-y-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(`${imageBaseUrl}${poi.poi_image_front_url}`);
                                          alert('Image URL copied to clipboard!');
                                        }}
                                        className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                      >
                                        Copy URL
                                      </button>
                                      <button
                                        onClick={() => setSelectedImage(`${imageBaseUrl}${poi.poi_image_front_url}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                                      >
                                        View Image
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                  <p className="text-xs text-gray-500 break-all">
                                    URL: {`${imageBaseUrl}${poi.poi_image_front_url}`}
                                  </p>
                                </div>
                              </div>
                            )}
                            {poi.poi_image_back_url && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Back Side</p>
                                <div className="relative group cursor-pointer">
                                  <img
                                    src={`${imageBaseUrl}${poi.poi_image_back_url}`}
                                    alt="POI Back"
                                    className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover"
                                    onClick={() => setSelectedImage(`${imageBaseUrl}${poi.poi_image_back_url}`)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                    <div className="flex flex-col items-center space-y-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(`${imageBaseUrl}${poi.poi_image_back_url}`);
                                          alert('Image URL copied to clipboard!');
                                        }}
                                        className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                      >
                                        Copy URL
                                      </button>
                                      <button
                                        onClick={() => setSelectedImage(`${imageBaseUrl}${poi.poi_image_back_url}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                                      >
                                        View Image
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                  <p className="text-xs text-gray-500 break-all">
                                    URL: {`${imageBaseUrl}${poi.poi_image_back_url}`}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* POA Section */}
                {poa && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-green-900">Proof of Address (POA)</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          ["Document Type", poa.poa_type],
                          ["Document Number", poa.poa_number],
                          ["Name", poa.name],
                          ["Date of Birth", poa.dob],
                          ["Father's Name", poa.father],
                          ["Gender", poa.gender],
                          ["Mother's Name", poa.mother],
                          ["Address", poa.address_full],
                          ["PIN", poa.pin],
                          ["City", poa.city],
                          ["District", poa.district],
                          ["State", poa.state],
                          ["Created At", new Date(poa.created_at || '').toLocaleDateString()],
                          ["Updated At", new Date(poa.updated_at || '').toLocaleDateString()],
                          ["Verification Status", poa.is_verified ? "✅ Verified" : "❌ Not Verified"],
                          ["Verification ID", poa.verification_id],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">{label}</p>
                            <p className="mt-1 text-gray-900">{value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>

                      {/* POA Images */}
                      {(poa.poa_image_front_url || poa.poa_image_back_url) && (
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Document Images</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {poa.poa_image_front_url && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Front Side</p>
                                <div className="relative group cursor-pointer">
                                  <img
                                    src={`${imageBaseUrl}${poa.poa_image_front_url}`}
                                    alt="POA Front"
                                    className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover"
                                    onClick={() => setSelectedImage(`${imageBaseUrl}${poa.poa_image_front_url}`)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                    <div className="flex flex-col items-center space-y-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(`${imageBaseUrl}${poa.poa_image_front_url}`);
                                          alert('Image URL copied to clipboard!');
                                        }}
                                        className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                      >
                                        Copy URL
                                      </button>
                                      <button
                                        onClick={() => setSelectedImage(`${imageBaseUrl}${poa.poa_image_front_url}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                                      >
                                        View Image
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                  <p className="text-xs text-gray-500 break-all">
                                    URL: {`${imageBaseUrl}${poa.poa_image_front_url}`}
                                  </p>
                                </div>
                              </div>
                            )}
                            {poa.poa_image_back_url && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Back Side</p>
                                <div className="relative group cursor-pointer">
                                  <img
                                    src={`${imageBaseUrl}${poa.poa_image_back_url}`}
                                    alt="POA Back"
                                    className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover"
                                    onClick={() => setSelectedImage(`${imageBaseUrl}${poa.poa_image_back_url}`)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                    <div className="flex flex-col items-center space-y-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(`${imageBaseUrl}${poa.poa_image_back_url}`);
                                          alert('Image URL copied to clipboard!');
                                        }}
                                        className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                      >
                                        Copy URL
                                      </button>
                                      <button
                                        onClick={() => setSelectedImage(`${imageBaseUrl}${poa.poa_image_back_url}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                                      >
                                        View Image
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                  <p className="text-xs text-gray-500 break-all">
                                    URL: {`${imageBaseUrl}${poa.poa_image_back_url}`}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <FarmerKyc applicationId={applicationId} />
              </div>
            )}

            {activeTab === 'scorecard' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <ScoreCard farmerId={farmerId} applicationId={applicationId} financialYear={"2024-25"} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetails;
