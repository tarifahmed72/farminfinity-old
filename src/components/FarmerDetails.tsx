import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from '../utils/axios';
import FarmerKyc from "./FarmerKyc";
import ScoreCard from "./Scorecard";
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
  FaIdBadge
} from 'react-icons/fa';
import POIImages from "./POIImages";

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
  const { farmerId } = useParams<{ farmerId: string }>();
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

        const kycResponse = await axiosInstance.get(`/kyc-histories/${farmerId}`);

        if (kycResponse.data && kycResponse.data.length > 0) {
          const kycData = kycResponse.data[0];
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

  if (!farmerId) {
    return <div>Farmer ID is required</div>;
  }

  if (loading) {
    return <div>Loading POI images...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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

export default FarmerDetails;
