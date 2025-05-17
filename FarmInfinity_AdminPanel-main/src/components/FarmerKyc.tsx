import axios from 'axios';
import { useState } from 'react';

type FarmerKycProps = {
  applicationId?: string;
};

type Activity = {
  primary_activity_type: string;
  primary_activity: any;
  secondary_activity_type?: string;
  secondary_activity?: any;
};

const FarmerKyc: React.FC<FarmerKycProps> = ({ applicationId }) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [financialYear, setFinancialYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary');

  const fetchActivity = async (selectedYear: string) => {
    if (!applicationId) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setActivity(null);

      const { data } = await axios.get(`https://dev-api.farmeasytechnologies.com/api/fetch-activity-data/?application_id=${applicationId}&financial_year=${selectedYear}`);
      
      if (!data || Object.keys(data).length === 0) {
        setErrorMsg('No activity data available for selected financial year.');
      } else {
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

  const renderImages = (images: string[], title: string) => {
    if (!images?.length) return null;
    return (
      <div className="my-6">
        <h3 className="text-lg font-semibold mb-3">{title}:</h3>
        <div className="flex flex-wrap gap-4">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Farm"
              className="w-40 h-40 object-cover rounded-lg shadow-md border hover:scale-105 transition-transform"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSeasons = (seasons: any[]) => (
    <div className="my-6">
      <h3 className="text-2xl font-bold text-green-700 mb-4">Seasons & Crops</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {seasons.map((season, idx) => (
          <div
            key={idx}
            className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <p className="text-lg font-semibold text-green-800 mb-2">🌾 Season: {season.season_name}</p>
            <p><span className="font-semibold">Crops:</span> {season.crops?.map((c: any) => c.crop_name).join(', ') || 'N/A'}</p>
            {season.crop_inputs?.length > 0 && (
              <p><span className="font-semibold">Inputs:</span> {season.crop_inputs.map((input: any) => input.crop_input_name).join(', ')}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFarmingDetails = (data: any) => (
    <div className="bg-green-50 p-8 rounded-2xl shadow-md border border-green-200 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <img src="/farm-icon.svg" alt="Farm" className="w-8 h-8" />
        <h2 className="text-3xl font-extrabold text-green-800 tracking-wide">Farming Details</h2>
      </div>
      <div className="space-y-3 text-gray-700 text-lg leading-relaxed">
        <p><span className="font-semibold">Land Owned:</span> {data.land_owned} {data.area_unit}</p>
        <p><span className="font-semibold">Cultivation Area:</span> {data.cultivation_area} {data.area_unit}</p>
        <p><span className="font-semibold">Irrigation Types:</span> {data.irrigations?.map((i: any) => i.irrigation_type).join(', ') || 'N/A'}</p>
        <p><span className="font-semibold">Equipments:</span> {data.equipments?.map((e: any) => e.equipment_name).join(', ') || 'N/A'}</p>
        <p><span className="font-semibold">Crop Insurance:</span> {data.is_crop_insured || 'N/A'}</p>
        <p><span className="font-semibold">Post Harvest Storage Available:</span> {data.is_post_harvest_storage_available ? 'Yes' : 'No'}</p>
      </div>

      {renderSeasons(data.seasons)}
      {renderImages(data.images, "Farm Images")}

      {data.field_gps_image && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Field GPS Image:</h3>
          <img src={data.field_gps_image} alt="Field GPS" className="w-64 h-64 object-cover rounded-md shadow" />
        </div>
      )}
    </div>
  );

  const renderDairyDetails = (data: any) => (
    <div className="bg-blue-50 p-8 rounded-2xl shadow-md border border-blue-200 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <img src="/dairy-icon.svg" alt="Dairy" className="w-8 h-8" />
        <h2 className="text-3xl font-extrabold text-blue-800 tracking-wide">Dairy Details</h2>
      </div>
      <div className="space-y-3 text-gray-700 text-lg leading-relaxed">
        <p><span className="font-semibold">No. of Cows:</span> {data.no_of_livestock_cow}</p>
        <p><span className="font-semibold">No. of Bulls:</span> {data.no_of_livestock_bull}</p>
        <p><span className="font-semibold">No. of Calves:</span> {data.no_of_livestock_calves}</p>
        <p><span className="font-semibold">Insurance:</span> {data.insurance || 'N/A'}</p>
        <p><span className="font-semibold">Facility Dimensions:</span> {data.livestock_facility_dimension || 'N/A'}</p>
      </div>

      {data.facilities?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3">Facilities:</h3>
          <p>{data.facilities.map((f: any) => f.facility_name).join(', ')}</p>
        </div>
      )}

      {renderImages(data.images, "Dairy Facility Images")}

      {data.facility_gps_image && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Facility GPS Image:</h3>
          <img src={data.facility_gps_image} alt="Facility GPS" className="w-64 h-64 object-cover rounded-md shadow" />
        </div>
      )}
    </div>
  );
  const renderPoultryDetails = (title: string, data: any) => (
    <div className="bg-yellow-50 p-6 rounded-2xl shadow border mb-6">
      <h2 className="text-2xl font-bold text-yellow-700 mb-4">{title} Details</h2>
      <p><strong>Hens:</strong> {data.no_of_hen}</p>
      <p><strong>Cocks:</strong> {data.no_of_cock}</p>
      <p><strong>Coop Capacity:</strong> {data.coop_capacity || 'N/A'}</p>
      <p><strong>Feed Consumption:</strong> {data.feed_consumption || 'N/A'}</p>
      <p><strong>Insurance:</strong> {data.insurance || 'N/A'}</p>
      <p><strong>Facility Dimension:</strong> {data.coop_facility_dimension || 'N/A'}</p>
      {data.facilities?.length > 0 && <p><strong>Facilities:</strong> {data.facilities.map((f: any) => f.facility_name).join(', ')}</p>}
    </div>
  );
  const renderPlantationDetails = (data: any) => (
    <div className="bg-green-100 p-6 rounded-2xl shadow border mb-6">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Plantation Details</h2>
      <p><strong>Cultivation Area:</strong> {data.cultivation_area || 'N/A'} {data.area_unit}</p>
      <p><strong>Crop Insurance:</strong> {data.is_crop_insured ? 'Yes' : 'No'}</p>
      <p><strong>Post Harvest Facility:</strong> {data.is_post_harvest_facility_available ? 'Yes' : 'No'}</p>
      <p><strong>Irrigations:</strong> {Object.values(data.irrigations || {}).map((i: any) => i.irrigation_type).join(', ') || 'N/A'}</p>
      <p><strong>Equipments:</strong> {Object.values(data.equipments || {}).map((e: any) => e.equipment_name).join(', ') || 'N/A'}</p>
    </div>
  );
  const renderGoatDetails = (data: any) => (
    <div className="bg-purple-100 p-6 rounded-2xl shadow border mb-6">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">Goat Details</h2>
      <p><strong>Male Goats:</strong> {data.no_of_male_goat}</p>
      <p><strong>Female Goats:</strong> {data.no_of_female_goat}</p>
      <p><strong>Lambs:</strong> {data.no_of_lambs}</p>
      <p><strong>Shed Capacity:</strong> {data.shed_capacity || 'N/A'}</p>
      <p><strong>Feed Consumption:</strong> {data.feed_consumption || 'N/A'}</p>
      <p><strong>Insurance:</strong> {data.insurance || 'N/A'}</p>
      <p><strong>Facility Dimension:</strong> {data.shed_facility_dimension || 'N/A'}</p>
      {data.facilities?.length > 0 && <p><strong>Facilities:</strong> {data.facilities.map((f: any) => f.facility_name).join(', ')}</p>}
    </div>
  );
  const renderMushroomDetails = (data: any) => (
    <div className="bg-pink-100 p-6 rounded-2xl shadow border mb-6">
      <h2 className="text-2xl font-bold text-pink-800 mb-4">Mushroom Details</h2>
      <p><strong>No. of Cylinders:</strong> {data.no_of_cylinders}</p>
      <p><strong>Shed Capacity:</strong> {data.shed_capacity || 'N/A'}</p>
      <p><strong>Insurance:</strong> {data.insurance || 'N/A'}</p>
      <p><strong>Facility Dimension:</strong> {data.shed_facility_dimension || 'N/A'}</p>
      {data.facilities?.length > 0 && <p><strong>Facilities:</strong> {data.facilities.map((f: any) => f.facility_name).join(', ')}</p>}
    </div>
  );
  const renderFisheryDetails = (data: any) => (
    <div className="bg-blue-100 p-6 rounded-2xl shadow border mb-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Fishery Details</h2>
      <p><strong>No. of Fish:</strong> {data.no_of_fish_owned}</p>
      <p><strong>Pond Capacity:</strong> {data.pond_capacity || 'N/A'}</p>
      <p><strong>Feed Consumption:</strong> {data.feed_consumption || 'N/A'}</p>
      <p><strong>Insurance:</strong> {data.insurance || 'N/A'}</p>
      <p><strong>Pond Facility Dimension:</strong> {data.pond_facility_dimension || 'N/A'}</p>
      {data.facilities?.length > 0 && <p><strong>Facilities:</strong> {data.facilities.map((f: any) => f.facility_name).join(', ')}</p>}
    </div>
  );
  const renderPiggeryDetails = (data: any) => (
    <div className="bg-red-100 p-6 rounded-2xl shadow border mb-6">
      <h2 className="text-2xl font-bold text-red-800 mb-4">Piggery Details</h2>
      <p><strong>No. of Pigs:</strong> {data.no_of_pig_owned}</p>
      <p><strong>Breeder Pig Available:</strong> {data.is_breeder_pig_available ? 'Yes' : 'No'}</p>
      <p><strong>Pen Capacity:</strong> {data.pen_capacity || 'N/A'}</p>
      <p><strong>Feed Consumption:</strong> {data.feed_consumption || 'N/A'}</p>
      <p><strong>Insurance:</strong> {data.insurance || 'N/A'}</p>
      <p><strong>Facility Dimension:</strong> {data.pen_facility_dimension || 'N/A'}</p>
      {data.facilities?.length > 0 && <p><strong>Facilities:</strong> {data.facilities.map((f: any) => f.facility_name).join(', ')}</p>}
    </div>
  );
            
  const renderByType = (type: string, data: any) => {
    switch (type) {
      case 'Farming':
        return renderFarmingDetails(data);
      case 'Dairy':
        return renderDairyDetails(data);
      case 'Duckery':
      case 'Poultry':
        return renderPoultryDetails(type, data);
      case 'Plantation':
        return renderPlantationDetails(data);
      case 'Goat':
        return renderGoatDetails(data);
      case 'Mushroom':
        return renderMushroomDetails(data);
      case 'Fishery':
        return renderFisheryDetails(data);
      case 'Piggery':
        return renderPiggeryDetails(data);
      default:
        return <p className="text-gray-500">No detailed view available for {type}</p>;
    }
  };
  

  const renderActivitySection = () => {
    if (!activity) return null;

    const { primary_activity_type, primary_activity, secondary_activity_type, secondary_activity } = activity;

    if (activeTab === 'primary') {
      return renderByType(primary_activity_type, primary_activity);
    }
    if (activeTab === 'secondary' && secondary_activity_type) {
      return renderByType(secondary_activity_type, secondary_activity);
    }

    return <p className="text-gray-500">No secondary activity available.</p>;
  };

  return (
    <div className="p-6">
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
          <p className="text-blue-600 font-semibold animate-pulse">Loading activity data...</p>
        ) : errorMsg ? (
          <p className="text-red-500 font-semibold">{errorMsg}</p>
        ) : activity ? (
          <>
            {/* Tabs */}
            <div className="flex gap-6 mb-8">
              <button
                className={`px-5 py-2 rounded-full shadow ${activeTab === 'primary' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('primary')}
              >
                Primary Activity
              </button>
              {activity.secondary_activity_type && (
                <button
                  className={`px-5 py-2 rounded-full shadow ${activeTab === 'secondary' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => setActiveTab('secondary')}
                >
                  Secondary Activity
                </button>
              )}
            </div>

            {/* Activity Section */}
            {renderActivitySection()}
          </>
        ) : (
          <p className="text-gray-500">No activity data available. Please select a financial year.</p>
        )}
      </section>
    </div>
  );
};

export default FarmerKyc;
