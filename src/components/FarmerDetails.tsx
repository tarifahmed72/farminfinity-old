import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from '../utils/axios';
import FarmerKyc from "./FarmerKyc";
import ScoreCardContainer from './ScoreCardContainer';
import ReportRemark from './ReportRemark';
import FamilyMembers from './FamilyMembers';
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
  FaIdBadge,
  FaHome,
  FaLeaf
} from 'react-icons/fa';

interface Bio {
  id?: string;
  name?: string;
  dob?: string;
  email?: string;
  gender?: string | null;
  primary_phone?: string | null;
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

interface SignedUrlResponse {
  filename: string;
  signed_url: string;
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
  city?: string | null;
  district?: string | null;
  state?: string | null;
  relation?: string | null;
  poi_image_front_url?: string | null;
  poi_image_back_url?: string | null;
  is_verified?: boolean | null;
  verification_id?: string | null;
  updated_at?: string | null;
}

interface POAData {
  id?: string;
  poa_type?: string | null;
  poa_number?: string | null;
  name?: string | null;
  dob?: string | null;
  father?: string | null;
  gender?: string | null;
  husband?: string | null;
  mother?: string | null;
  yob?: number | null;
  address_full?: string | null;
  pin?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  relation?: string | null;
  poa_image_front_url?: string | null;
  poa_image_back_url?: string | null;
  is_verified?: boolean | null;
  verification_id?: string | null;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'activities' | 'scorecard' | 'remarks'>('profile');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [imageErrorStates, setImageErrorStates] = useState<Record<string, boolean>>({});
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>('');

  const extractImageName = (imagePath: string): string => {
    // Handle "None" case
    if (!imagePath || imagePath === "None") return "";
    
    // Handle full URLs
    if (imagePath.startsWith('http')) {
      const urlParts = imagePath.split('/');
      return urlParts[urlParts.length - 1];
    }
    
    // Extract just the filename from the path
    const filename = imagePath.split('/').pop();
    if (!filename) return "";

    // Remove any query parameters if present
    return filename.split('?')[0];
  };

  const getImageUrl = async (imagePath: string | null | undefined, retryCount = 0): Promise<string> => {
    if (!imagePath || imagePath === "None") return '';
    
    try {
      // First check if we have a cached signed URL that hasn't expired
      if (signedUrls[imagePath]) {
        return signedUrls[imagePath];
      }
      
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: true }));
      setImageErrorStates(prev => ({ ...prev, [imagePath]: false }));
      
      // Extract just the filename from the path
      const imageName = extractImageName(imagePath);
      if (!imageName) {
        throw new Error('Invalid image path');
      }
      
      console.log('Requesting signed URL for image:', imageName);

      // Get a new signed URL using the correct endpoint format
      const response = await axiosInstance.get<SignedUrlResponse>(
        `https://dev-api.farmeasytechnologies.com/api/gcs-get-signed-image-url/${encodeURIComponent(imageName)}`
      );
      
      if (!response.data?.signed_url) {
        throw new Error('Invalid signed URL response');
      }

      const newSignedUrl = response.data.signed_url;
      console.log('Received signed URL:', newSignedUrl);
      
