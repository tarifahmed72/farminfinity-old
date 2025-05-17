import { useState } from 'react';
import axiosInstance from '../utils/axios';
import axios from 'axios';
import { FaCalendarAlt, FaLeaf, FaTractor, FaWater, FaWarehouse, FaShieldAlt } from 'react-icons/fa';

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
  const [activeTab, setActiveTab] = useState('primary');
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

  const renderFarmingDetails = (data: any) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <FaLeaf className="h-6 w-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Farming Details</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FaTractor className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Land Owned</p>
                <p className="text-lg font-medium">{data.land_owned} {data.area_unit}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaLeaf className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Cultivation Area</p>
                <p className="text-lg font-medium">{data.cultivation_area} {data.area_unit}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FaWater className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Irrigation Types</p>
                <p className="text-lg font-medium">{data.irrigations?.map((i: any) => i.irrigation_type).join(', ') || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaTractor className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Equipment</p>
                <p className="text-lg font-medium">{data.equipments?.map((e: any) => e.equipment_name).join(', ') || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Crop Insurance</p>
                <p className="text-lg font-medium">{data.is_crop_insured || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaWarehouse className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-500">Post Harvest Storage</p>
                <p className="text-lg font-medium">{data.is_post_harvest_storage_available ? 'Available' : 'Not Available'}</p>
              </div>
            </div>
          </div>
        </div>

        {renderSeasons(data.seasons)}
        {renderImages(data.images?.[0] || [], "Farm Images")}

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

  const { secondary_activity } = activity || {};

  const renderActivitySection = () => {
    if (!activity) return null;

    const { primary_activity } = activity;

    if (activeTab === 'primary') {
      return renderFarmingDetails(primary_activity);
    }

    return renderFarmingDetails(secondary_activity);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Year Selection */}
      <div className="flex items-center gap-4">
        <select
          value={financialYear}
          onChange={handleYearChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select Financial Year</option>
          <option value="2024-25">2024-25</option>
          <option value="2023-24">2023-24</option>
          <option value="2022-23">2022-23</option>
        </select>
      </div>

      {activity && (
        <div className="space-y-8">
          {/* Activity Type Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('primary')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'primary'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Primary Activity
            </button>
            <button
              onClick={() => setActiveTab('secondary')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'secondary'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Secondary Activity
            </button>
          </div>

          {/* Activity Details */}
          {renderActivitySection()}
        </div>
      )}
    </div>
  );
};

export default FarmerKyc;
