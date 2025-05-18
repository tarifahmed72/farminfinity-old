import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

interface POIData {
  poi_image_front_url?: string | null;
  poi_image_back_url?: string | null;
}

interface POIImagesProps {
  farmerId: string;
}

const POIImages: React.FC<POIImagesProps> = ({ farmerId }) => {
  const [poi, setPoi] = useState<POIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageBaseUrl = "https://dev-api.farmeasytechnologies.com/api/uploads/";

  useEffect(() => {
    const fetchPOIImages = async () => {
      if (!farmerId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch KYC first to get POI version ID
        const kycResponse = await axiosInstance.get(`/kyc-histories/${farmerId}`);

        if (kycResponse.data && kycResponse.data.length > 0) {
          const kycData = kycResponse.data[0];

          // Fetch POI if version ID exists
          if (kycData.poi_version_id) {
            const poiResponse = await axiosInstance.get<POIData>(`/poi/${kycData.poi_version_id}`);
            setPoi(poiResponse.data);
          }
        }
      } catch (err: any) {
        setError("Failed to fetch POI images: " + err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPOIImages();
  }, [farmerId]);

  if (loading) {
    return <div>Loading POI images...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">POI Document Images</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {poi?.poi_image_front_url && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Front Side Image</h3>
            <img 
              src={`${imageBaseUrl}${poi.poi_image_front_url}`}
              alt="POI Front"
              className="w-full h-auto rounded-lg mb-2"
            />
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-sm break-all">
                <span className="font-medium">URL: </span>
                {`${imageBaseUrl}${poi.poi_image_front_url}`}
              </p>
            </div>
          </div>
        )}
        
        {poi?.poi_image_back_url && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Back Side Image</h3>
            <img 
              src={`${imageBaseUrl}${poi.poi_image_back_url}`}
              alt="POI Back"
              className="w-full h-auto rounded-lg mb-2"
            />
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-sm break-all">
                <span className="font-medium">URL: </span>
                {`${imageBaseUrl}${poi.poi_image_back_url}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POIImages; 