      // Cache the signed URL
      setSignedUrls(prev => ({
        ...prev,
        [imagePath]: newSignedUrl
      }));
      
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: false }));
      return newSignedUrl;
      
    } catch (error) {
      console.error('Error getting signed URL for', imagePath, ':', error);
      
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return getImageUrl(imagePath, retryCount + 1);
      }
      
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: false }));
      setImageErrorStates(prev => ({ ...prev, [imagePath]: true }));
      
      throw error;
    }
  };

  const handleImageError = async (imagePath: string | null | undefined, imgElement: HTMLImageElement) => {
    if (!imagePath || imagePath === "None") return;
    
    try {
      console.log('Handling image load error for:', imagePath);
      
      // Clear any existing error state and set loading
      setImageErrorStates(prev => ({ ...prev, [imagePath]: false }));
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: true }));
      
      // Clear the cached URL to force a fresh request
      setSignedUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[imagePath];
        return newUrls;
      });
      
      // Try to get a fresh URL with retry
      const url = await getImageUrl(imagePath, 0);
      console.log('Received new URL for retry:', url);
      
      // Only update the image if it's still mounted and hasn't errored
      if (imgElement && document.body.contains(imgElement)) {
        imgElement.src = url;
      }
      
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: false }));
      
    } catch (error) {
      console.error('Error handling image load failure:', error);
      setImageErrorStates(prev => ({ ...prev, [imagePath]: true }));
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: false }));
    }
  };

  const handleRetryClick = async (imagePath: string | null | undefined) => {
    if (!imagePath || imagePath === "None") return;
    
    try {
      // Reset states
      setImageErrorStates(prev => ({ ...prev, [imagePath]: false }));
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: true }));
      
      // Clear all cached URLs for this image
      setSignedUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[imagePath];
        return newUrls;
      });
      
      // Get fresh URL starting with retry count 0
      const url = await getImageUrl(imagePath, 0);
      console.log('Got fresh URL on retry:', url);
      
      // Update the signed URLs cache
      setSignedUrls(prev => ({ ...prev, [imagePath]: url }));
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: false }));
      
    } catch (error) {
      console.error('Error retrying image load:', error);
      setImageErrorStates(prev => ({ ...prev, [imagePath]: true }));
      setImageLoadingStates(prev => ({ ...prev, [imagePath]: false }));
    }
  };

  const loadSignedUrls = async (poiData: POIData | null, poaData: POAData | null) => {
    const urlPromises = new Map();

    // Helper function to add image to promises
    const addImageToPromises = (image: string | null | undefined) => {
      if (image && image !== "None" && !signedUrls[image]) {
        console.log('Adding image to load queue:', image);
        setImageLoadingStates(prev => ({ ...prev, [image]: true }));
        urlPromises.set(image, getImageUrl(image, 0)); // Start with retry count 0
      }
    };

    // Add POI images
    if (poiData) {
      console.log('Loading POI images');
      addImageToPromises(poiData.poi_image_front_url);
      addImageToPromises(poiData.poi_image_back_url);
    }

    // Add POA images - ensure we're using the correct URL format
    if (poaData) {
      console.log('Loading POA images');
      const poaFrontUrl = poaData.poa_image_front_url;
      const poaBackUrl = poaData.poa_image_back_url;
      
      console.log('POA front URL:', poaFrontUrl);
      console.log('POA back URL:', poaBackUrl);
      
      if (poaFrontUrl) addImageToPromises(poaFrontUrl);
      if (poaBackUrl) addImageToPromises(poaBackUrl);
    }

    if (urlPromises.size > 0) {
      try {
        console.log(`Loading ${urlPromises.size} images...`);
        const results = await Promise.allSettled(urlPromises.values());
        const newSignedUrls: Record<string, string> = { ...signedUrls };
        
        let i = 0;
        urlPromises.forEach((_, key) => {
          const result = results[i];
          if (result.status === 'fulfilled' && result.value) {
            console.log('Successfully loaded URL for:', key);
            newSignedUrls[key] = result.value;
            setImageErrorStates(prev => ({ ...prev, [key]: false }));
          } else {
            console.error(`Failed to load URL for ${key}:`, result.status === 'rejected' ? result.reason : 'No URL returned');
            setImageErrorStates(prev => ({ ...prev, [key]: true }));
          }
          setImageLoadingStates(prev => ({ ...prev, [key]: false }));
          i++;
        });
        
        setSignedUrls(newSignedUrls);
      } catch (error) {
        console.error('Error loading signed URLs:', error);
        // Set error states for all images that failed
        urlPromises.forEach((_, key) => {
          setImageErrorStates(prev => ({ ...prev, [key]: true }));
          setImageLoadingStates(prev => ({ ...prev, [key]: false }));
        });
      }
    }
  };

  useEffect(() => {
    const fetchFarmerData = async () => {
      if (!farmerId || !applicationId) {
        setError('Missing farmerId or applicationId in the URL.');
        console.error('Missing farmerId or applicationId:', { farmerId, applicationId });
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // First fetch farmer details to get phone number
        let farmerPhone = null;
        try {
          const farmerResponse = await axiosInstance.get(`/farmers/${farmerId}`);
          console.log('Full farmer response:', farmerResponse);
          // Access the phone number from the data property
          farmerPhone = farmerResponse.data?.data?.phone_no;
          console.log('Farmer phone fetched:', farmerPhone);
        } catch (phoneError) {
          console.error('Error fetching farmer phone:', phoneError);
        }

        // Then fetch Bio
        const bioHistoryResponse = await axiosInstance.get(
          `/bio-histories/${applicationId}?skip=0&limit=10`
        );
        console.log('Bio history response:', bioHistoryResponse.data);
        if (!bioHistoryResponse.data || bioHistoryResponse.data.length === 0) {
          throw new Error('No bio history found for this application.');
        }

        const bio_version_id = bioHistoryResponse.data[0].bio_version_id;
        const bioResponse = await axiosInstance.get(`/bio/${bio_version_id}`);
        console.log('Bio response:', bioResponse.data);
        if (!bioResponse.data) {
          throw new Error('No bio data found for this application.');
        }

        // Initialize bioData with bio response and set phone numbers
        const bioData = {
          ...bioResponse.data,
          primary_phone: farmerPhone || bioResponse.data.primary_phone,
          alt_phone: farmerPhone && bioResponse.data.primary_phone && bioResponse.data.primary_phone !== farmerPhone 
            ? bioResponse.data.primary_phone 
            : bioResponse.data.alt_phone
        };
        console.log('Setting bio data with phones:', { 
          primary: bioData.primary_phone, 
          alt: bioData.alt_phone,
          farmerPhone: farmerPhone
        });
        setBio(bioData);

        let poiData = null;
        let poaData = null;

        // Fetch KYC data
        try {
          const kycResponse = await axiosInstance.get(`/kyc-histories/${farmerId}`);
          console.log('KYC response:', kycResponse.data);
          if (kycResponse.data && kycResponse.data.length > 0) {
            setKyc(kycResponse.data[0]);

            // Fetch POI if available
            if (kycResponse.data[0].poi_version_id) {
              const poiResponse = await axiosInstance.get(
                `/poi/${kycResponse.data[0].poi_version_id}`
              );
              if (poiResponse.data) {
                poiData = poiResponse.data;
                setPoi(poiData);
              }
            }

            // Fetch POA if available
            if (kycResponse.data[0].poa_version_id) {
              const poaResponse = await axiosInstance.get(
                `/poa/${kycResponse.data[0].poa_version_id}`
              );
              if (poaResponse.data) {
                poaData = poaResponse.data;
                setPoa(poaData);
              }
            }

            // Load signed URLs for POI and POA images
            await loadSignedUrls(poiData, poaData);
          }
        } catch (kycError) {
          console.error('Error fetching KYC data:', kycError);
          setError('Failed to load KYC data. Some information may be missing.');
        }

      } catch (error: any) {
        console.error('Error in fetchFarmerData:', error);
        setError(error?.message || 'Failed to fetch farmer data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, [farmerId, applicationId]);

  useEffect(() => {
    if (bio?.photo) {
      console.log('Preloading bio photo:', bio.photo);
      getImageUrl(bio.photo)
        .then(url => {
          console.log('Preloading image with URL:', url);
          // Preload the image
          const img = new Image();
          img.src = url;
          return new Promise((resolve, reject) => {
            img.onload = () => {
              console.log('Bio photo preloaded successfully');
              resolve(undefined);
            };
            img.onerror = (error) => {
              console.error('Failed to preload bio photo:', error);
              reject(error);
            };
          });
        })
        .catch(error => {
          console.error('Error preloading bio photo:', error);
          if (bio.photo) {
            setImageErrorStates(prev => ({ ...prev, [bio.photo as string]: true }));
          }
        });
    }
  }, [bio?.photo]);

  // Add preloading for POI/POA images
  useEffect(() => {
    const preloadImages = async () => {
      // Helper function to preload a single image
      const preloadImage = async (imagePath: string | null | undefined) => {
        if (!imagePath || imagePath === "None") return;
        
        try {
          console.log('Preloading image:', imagePath);
          const url = await getImageUrl(imagePath, 0);
          
          // Create and load the image
          const img = new Image();
          img.src = url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          console.log('Successfully preloaded:', imagePath);
        } catch (error) {
          console.error('Failed to preload image:', imagePath, error);
        }
      };

      // Preload POI images
      if (poi) {
        await Promise.all([
          preloadImage(poi.poi_image_front_url),
          preloadImage(poi.poi_image_back_url)
        ]);
      }

      // Preload POA images
      if (poa) {
        await Promise.all([
          preloadImage(poa.poa_image_front_url),
          preloadImage(poa.poa_image_back_url)
        ]);
      }
    };

    preloadImages();
  }, [poi, poa]);

  const handleTabClick = (
    tab: 'profile' | 'kyc' | 'activities' | 'scorecard' | 'remarks'
  ) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-600">Loading farmer details...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-center text-gray-900">Error Loading Data</h3>
          <p className="mt-2 text-center text-sm text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img 
              src={selectedImage} 
              alt="Document Preview" 
              className="w-full h-auto rounded-lg shadow-xl"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all duration-200"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center">
                <div className="flex items-center space-x-4">
                  {bio?.photo ? (
                    <img
                      src={signedUrls[bio.photo] || ''}
                      alt={bio.name}
                      className="h-20 w-20 rounded-full border-4 border-white shadow-md object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => bio.photo && setSelectedImage(signedUrls[bio.photo])}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                      <FaUser className="h-8 w-8 text-white/80" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-white">{bio?.name || 'N/A'}</h1>
                    <p className="text-green-100 flex items-center mt-1">
                      <FaIdBadge className="mr-2" />
                      ID: {bio?.id || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaEnvelope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">{bio?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaPhone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Primary Phone</p>
                    <p className="mt-1 text-sm text-gray-900">{bio?.primary_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaBuilding className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">FPO</p>
                    <p className="mt-1 text-sm text-gray-900">{bio?.fpo_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'profile', label: 'Profile', icon: FaUser },
                { id: 'kyc', label: 'KYC', icon: FaIdCard },
                { id: 'activities', label: 'Activities', icon: FaClipboardList },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabClick(id as any)}
                  className={`${
                    activeTab === id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center space-x-2 py-4 px-1 border-b-2 font-medium transition-colors duration-200`}
                >
                  <Icon className={`h-5 w-5 ${activeTab === id ? 'text-green-500' : 'text-gray-400'}`} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && bio && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "Full Name", value: bio.name, icon: FaUser },
                    { label: "Date of Birth", value: bio.dob, icon: FaCalendarAlt },
                    { label: "Gender", value: bio.gender, icon: FaVenusMars },
                    { label: "Email", value: bio.email, icon: FaEnvelope },
                    { label: "Primary Phone", value: bio.primary_phone, icon: FaPhone },
                    { label: "Alternate Phone", value: bio.alt_phone, icon: FaPhone },
                    { label: "Village", value: bio.village, icon: FaMapMarkerAlt },
                    { label: "District", value: bio.district, icon: FaMapMarkerAlt },
                    { label: "State", value: bio.state, icon: FaMapMarkerAlt },
                    { label: "PIN Code", value: bio.pin, icon: FaMapMarkerAlt },
                    { label: "FPO Name", value: bio.fpo_name, icon: FaBuilding },
                    { label: "FPO Code", value: bio.fpo_code, icon: FaIdBadge },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">{label}</p>
                          <p className="mt-1 text-sm text-gray-900">{value || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full Address */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="ml-4 text-lg font-medium text-gray-900">Full Address</h3>
                  </div>
                  <p className="text-gray-600 ml-14">{bio.full_address || 'N/A'}</p>
                </div>

                {/* Photo */}
                {bio.photo && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FaUser className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="ml-4 text-lg font-medium text-gray-900">Profile Photo</h3>
                    </div>
                    <div className="ml-14 relative">
                      {imageLoadingStates[bio.photo as string] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
                          <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                      )}
                      {imageErrorStates[bio.photo as string] ? (
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="text-center p-4">
                            <FaUser className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Failed to load image</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={signedUrls[bio.photo as string] || ''}
                          alt="Farmer"
                          className="w-48 h-48 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                          onClick={() => bio.photo && setSelectedImage(signedUrls[bio.photo as string])}
                          onError={(e) => handleImageError(bio.photo, e.target as HTMLImageElement)}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Family Members Section */}
                <FamilyMembers bioId={bio.id || ''} />
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-8">
                {/* KYC Status */}
                {kyc && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <FaIdCard className="mr-2" />
                        KYC Status
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className={`rounded-lg p-4 ${kyc.status === 'VERIFIED' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <div className="mt-1 flex items-center">
                            {kyc.status === 'VERIFIED' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⚠ Pending
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500">Remarks</p>
                          <p className="mt-1 text-sm text-gray-900">{kyc.remarks || 'No remarks'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500">Created At</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {kyc.created_at ? new Date(kyc.created_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-500">Updated At</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {kyc.updated_at ? new Date(kyc.updated_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents Section */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <FaIdCard className="mr-2" />
                      Documents
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* POI Document */}
                    {poi && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FaIdCard className="mr-2 text-indigo-600" />
                            Proof of Identity (POI)
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500">Document Type</p>
                              <p className="text-base font-medium">{poi.poi_type || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500">Document Number</p>
                              <p className="text-base font-medium">{poi.poi_number || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Front Image */}
                            {poi.poi_image_front_url && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Front Side</p>
                                <div className="relative group">
                                  {poi.poi_image_front_url && imageLoadingStates[poi.poi_image_front_url] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg z-10">
                                      <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
                                    </div>
                                  )}
                                  {poi.poi_image_front_url && imageErrorStates[poi.poi_image_front_url] ? (
                                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                                      <div className="text-center p-4">
                                        <FaIdCard className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Failed to load POI front image</p>
                                        <button
                                          onClick={() => poi.poi_image_front_url && handleRetryClick(poi.poi_image_front_url)}
                                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                          Retry
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={poi.poi_image_front_url && signedUrls[poi.poi_image_front_url] || ''}
                                      alt="POI Front"
                                      className="w-full h-48 object-cover rounded-lg shadow-sm border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                                      onClick={() => poi.poi_image_front_url && setSelectedImage(signedUrls[poi.poi_image_front_url] || '')}
                                      onError={(e) => handleImageError(poi.poi_image_front_url, e.target as HTMLImageElement)}
                                    />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Back Image */}
                            {poi.poi_image_back_url && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Back Side</p>
                                <div className="relative group">
                                  {poi.poi_image_back_url && imageLoadingStates[poi.poi_image_back_url] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg z-10">
                                      <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
                                    </div>
                                  )}
                                  {poi.poi_image_back_url && imageErrorStates[poi.poi_image_back_url] ? (
                                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                                      <div className="text-center p-4">
                                        <FaIdCard className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Failed to load POI back image</p>
                                        <button
                                          onClick={() => poi.poi_image_back_url && handleRetryClick(poi.poi_image_back_url)}
                                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                          Retry
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={poi.poi_image_back_url && signedUrls[poi.poi_image_back_url] || ''}
                                      alt="POI Back"
                                      className="w-full h-48 object-cover rounded-lg shadow-sm border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                                      onClick={() => poi.poi_image_back_url && setSelectedImage(signedUrls[poi.poi_image_back_url] || '')}
                                      onError={(e) => handleImageError(poi.poi_image_back_url, e.target as HTMLImageElement)}
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* POA Document */}
                    {poa && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FaHome className="mr-2 text-indigo-600" />
                            Proof of Address (POA)
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500">Document Type</p>
                              <p className="text-base font-medium">{poa.poa_type || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500">Document Number</p>
                              <p className="text-base font-medium">{poa.poa_number || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Front Image */}
                            {poa.poa_image_front_url && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Front Side</p>
                                <div className="relative group">
                                  {poa.poa_image_front_url && imageLoadingStates[poa.poa_image_front_url] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg z-10">
                                      <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
                                    </div>
                                  )}
                                  {poa.poa_image_front_url && imageErrorStates[poa.poa_image_front_url] ? (
                                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                                      <div className="text-center p-4">
                                        <FaHome className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Failed to load POA front image</p>
                                        <button
                                          onClick={() => poa.poa_image_front_url && handleRetryClick(poa.poa_image_front_url)}
                                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                          Retry
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={poa.poa_image_front_url && signedUrls[poa.poa_image_front_url] || ''}
                                      alt="POA Front"
                                      className="w-full h-48 object-cover rounded-lg shadow-sm border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                                      onClick={() => poa.poa_image_front_url && setSelectedImage(signedUrls[poa.poa_image_front_url] || '')}
                                      onError={(e) => poa.poa_image_front_url && handleImageError(poa.poa_image_front_url, e.target as HTMLImageElement)}
                                    />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Back Image */}
                            {poa.poa_image_back_url && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Back Side</p>
                                <div className="relative group">
                                  {poa.poa_image_back_url && imageLoadingStates[poa.poa_image_back_url] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg z-10">
                                      <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
                                    </div>
                                  )}
                                  {poa.poa_image_back_url && imageErrorStates[poa.poa_image_back_url] ? (
                                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                                      <div className="text-center p-4">
                                        <FaHome className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Failed to load POA back image</p>
                                        <button
                                          onClick={() => poa.poa_image_back_url && handleRetryClick(poa.poa_image_back_url)}
                                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                          Retry
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={poa.poa_image_back_url && signedUrls[poa.poa_image_back_url] || ''}
                                      alt="POA Back"
                                      className="w-full h-48 object-cover rounded-lg shadow-sm border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                                      onClick={() => poa.poa_image_back_url && setSelectedImage(signedUrls[poa.poa_image_back_url] || '')}
                                      onError={(e) => poa.poa_image_back_url && handleImageError(poa.poa_image_back_url, e.target as HTMLImageElement)}
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {!poi && !poa && (
                      <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-6 inline-block">
                          <FaIdCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No documents available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activities' && applicationId && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 px-8 py-6 flex items-center gap-4">
                    <FaClipboardList className="h-7 w-7 text-white" />
                    <h3 className="text-2xl font-bold text-white tracking-wide">Activities</h3>
                  </div>
                  {/* Financial Year Selector */}
                  <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row md:items-center md:gap-8 gap-4">
                    <label className="block font-semibold text-gray-700 text-lg">Select Financial Year:</label>
                    <select
                      className="border-2 border-green-400 p-3 rounded-lg w-72 shadow focus:ring-2 focus:ring-green-400 text-lg font-medium bg-gray-50 hover:bg-white transition"
                      value={selectedFinancialYear}
                      onChange={e => setSelectedFinancialYear(e.target.value)}
                    >
                      <option value="">-- Select Year --</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2024-25">2024-25</option>
                      <option value="2023-24">2023-24</option>
                      <option value="2022-23">2022-23</option>
                      <option value="2021-22">2021-22</option>
                      <option value="2020-21">2020-21</option>
                    </select>
                  </div>

                  {/* Farm Infinity Score and Report */}
                  {selectedFinancialYear && (
                    <div className="flex flex-col md:flex-row gap-8 px-8 pb-8">
                      <div className="flex-1">
                        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center gap-2">
                            <FaChartLine className="h-5 w-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Farm Infinity Score</h3>
                          </div>
                          <div className="p-6">
                            <ScoreCardContainer farmerId={farmerId || ''} applicationId={applicationId || ''} financialYear={selectedFinancialYear} />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-2">
                            <FaClipboardList className="h-5 w-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Report</h3>
                          </div>
                          <div className="p-6">
                            <ReportRemark 
                              farmerId={farmerId || ''} 
                              applicationId={applicationId || ''} 
                              financialYear={selectedFinancialYear} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {selectedFinancialYear && <div className="border-t border-gray-200 mx-8 my-4" />}

                  {/* Activity Details */}
                  <div className="px-8 pb-8">
                    {selectedFinancialYear ? (
                      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4 flex items-center gap-2">
                          <FaLeaf className="h-5 w-5 text-white" />
                          <h3 className="text-lg font-semibold text-white">Activity Details</h3>
                        </div>
                        <div className="p-6">
                          <FarmerKyc applicationId={applicationId} financialYear={selectedFinancialYear} />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-8 rounded-xl text-center text-gray-500 text-lg font-medium">
                        Please select a financial year to view activity data, Farm Infinity Score, and report.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetails;
