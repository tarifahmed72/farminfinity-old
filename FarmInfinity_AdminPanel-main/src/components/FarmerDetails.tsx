import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import FarmerKyc from "./FarmerKyc";
import ScoreCard from "./Scorecard";
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
  // Add other KYC related fields if present in the /kyc-histories response
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
  const { farmerId, applicationId } = useParams();
  const [bio, setBio] = useState<Bio | null>(null);
  const [kyc, setKyc] = useState<KYCData | null>(null);
  const [poi, setPoi] = useState<POIData | null>(null);
  const [poa, setPoa] = useState<POAData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  


  const [activeTab, setActiveTab] = useState<
    "profile" | "kyc" | "scorecard" | "Activity"
  >("profile");
  const imageBaseUrl = "https://dev-api.farmeasytechnologies.com/api/uploads/"; // Replace with your actual image base URL

  useEffect(() => {
    const fetchFarmerData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Bio (Assuming no token required)
        const bioHistoryResponse = await axios.get(
          `https://dev-api.farmeasytechnologies.com/api/bio-histories/${applicationId}?skip=0&limit=10`
        );

        if (bioHistoryResponse.data && bioHistoryResponse.data.length > 0) {
          const bio_version_id = bioHistoryResponse.data[0].bio_version_id;
          const bioResponse = await axios.get<Bio>(
            `https://dev-api.farmeasytechnologies.com/api/bio/${bio_version_id}`
          );
          setBio(bioResponse.data);
        } else {
          console.log("No bio history found for this application.");
          setBio({});
        }

        // Fetch KYC
        const kycResponse = await axios.get(
          `https://dev-api.farmeasytechnologies.com/api/kyc-histories/${farmerId}`
        );
        console.log("KYC Response:", kycResponse.data);

        const poi_id = kycResponse.data[0].poi_version_id;
        console.log(kycResponse.data[0].poa_version_id);
        console.log(kyc);

        const poa_id = kycResponse.data[0].poa_version_id;
        setKyc(kycResponse.data);
        console.log("KYC Response:", kyc);
        // Fetch POI
        if (poi_id) {
          const poiResponse = await axios.get<POIData>(
            `https://dev-api.farmeasytechnologies.com/api/poi/${poi_id}`
          );
          console.log("POI Response:", poiResponse.data);
          setPoi(poiResponse.data);
        } else {
          setPoi(null);
        }

        // Fetch POA
        if (poa_id) {
          const poaResponse = await axios.get<POAData>(
            `https://dev-api.farmeasytechnologies.com/api/poa/${poa_id}`
          );
          console.log("POA Response:", poaResponse.data);
          setPoa(poaResponse.data);
        } else {
          setPoa(null);
        }
      } catch (err: any) {
        setError("Failed to fetch data: " + err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();

    return () => {};
  }, [farmerId, applicationId]);

  const handleTabClick = (
    tab: "profile" | "kyc" | "scorecard" | "Activity"
  ) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading farmer details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabClick("profile")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-indigo-500 text-indigo-600 focus:outline-none focus:border-indigo-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-300"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => handleTabClick("kyc")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "kyc"
                  ? "border-indigo-500 text-indigo-600 focus:outline-none focus:border-indigo-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-300"
              }`}
            >
              KYC
            </button>
            <button
              onClick={() => handleTabClick("Activity")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "Activity"
                  ? "border-indigo-500 text-indigo-600 focus:outline-none focus:border-indigo-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-300"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => handleTabClick("scorecard")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "scorecard"
                  ? "border-indigo-500 text-indigo-600 focus:outline-none focus:border-indigo-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-300"
              }`}
            >
              Score Card
            </button>
            
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
        {activeTab === "profile" && bio && (
  <div className="space-y-8">
    <h3 className="text-2xl font-bold text-red-700">Farmer Bio Information</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: "ID", value: bio.id },
        { label: "Name", value: bio.name },
        { label: "Date of Birth", value: bio.dob },
        { label: "Email", value: bio.email },
        { label: "Gender", value: bio.gender || "N/A" },
        { label: "Alt Phone", value: bio.alt_phone || "N/A" },
        { label: "Village", value: bio.village || "N/A" },
        { label: "District", value: bio.district || "N/A" },
        { label: "City", value: bio.city || "N/A" },
        { label: "State", value: bio.state || "N/A" },
        { label: "PIN", value: bio.pin || "N/A" },
        { label: "FPO Name", value: bio.fpo_name || "N/A" },
        { label: "FPO Code", value: bio.fpo_code || "N/A" },
      ].map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-1"
        >
          <span className="text-sm font-semibold text-blue-600">{item.label}</span>
          <span className="text-base text-gray-800">{item.value}</span>
        </div>
      ))}

      {/* Full Address */}
      <div className="md:col-span-2 bg-white rounded-2xl shadow-md p-4 flex flex-col gap-1">
        <span className="text-sm font-semibold text-blue-600">Full Address</span>
        <span className="text-base text-gray-800">{bio.full_address || "N/A"}</span>
      </div>

      {/* Photo */}
      <div className="md:col-span-2 bg-white rounded-2xl shadow-md p-4 flex flex-col gap-4">
        <span className="text-sm font-semibold text-blue-600">Photo</span>
        {bio.photo ? (
          <img
            src={`${imageBaseUrl}${bio.photo}`}
            alt="Farmer Photo"
            className="w-48 h-48 object-cover rounded-lg shadow"
          />
        ) : (
          <span className="text-base text-gray-800">N/A</span>
        )}
      </div>
    </div>
  </div>
)}


