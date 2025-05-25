import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaLeaf, FaSpinner } from 'react-icons/fa';
import axiosInstance from '../utils/axios';
import { API_CONFIG } from '../config/api';

interface FarmerKycProps {
  applicationId: string;
  financialYear: string;
}

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

const FarmerKyc: React.FC<FarmerKycProps> = ({ applicationId, financialYear }) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary');
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // Get token from localStorage
  const token = localStorage.getItem('keycloak-token');
  const baseUrl = API_CONFIG.BASE_URL + "/uploads/";

  const getImageUrl = async (imagePath: string): Promise<string> => {
    if (!imagePath) return '';
    
    // First check if we have a cached signed URL
    if (signedUrls[imagePath]) {
      return signedUrls[imagePath];
    }
    
    try {
      // Get a new signed URL
      const response = await axiosInstance.get<SignedUrlResponse>(
        `/gcs-get-signed-image-url/${encodeURIComponent(imagePath)}`
      );
      
      const newSignedUrl = response.data.signed_url;
      
      // Cache the signed URL
      setSignedUrls(prev => ({
        ...prev,
        [imagePath]: newSignedUrl
      }));
      
      return newSignedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      // Fallback to token-based URL if signed URL fails
      return `${baseUrl}${imagePath}?token=Bearer ${token}`;
    }
  };

  const loadSignedUrls = async (data: any) => {
    const urlPromises = new Map();

    // Helper function to add image to promises
    const addImageToPromises = (image: string) => {
      if (image && !signedUrls[image]) {
        urlPromises.set(image, getImageUrl(image));
      }
    };

    // Add primary activity images
    if (data.primary_activity?.images?.[0]) {
      data.primary_activity.images[0].forEach(addImageToPromises);
    }
    if (data.primary_activity?.facility_gps_image) {
      addImageToPromises(data.primary_activity.facility_gps_image);
    }

    // Add secondary activity images
    if (data.secondary_activity?.images?.[0]) {
      data.secondary_activity.images[0].forEach(addImageToPromises);
    }
    if (data.secondary_activity?.facility_gps_image) {
      addImageToPromises(data.secondary_activity.facility_gps_image);
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
    const fetchActivity = async () => {
      if (!applicationId || !financialYear) return;
      try {
        setLoading(true);
        setErrorMsg('');
        setActivity(null);

        const { data } = await axiosInstance.get(`/fetch-activity-data/?application_id=${applicationId}&financial_year=${financialYear}`);

        if (!data || Object.keys(data).length === 0) {
          setErrorMsg('No activity data available for selected financial year.');
        } else {
          await loadSignedUrls(data);
          setActivity(data);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
        setErrorMsg('Failed to fetch activity data.');
      } finally {
        setLoading(false);
      }
    };
    if (financialYear) fetchActivity();
  }, [applicationId, financialYear]);

  const renderImages = (images: string[], title: string) => {
    if (!images?.length) return null;
    return (
      <div className="my-6">
        <h3 className="text-lg font-semibold mb-3">{title}:</h3>
        <div className="flex flex-wrap gap-4">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={signedUrls[img] || ''}
              alt={`${title} ${idx + 1}`}
              className="w-40 h-40 object-cover rounded-lg shadow-md border hover:scale-105 transition-transform"
              loading="lazy"
              onError={async (e) => {
                const url = await getImageUrl(img);
                (e.target as HTMLImageElement).src = url;
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderActivityDetails = (data: any, type: string) => {
    const getActivityColor = (activityType: string): string => {
      switch (activityType.toLowerCase()) {
        case 'farming':
          return 'from-green-500 to-green-600';
        case 'dairy':
          return 'from-blue-500 to-blue-600';
        case 'poultry':
        case 'duckery':
          return 'from-yellow-500 to-yellow-600';
        case 'goat':
          return 'from-purple-500 to-purple-600';
        case 'mushroom':
          return 'from-pink-500 to-pink-600';
        case 'fishery':
          return 'from-cyan-500 to-cyan-600';
        case 'piggery':
          return 'from-red-500 to-red-600';
        default:
          return 'from-gray-500 to-gray-600';
      }
    };

    const renderFields = () => {
      switch (type.toLowerCase()) {
        case 'farming':
          return (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <p><span className="font-semibold">Land Owned:</span> {data.land_owned} {data.area_unit}</p>
                <p><span className="font-semibold">Cultivation Area:</span> {data.cultivation_area} {data.area_unit}</p>
                <p><span className="font-semibold">Crop Insurance:</span> {data.is_crop_insured}</p>
                <p><span className="font-semibold">Farm Storage Available:</span> {data.is_farm_storage_available ? 'Yes' : 'No'}</p>
                <p><span className="font-semibold">Post Harvest Facilities:</span> {data.is_post_harvest_storage_available ? 'Yes' : 'No'}</p>
              </div>

              {/* Irrigation Types */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Irrigation Types:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.irrigations?.map((i: any) => (
                    <div key={i.irrigation_type_id} className="bg-blue-50 rounded-lg p-3">
                      <p className="text-blue-800">{i.irrigation_type}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Equipment:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.equipments?.map((e: any) => (
                    <div key={e.equipment_id} className="bg-purple-50 rounded-lg p-3">
                      <p className="text-purple-800">{e.equipment_name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seasonal Activities */}
              {data.seasons && data.seasons.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-green-600" />
                    Seasonal Activities
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {data.seasons.map((season: any) => (
                      <div key={season.season_id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">{season.season_name}</h4>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        
                        {/* Crops */}
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Crops:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {season.crops.map((crop: any) => (
                              <div key={crop.crop_id} className="bg-green-50 rounded-lg p-2">
                                <p className="text-sm text-green-800">{crop.crop_name}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Crop Inputs */}
                        {season.crop_inputs && season.crop_inputs.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Crop Inputs:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {season.crop_inputs.map((input: any) => (
                                <div key={input.crop_input_id} className="bg-yellow-50 rounded-lg p-2">
                                  <div className="flex justify-between items-center">
                                    <p className="text-sm text-yellow-800 font-medium">{input.crop_input_name}</p>
                                    <p className="text-sm text-yellow-600">
                                      {input.crop_input_quantity} {input.crop_input_quantity_unit}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Field GPS Image */}
              {data.field_gps_image && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Field GPS Image:</h3>
                  <div className="relative w-64 h-64">
                    <img
                      src={signedUrls[data.field_gps_image] || ''}
                      alt="Field GPS"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                      loading="lazy"
                      onError={async (e) => {
                        const url = await getImageUrl(data.field_gps_image);
                        (e.target as HTMLImageElement).src = url;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Activity Images */}
              {data.images?.[0] && renderImages(data.images[0], "Farming Images")}
            </div>
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
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <p><span className="font-semibold">Hens:</span> {data.no_hen || 0}</p>
                <p><span className="font-semibold">Cocks:</span> {data.no_cock || 0}</p>
                <p><span className="font-semibold">Coop Capacity:</span> {data.coop_capacity || 'N/A'}</p>
                <p><span className="font-semibold">Feed Consumption:</span> {data.feed_consumption || 'N/A'} kg/day</p>
                <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
                <p><span className="font-semibold">Facility Dimension:</span> {data.coop_facility_dimension || 'N/A'} sq ft</p>
                {data.egg_laying_capacity !== null && (
                  <p><span className="font-semibold">Egg Laying Capacity:</span> {data.egg_laying_capacity} eggs/day</p>
                )}
              </div>

              {/* Facilities */}
              {data.facilities && data.facilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Facilities:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.facilities.map((facility: any) => (
                      <div key={facility.facility_id} className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-yellow-800">{facility.facility_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Images */}
              {data.images && data.images.length > 0 && renderImages(data.images, `${type} Images`)}

              {/* Facility GPS Image */}
              {data.facility_gps_image && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Facility GPS Image:</h3>
                  <img
                    src={signedUrls[data.facility_gps_image] || ''}
                    alt="Facility GPS"
                    className="w-64 h-64 object-cover rounded-md shadow"
                    loading="lazy"
                    onError={async (e) => {
                      const url = await getImageUrl(data.facility_gps_image);
                      (e.target as HTMLImageElement).src = url;
                    }}
                  />
                </div>
              )}
            </div>
          );
        case 'plantation':
          return (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <p><span className="font-semibold">Cultivation Area:</span> {data.cultivation_area || 'N/A'} {data.area_unit}</p>
                <p><span className="font-semibold">Crop Insurance:</span> {data.is_crop_insured}</p>
                <p><span className="font-semibold">Post Harvest Facilities:</span> {data.is_post_harvest_storage_available ? 'Yes' : 'No'}</p>
              </div>

              {/* Irrigations */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Irrigation Types:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.irrigations?.map((i: any) => (
                    <div key={i.irrigation_type_id} className="bg-blue-50 rounded-lg p-3">
                      <p className="text-blue-800">{i.irrigation_type}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Equipment:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.equipments?.map((e: any) => (
                    <div key={e.equipment_id} className="bg-purple-50 rounded-lg p-3">
                      <p className="text-purple-800">{e.equipment_name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crops List */}
              {data.crops && data.crops.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Crops:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.crops.map((crop: any) => (
                      <div key={crop.crop_id} className="bg-green-50 rounded-lg p-3">
                        <p className="text-green-800">{crop.crop_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crop Inputs */}
              {data.crop_inputs && data.crop_inputs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Crop Inputs:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.crop_inputs.map((input: any) => (
                      <div key={input.crop_input_id} className="bg-yellow-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <p className="text-yellow-800 font-medium">{input.crop_input_name}</p>
                          <p className="text-yellow-600">
                            {input.crop_input_quantity} {input.crop_input_quantity_unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Field GPS Image */}
              {data.field_gps_image && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Field GPS Image:</h3>
                  <div className="relative w-64 h-64">
                    <img
                      src={signedUrls[data.field_gps_image] || ''}
                      alt="Field GPS"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                      loading="lazy"
                      onError={async (e) => {
                        const url = await getImageUrl(data.field_gps_image);
                        (e.target as HTMLImageElement).src = url;
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
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
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <p><span className="font-semibold">No. of Cylinders:</span> {data.no_of_cylinders || 0}</p>
                <p><span className="font-semibold">Shed Capacity:</span> {data.shed_capacity || 'N/A'}</p>
                <p><span className="font-semibold">Shed Facility Dimension:</span> {data.shed_facility_dimension || 'N/A'}</p>
                <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
              </div>

              {/* Breeds */}
              {data.breeds && data.breeds.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mushroom Breeds:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.breeds.map((breed: any) => (
                      <div key={breed.breed_type_id} className="bg-purple-50 rounded-lg p-3">
                        <p className="text-purple-800">{breed.breed_type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {data.facilities && data.facilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Facilities:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.facilities.map((facility: any) => (
                      <div key={facility.facility_id} className="bg-blue-50 rounded-lg p-3">
                        <p className="text-blue-800">{facility.facility_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facility GPS Image */}
              {data.facility_gps_image && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Facility GPS Image:</h3>
                  <div className="relative w-64 h-64">
                    <img
                      src={signedUrls[data.facility_gps_image] || ''}
                      alt="Facility GPS"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                      loading="lazy"
                      onError={async (e) => {
                        const url = await getImageUrl(data.facility_gps_image);
                        (e.target as HTMLImageElement).src = url;
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
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

          {/* Activity Images */}
          {data.images?.[0] && renderImages(data.images[0], `${type} Images`)}

          {/* Facility GPS image */}
          {data.facility_gps_image && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Facility GPS Image:</h3>
              <img
                src={signedUrls[data.facility_gps_image] || ''}
                alt="Facility GPS"
                className="w-64 h-64 object-cover rounded-md shadow"
                loading="lazy"
                onError={async (e) => {
                  const url = await getImageUrl(data.facility_gps_image);
                  (e.target as HTMLImageElement).src = url;
                }}
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
    
    const renderContent = () => {
      if (activeTab === 'primary') {
        return primary_activity && renderActivityDetails(primary_activity, primary_activity_type);
      } else {
        return secondary_activity && secondary_activity_type && renderActivityDetails(secondary_activity, secondary_activity_type);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-4">
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
              <span>Primary Activity</span>
            </div>
          </button>
          <button
            className={`px-5 py-2 rounded-full shadow-sm transition-all duration-200 ${
              activeTab === 'secondary'
                ? 'bg-green-500 text-white shadow-green-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveTab('secondary')}
          >
            <div className="flex items-center gap-2">
              <FaLeaf className="h-4 w-4" />
              <span>Secondary Activity</span>
            </div>
          </button>
        </div>
        {renderContent()}
      </div>
    );
  };

  if (!financialYear) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-500">Please select a financial year to view activity data.</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
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
            <div className="space-y-8">
              {renderActivitySection()}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-500">No activity data available for the selected year.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FarmerKyc;
