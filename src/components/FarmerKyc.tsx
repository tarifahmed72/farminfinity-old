import { useState } from 'react';
import axiosInstance from '../utils/axios';
import axios from 'axios';
import { FaCalendarAlt, FaLeaf, FaTractor, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

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

    const getActivityColor = (activityType: string) => {
      switch (activityType.toLowerCase()) {
        case 'farming':
          return 'from-green-500 to-green-600';
        case 'dairy':
          return 'from-blue-500 to-blue-600';
        case 'poultry':
        case 'duckery':
          return 'from-yellow-500 to-yellow-600';
        case 'fishery':
          return 'from-cyan-500 to-cyan-600';
        case 'goat':
          return 'from-purple-500 to-purple-600';
        case 'mushroom':
          return 'from-pink-500 to-pink-600';
        case 'piggery':
          return 'from-red-500 to-red-600';
        case 'plantation':
          return 'from-emerald-500 to-emerald-600';
        default:
          return 'from-gray-500 to-gray-600';
      }
    };

    const renderFields = () => {
      switch (type.toLowerCase()) {
        case 'farming':
          return (
            <>
              <p><span className="font-semibold">Land Owned:</span> {data.land_owned} {data.area_unit}</p>
              <p><span className="font-semibold">Cultivation Area:</span> {data.cultivation_area} {data.area_unit}</p>
              <p><span className="font-semibold">Irrigation Types:</span> {data.irrigations?.map((i: any) => i.irrigation_type).join(', ') || 'N/A'}</p>
              <p><span className="font-semibold">Equipments:</span> {data.equipments?.map((e: any) => e.equipment_name).join(', ') || 'N/A'}</p>
              <p><span className="font-semibold">Crop Insurance:</span> {data.is_crop_insured ? 'Yes' : 'No'}</p>
              <p><span className="font-semibold">Post Harvest Storage:</span> {data.is_post_harvest_storage_available ? 'Yes' : 'No'}</p>
              {data.seasons && renderSeasons(data.seasons)}
            </>
          );

        case 'dairy':
          return (
            <>
              <p><span className="font-semibold">No. of Cows:</span> {data.no_of_livestock_cow || 0}</p>
              <p><span className="font-semibold">No. of Bulls:</span> {data.no_of_livestock_bull || 0}</p>
              <p><span className="font-semibold">No. of Calves:</span> {data.no_of_livestock_calves || 0}</p>
              <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
              <p><span className="font-semibold">Facility Dimensions:</span> {data.livestock_facility_dimension || 'N/A'}</p>
            </>
          );

        case 'poultry':
        case 'duckery':
          return (
            <>
              <p><span className="font-semibold">Hens:</span> {data.no_of_hen || 0}</p>
              <p><span className="font-semibold">Cocks:</span> {data.no_of_cock || 0}</p>
              <p><span className="font-semibold">Coop Capacity:</span> {data.coop_capacity || 'N/A'}</p>
              <p><span className="font-semibold">Feed Consumption:</span> {data.feed_consumption || 'N/A'}</p>
              <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
              <p><span className="font-semibold">Facility Dimension:</span> {data.coop_facility_dimension || 'N/A'}</p>
            </>
          );

        case 'plantation':
          return (
            <>
              <p><span className="font-semibold">Cultivation Area:</span> {data.cultivation_area || 'N/A'} {data.area_unit}</p>
              <p><span className="font-semibold">Crop Insurance:</span> {data.is_crop_insured ? 'Yes' : 'No'}</p>
              <p><span className="font-semibold">Post Harvest Facility:</span> {data.is_post_harvest_storage_available ? 'Yes' : 'No'}</p>
              <p><span className="font-semibold">Irrigations:</span> {data.irrigations?.map((i: any) => i.irrigation_type).join(', ') || 'N/A'}</p>
              <p><span className="font-semibold">Equipments:</span> {data.equipments?.map((e: any) => e.equipment_name).join(', ') || 'N/A'}</p>
            </>
          );

        case 'goat':
          return (
            <>
              <p><span className="font-semibold">Male Goats:</span> {data.no_of_male_goat || 0}</p>
              <p><span className="font-semibold">Female Goats:</span> {data.no_of_female_goat || 0}</p>
              <p><span className="font-semibold">Lambs:</span> {data.no_of_lambs || 0}</p>
              <p><span className="font-semibold">Shed Capacity:</span> {data.shed_capacity || 'N/A'}</p>
              <p><span className="font-semibold">Feed Consumption:</span> {data.feed_consumption || 'N/A'}</p>
              <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
              <p><span className="font-semibold">Facility Dimension:</span> {data.shed_facility_dimension || 'N/A'}</p>
            </>
          );

        case 'mushroom':
          return (
            <>
              <p><span className="font-semibold">No. of Cylinders:</span> {data.no_of_cylinders || 0}</p>
              <p><span className="font-semibold">Shed Capacity:</span> {data.shed_capacity || 'N/A'}</p>
              <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
              <p><span className="font-semibold">Facility Dimension:</span> {data.shed_facility_dimension || 'N/A'}</p>
            </>
          );

        case 'fishery':
          return (
            <>
              <p><span className="font-semibold">No. of Fish:</span> {data.no_of_fish_owned || 0}</p>
              <p><span className="font-semibold">Pond Capacity:</span> {data.pond_capacity || 'N/A'}</p>
              <p><span className="font-semibold">Feed Consumption:</span> {data.feed_consumption || 'N/A'}</p>
              <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
              <p><span className="font-semibold">Pond Facility Dimension:</span> {data.pond_facility_dimension || 'N/A'}</p>
            </>
          );

        case 'piggery':
          return (
            <>
              <p><span className="font-semibold">No. of Pigs:</span> {data.no_of_pig_owned || 0}</p>
              <p><span className="font-semibold">Breeder Pig Available:</span> {data.is_breeder_pig_available ? 'Yes' : 'No'}</p>
              <p><span className="font-semibold">Pen Capacity:</span> {data.pen_capacity || 'N/A'}</p>
              <p><span className="font-semibold">Feed Consumption:</span> {data.feed_consumption || 'N/A'}</p>
              <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
              <p><span className="font-semibold">Facility Dimension:</span> {data.pen_facility_dimension || 'N/A'}</p>
            </>
          );

        default:
          return <p className="text-gray-500">No detailed view available for {type}</p>;
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className={`bg-gradient-to-r ${getActivityColor(type)} px-6 py-4`}>
          <div className="flex items-center gap-3">
            <FaLeaf className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">{type} Details</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3 text-gray-700 text-lg leading-relaxed">
            {renderFields()}
          </div>

          {data.facilities?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Facilities:</h3>
              <p>{data.facilities.map((f: any) => f.facility_name).join(', ')}</p>
            </div>
          )}

          {renderImages(data.images, `${type} Images`)}

          {data.facility_gps_image && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Facility GPS Image:</h3>
              <img
                src={signedUrls[data.facility_gps_image] || ''}
                alt="Facility GPS"
                className="w-64 h-64 object-cover rounded-md shadow"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActivitySection = () => {
    if (!activity) return null;

    const { primary_activity_type, primary_activity, secondary_activity_type, secondary_activity } = activity;

    // Show only Farming activities in primary tab
    if (activeTab === 'primary') {
      if (primary_activity_type.toLowerCase() === 'farming') {
        return renderActivityDetails(primary_activity, primary_activity_type);
      } else if (secondary_activity_type?.toLowerCase() === 'farming') {
        return renderActivityDetails(secondary_activity, secondary_activity_type);
      } else {
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-500">No farming activities found.</p>
          </div>
        );
      }
    }

    // Show all non-farming activities in secondary tab
    if (activeTab === 'secondary') {
      const nonFarmingActivities = [];
      
      if (primary_activity_type.toLowerCase() !== 'farming') {
        nonFarmingActivities.push({
          type: primary_activity_type,
          data: primary_activity
        });
      }
      
      if (secondary_activity_type && secondary_activity_type.toLowerCase() !== 'farming') {
        nonFarmingActivities.push({
          type: secondary_activity_type,
          data: secondary_activity
        });
      }

      return nonFarmingActivities.length > 0 ? (
        <div className="space-y-8">
          {nonFarmingActivities.map((activity, index) => (
            <div key={index}>
              {renderActivityDetails(activity.data, activity.type)}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-500">No other activities found.</p>
        </div>
      );
    }

    return null;
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
        <section className="mb-8">
          <label className="block mb-3 font-semibold text-lg">Select Financial Year:</label>
          <select
            className="border p-3 rounded-md w-72 shadow-sm focus:ring-2 focus:ring-green-400"
            value={financialYear}
            onChange={handleYearChange}
          >
            <option value="">-- Select Year --</option>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
          </select>
        </section>

        <section>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-3 text-lg text-gray-600">Loading activity data...</span>
            </div>
          ) : errorMsg ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errorMsg}</p>
            </div>
          ) : activity ? (
            <>
              {/* Tabs */}
              <div className="flex gap-6 mb-8">
                <button
                  className={`px-5 py-2 rounded-full shadow-sm transition-all duration-200 ${
                    activeTab === 'primary'
                      ? 'bg-green-500 text-white shadow-green-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('primary')}
                >
                  <div className="flex items-center gap-2">
                    <FaLeaf className="h-4 w-4" />
                    <span>Farming Activities</span>
                  </div>
                </button>
                <button
                  className={`px-5 py-2 rounded-full shadow-sm transition-all duration-200 ${
                    activeTab === 'secondary'
                      ? 'bg-blue-500 text-white shadow-blue-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('secondary')}
                >
                  <div className="flex items-center gap-2">
                    <FaTractor className="h-4 w-4" />
                    <span>Other Activities</span>
                  </div>
                </button>
              </div>

              {/* Activity Section */}
              {renderActivitySection()}
            </>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-500">Please select a financial year to view activity data.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FarmerKyc;
