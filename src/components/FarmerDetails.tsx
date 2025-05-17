import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from '../utils/axios';
import FarmerKyc from "./FarmerKyc";
import ScoreCard from "./Scorecard";
import { FaUser, FaIdCard, FaChartLine, FaSpinner, FaClipboardList } from 'react-icons/fa';

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
}

const FarmerDetails: React.FC = () => {
  const { farmerId, applicationId } = useParams<{ farmerId: string; applicationId: string }>();
  const [bio, setBio] = useState<Bio | null>(null);
  const [poi, setPoi] = useState<POIData | null>(null);
  const [poa, setPoa] = useState<POAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bio' | 'kyc' | 'activities' | 'scorecard'>('bio');
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
          const poi_id = kycResponse.data[0].poi_version_id;
          const poa_id = kycResponse.data[0].poa_version_id;

          // Fetch POI
          if (poi_id) {
            const poiResponse = await axiosInstance.get<POIData>(
              `/poi/${poi_id}`
            );
            setPoi(poiResponse.data);
          }

          // Fetch POA
          if (poa_id) {
            const poaResponse = await axiosInstance.get<POAData>(
              `/poa/${poa_id}`
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
    tab: 'bio' | 'kyc' | 'activities' | 'scorecard'
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Farmer Profile</h1>
            <p className="mt-2 text-sm text-gray-600">Manage and view farmer details</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Farmer Details</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farmer Profile</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and view farmer details</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          {bio && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                {bio.photo ? (
                  <img
                    src={`${imageBaseUrl}${bio.photo}`}
                    alt={bio.name}
                    className="h-20 w-20 rounded-full border-4 border-white shadow-md object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                    <FaUser className="h-8 w-8 text-white/80" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{bio.name || 'N/A'}</h2>
                  <p className="text-green-100">ID: {bio.id || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'bio', label: 'Profile', icon: FaUser },
                { id: 'kyc', label: 'KYC Documents', icon: FaIdCard },
                { id: 'activities', label: 'Activities', icon: FaClipboardList },
                { id: 'scorecard', label: 'Score Card', icon: FaChartLine },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabClick(id as any)}
                  className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "bio" && bio && (
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
                </div>
              </div>
            )}

            {activeTab === "kyc" && (
              <div className="space-y-8">
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
                                <img
                                  src={`${imageBaseUrl}${poi.poi_image_front_url}`}
                                  alt="POI Front"
                                  className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover"
                                />
                              </div>
                            )}
                            {poi.poi_image_back_url && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Back Side</p>
                                <img
                                  src={`${imageBaseUrl}${poi.poi_image_back_url}`}
                                  alt="POI Back"
                                  className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover"
                                />
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
                                <img
                                  src={`${imageBaseUrl}${poa.poa_image_front_url}`}
                                  alt="POA Front"
                                  className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover"
                                />
                              </div>
                            )}
                            {poa.poa_image_back_url && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Back Side</p>
                                <img
                                  src={`${imageBaseUrl}${poa.poa_image_back_url}`}
                                  alt="POA Back"
                                  className="rounded-lg shadow-sm border border-gray-200 w-full h-48 object-cover"
                                />
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

            {activeTab === "activities" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <FarmerKyc applicationId={applicationId} />
              </div>
            )}

            {activeTab === "scorecard" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <ScoreCard farmerId={farmerId} applicationId={applicationId} financialYear="2023-24" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetails;