{activeTab === "kyc" && kyc && (
  <div className="space-y-10">
    <h3 className="text-3xl font-bold text-gray-800 border-b pb-4">
      🛂 Farmer KYC Details
    </h3>

    {/* Primary Activity - POI */}
    {poi && (
      <div className="bg-gradient-to-br from-white to-gray-50 border-l-8 border-primary p-8 rounded-2xl shadow hover:shadow-lg transition-all">
        <h4 className="text-2xl font-semibold text-primary mb-6">
          🆔  Proof of Identity (POI)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            ["ID", poi.id],
            ["Type", poi.poi_type],
            ["Number", poi.poi_number],
            ["Name", poi.name],
            ["Date of Birth", poi.dob],
            ["Father's Name", poi.father],
            ["Gender", poi.gender],
            ["Husband's Name", poi.husband || "N/A"],
            ["Mother's Name", poi.mother],
            ["Year of Birth", poi.yob],
            ["PIN", poi.pin],
            ["City", poi.city],
            ["District", poi.district],
            ["State", poi.state],
            ["Relation", poi.relation || "N/A"],
            ["Verified", poi.is_verified ? "✅ Verified" : "❌ Not Verified"],
            ["Verification ID", poi.verification_id || "N/A"],
          ].map(([label, value], idx) => (
            <div
              key={idx}
              className="rounded-lg border p-4 bg-white hover:bg-gray-50 transition"
            >
              <div className="text-sm text-gray-500">{label}</div>
              <div className="mt-1 text-lg font-medium text-gray-800">{value}</div>
            </div>
          ))}

          {/* Full Address */}
          <div className="md:col-span-2 rounded-lg border p-4 bg-white hover:bg-gray-50 transition">
            <div className="text-sm text-gray-500">Full Address</div>
            <div className="mt-1 text-lg font-medium text-gray-800">{poi.address_full}</div>
          </div>

          {/* Images */}
          {poi.poi_image_front_url && (
            <div className="md:col-span-2 flex flex-col gap-2">
              <span className="text-sm text-gray-500">Front Image</span>
              <img
                src={`${imageBaseUrl}${poi.poi_image_front_url}`}
                alt="POI Front"
                className="rounded-xl border shadow-md w-full object-cover"
              />
            </div>
          )}
          {poi.poi_image_back_url && (
            <div className="md:col-span-2 flex flex-col gap-2">
              <span className="text-sm text-gray-500">Back Image</span>
              <img
                src={`${imageBaseUrl}${poi.poi_image_back_url}`}
                alt="POI Back"
                className="rounded-xl border shadow-md w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    )}

    {/* Secondary Activity - POA */}
    {poa && (
      <div className="bg-gradient-to-br from-white to-gray-100 border-l-8 border-secondary p-8 rounded-2xl shadow hover:shadow-lg transition-all">
        <h4 className="text-2xl font-semibold text-secondary mb-6">
          🏠  Proof of Address (POA)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            ["ID", poa.id],
            ["Type", poa.poa_type],
            ["Number", poa.poa_number],
            ["Name", poa.name],
            ["Date of Birth", poa.dob],
            ["Father's Name", poa.father],
            ["Gender", poa.gender],
            ["Husband's Name", poa.husband || "N/A"],
            ["Mother's Name", poa.mother],
            ["Year of Birth", poa.yob],
            ["PIN", poa.pin],
            ["City", poa.city],
            ["District", poa.district],
            ["State", poa.state],
            ["Relation", poa.relation || "N/A"],
            ["Verified", poa.is_verified ? "✅ Verified" : "❌ Not Verified"],
            ["Verification ID", poa.verification_id || "N/A"],
          ].map(([label, value], idx) => (
            <div
              key={idx}
              className="rounded-lg border p-4 bg-white hover:bg-gray-50 transition"
            >
              <div className="text-sm text-gray-500">{label}</div>
              <div className="mt-1 text-lg font-medium text-gray-800">{value}</div>
            </div>
          ))}

          {/* Full Address */}
          <div className="md:col-span-2 rounded-lg border p-4 bg-white hover:bg-gray-50 transition">
            <div className="text-sm text-gray-500">Full Address</div>
            <div className="mt-1 text-lg font-medium text-gray-800">{poa.address_full}</div>
          </div>

          {/* Images */}
          {poa.poa_image_front_url && (
            <div className="md:col-span-2 flex flex-col gap-2">
              <span className="text-sm text-gray-500">Front Image</span>
              <img
                src={`${imageBaseUrl}${poa.poa_image_front_url}`}
                alt="POA Front"
                className="rounded-xl border shadow-md w-full object-cover"
              />
            </div>
          )}
          {poa.poa_image_back_url && (
            <div className="md:col-span-2 flex flex-col gap-2">
              <span className="text-sm text-gray-500">Back Image</span>
              <img
                src={`${imageBaseUrl}${poa.poa_image_back_url}`}
                alt="POA Back"
                className="rounded-xl border shadow-md w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)}


       

          {activeTab === "Activity" && (
            <div>
              <FarmerKyc applicationId={applicationId} />
            </div>
          )}
 
          {activeTab === "scorecard" && (
            <div>
            <ScoreCard farmerId={farmerId} applicationId={applicationId} financialYear={"2024-25"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDetails;
