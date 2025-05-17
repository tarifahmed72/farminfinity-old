import { useState } from 'react';
import axiosInstance from '../utils/axios';
import axios from 'axios';
import { FaCalendarAlt, FaLeaf, FaTractor, FaWater, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

type FarmerKycProps = {
  applicationId?: string;
};

type Activity = {
  primary_activity_type: string;
  primary_activity: any;
  secondary_activity_type?: string;
  secondary_activity?: any;
};

interface SignedUrlResponse {
  filename: string;
  signed_url: string;
}

const FarmerKyc: React.FC<FarmerKycProps> = ({ applicationId }) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [financialYear, setFinancialYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary');
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

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

  const fetchActivity = async (selectedYear: string) => {
    if (!applicationId) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setActivity(null);
      setSignedUrls({});

      const { data } = await axiosInstance.get(`/fetch-activity-data/?application_id=${applicationId}&financial_year=${selectedYear}`);
      
      if (!data || Object.keys(data).length === 0) {
        setErrorMsg('No activity data available for selected financial year.');
      } else {
        // Fetch signed URLs for all images
        const urlPromises = new Map();

        // Primary activity images
        if (data.primary_activity?.images?.[0]) {
          data.primary_activity.images[0].forEach((filename: string) => {
            urlPromises.set(filename, getSignedUrl(filename));
          });
        }

        // Secondary activity images
        if (data.secondary_activity?.images?.[0]) {
          data.secondary_activity.images[0].forEach((filename: string) => {
            urlPromises.set(filename, getSignedUrl(filename));
          });
        }

        // Facility GPS images
        if (data.primary_activity?.facility_gps_image) {
          urlPromises.set(
            data.primary_activity.facility_gps_image,
            getSignedUrl(data.primary_activity.facility_gps_image)
          );
        }
        if (data.secondary_activity?.facility_gps_image) {
          urlPromises.set(
            data.secondary_activity.facility_gps_image,
            getSignedUrl(data.secondary_activity.facility_gps_image)
          );
        }

        // Wait for all signed URLs to be fetched
        const urlResults = await Promise.all(urlPromises.values());
        const newSignedUrls: Record<string, string> = {};
        let i = 0;
        urlPromises.forEach((_, key) => {
          if (urlResults[i]) {
            newSignedUrls[key] = urlResults[i];
          }
          i++;
        });

        setSignedUrls(newSignedUrls);
        setActivity(data);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      setErrorMsg('Failed to fetch activity data.');
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    setFinancialYear(year);
    if (year) fetchActivity(year);
  };

  const renderSeasons = (seasons: any[]) => {
    if (!seasons?.length) return null;
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-green-600" />
          Seasonal Activities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasons.map((season: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-3">{season.season_name}</h4>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Crops:</span> {season.crops.map((c: any) => c.crop_name).join(', ')}</p>
                <p><span className="font-medium">Area:</span> {season.cultivation_area} {season.area_unit}</p>
                {season.expected_yield && (
                  <p><span className="font-medium">Expected Yield:</span> {season.expected_yield}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImages = (images: string[], title: string) => {
    if (!images?.length) return null;
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
              <img
                src={signedUrls[img] || ''}
                alt={`${title} ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActivityDetails = (data: any, type: string) => {
    if (!data || !type) {
      console.warn('Missing data or type in renderActivityDetails');
      return null;
    }

    // Add debug logging to help identify data issues
    console.log(`Rendering ${type} activity:`, data);

    const getActivityColor = (activityType: string) => {
      switch (activityType.toLowerCase()) {
        case 'farming':
          return 'from-green-500 to-green-600';
        case 'dairy':
          return 'from-blue-500 to-blue-600';
        case 'poultry':
          return 'from-yellow-500 to-yellow-600';
        case 'fishery':
          return 'from-cyan-500 to-cyan-600';
        case 'goat':
          return 'from-purple-500 to-purple-600';
        default:
          return 'from-gray-500 to-gray-600';
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${getActivityColor(type)} px-6 py-4`}>
          <div className="flex items-center gap-3">
            <FaLeaf className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">{type} Details</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Common fields for all activity types */}
            {data.land_owned && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaTractor className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Land Owned</p>
                    <p className="text-lg font-medium">{data.land_owned} {data.area_unit}</p>
                  </div>
                </div>
              </div>
            )}

            {data.cultivation_area && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaLeaf className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Cultivation Area</p>
                    <p className="text-lg font-medium">{data.cultivation_area} {data.area_unit}</p>
                  </div>
                </div>
              </div>
            )}

            {data.irrigations && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaWater className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Irrigation Types</p>
                    <p className="text-lg font-medium">{data.irrigations?.map((i: any) => i.irrigation_type).join(', ') || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity-specific fields */}
            {type.toLowerCase() === 'dairy' && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Number of Cows</p>
                      <p className="text-lg font-medium">{data.no_of_livestock_cow || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Number of Bulls</p>
                      <p className="text-lg font-medium">{data.no_of_livestock_bull || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Number of Calves</p>
                      <p className="text-lg font-medium">{data.no_of_livestock_calves || 0}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Add more activity-specific fields here */}
          </div>

          {data.seasons && renderSeasons(data.seasons)}
          {data.images && renderImages(data.images[0] || [], `${type} Images`)}

          {data.field_gps_image && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Field GPS Location</h3>
              <div className="aspect-square max-w-md rounded-xl overflow-hidden border border-gray-200">
                <img 
                  src={signedUrls[data.field_gps_image] || ''} 
                  alt="Field GPS" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActivitySection = () => {
    if (!activity) return null;

    const { primary_activity_type, primary_activity, secondary_activity_type, secondary_activity } = activity;

    // Early return if no activity data is available for the selected tab
    if (activeTab === 'primary' && !primary_activity) {
      return (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <FaExclamationTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No primary activity data available.</p>
        </div>
      );
    }

    if (activeTab === 'secondary' && (!secondary_activity || !secondary_activity_type)) {
      return (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <FaExclamationTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No secondary activity available.</p>
        </div>
      );
    }

    // Return the appropriate activity details based on the active tab
    if (activeTab === 'primary') {
      return renderActivityDetails(primary_activity, primary_activity_type);
    } else {
      return renderActivityDetails(secondary_activity, secondary_activity_type || '');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Loading activity data...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Year Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Financial Year</label>
        <select
          value={financialYear}
          onChange={handleYearChange}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">-- Select Year --</option>
          <option value="2024-25">2024-25</option>
          <option value="2023-24">2023-24</option>
          <option value="2022-23">2022-23</option>
        </select>
      </div>

      {activity && (
        <div className="space-y-6">
          {/* Activity Type Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('primary')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'primary'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Primary Activity
            </button>
            {activity.secondary_activity_type && (
              <button
                onClick={() => setActiveTab('secondary')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeTab === 'secondary'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Secondary Activity
              </button>
            )}
          </div>

          {/* Activity Details */}
          {renderActivitySection()}
        </div>
      )}
    </div>
  );
};

export default FarmerKyc;
