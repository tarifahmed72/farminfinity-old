import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';

interface FPOData {
  id: string;
  fpo_id: string;
  constitution: string;
  entity_name: string;
  no_of_farmers: number;
  address: string;
  state: string;
  district: string;
  area_of_operation: number;
  establishment_year: string;
  major_crop_produced: string[];
  previous_year_turnover: number;
  contact_person_name: string;
  contact_person_phone: string;
  pan_no: string;
  is_pan_copy_collected: boolean;
  pan_image: string;
  is_incorporation_doc_collected: boolean;
  incorporation_doc_img: string;
  is_registration_no_collected: boolean;
  registration_no: string;
  registration_no_img: string;
  is_director_shareholder_list_collected: boolean;
  director_shareholder_list_image: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const FPO = () => {
  const [fpos, setFpos] = useState<FPOData[]>([]);
  const [selectedFPO, setSelectedFPO] = useState<FPOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFPOs = async () => {
      try {
        const response: AxiosResponse<FPOData[]> = await axios.get(
          'https://dev-api.farmeasytechnologies.com/api/fpos/?skip=0&limit=100'
        );
        setFpos(response.data);
      } catch (err: any) {
        setError(`Error fetching FPO list: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFPOs();
  }, []);

  if (loading) return <div className="p-4 text-gray-700">Loading FPOs...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">All FPOs</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead className="bg-gray-200 text-gray-700 uppercase text-sm">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Entity Name</th>
              <th className="px-5 py-3 text-left font-semibold">FPO ID</th>
              <th className="px-5 py-3 text-left font-semibold">State</th>
              <th className="px-5 py-3 text-left font-semibold">District</th>
              <th className="px-5 py-3 text-left font-semibold">Contact</th>
              <th className="px-5 py-3 text-center font-semibold">Active</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {fpos.map((fpo) => (
              <tr
                key={fpo.id}
                onClick={() => setSelectedFPO(fpo)}
                className="hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              >
                <td className="px-5 py-3 border-b border-gray-200">
                  <p className="text-gray-900 whitespace-no-wrap">{fpo.entity_name}</p>
                </td>
                <td className="px-5 py-3 border-b border-gray-200">
                  <p className="text-blue-600 font-semibold whitespace-no-wrap">{fpo.fpo_id}</p>
                </td>
                <td className="px-5 py-3 border-b border-gray-200">
                  <p className="whitespace-no-wrap">{fpo.state}</p>
                </td>
                <td className="px-5 py-3 border-b border-gray-200">
                  <p className="whitespace-no-wrap">{fpo.district}</p>
                </td>
                <td className="px-5 py-3 border-b border-gray-200">
                  <p className="whitespace-no-wrap">
                    {fpo.contact_person_name} ({fpo.contact_person_phone})
                  </p>
                </td>
                <td className="px-5 py-3 border-b border-gray-200 text-center">
                  <span className={`relative inline-block px-3 py-1 font-semibold text-sm rounded-full ${fpo.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <span className="absolute left-0 -ml-1 w-2 h-2 rounded-full bg-current"></span>
                    {fpo.active ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedFPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-8 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl focus:outline-none"
              onClick={() => setSelectedFPO(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">{selectedFPO.entity_name} Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div><strong>FPO ID:</strong> <span className="font-medium">{selectedFPO.fpo_id}</span></div>
              <div><strong>Constitution:</strong> <span className="font-medium">{selectedFPO.constitution}</span></div>
              <div><strong>No. of Farmers:</strong> <span className="font-medium">{selectedFPO.no_of_farmers}</span></div>
              <div><strong>Address:</strong> <span className="font-medium">{selectedFPO.address}</span></div>
              <div><strong>State:</strong> <span className="font-medium">{selectedFPO.state}</span></div>
              <div><strong>District:</strong> <span className="font-medium">{selectedFPO.district}</span></div>
              <div><strong>Area of Operation:</strong> <span className="font-medium">{selectedFPO.area_of_operation}</span></div>
              <div><strong>Establishment Year:</strong> <span className="font-medium">{selectedFPO.establishment_year}</span></div>
              <div><strong>Major Crops:</strong> <span className="font-medium">{selectedFPO.major_crop_produced.join(', ')}</span></div>
              <div><strong>Previous Year Turnover:</strong> <span className="font-medium">₹{selectedFPO.previous_year_turnover}</span></div>
              <div><strong>Contact Person:</strong> <span className="font-medium">{selectedFPO.contact_person_name}</span></div>
              <div><strong>Contact Phone:</strong> <span className="font-medium">{selectedFPO.contact_person_phone}</span></div>
              <div><strong>PAN No.:</strong> <span className="font-medium">{selectedFPO.pan_no}</span></div>
              <div><strong>PAN Copy Collected:</strong> <span className="font-medium">{selectedFPO.is_pan_copy_collected ? 'Yes' : 'No'}</span></div>
              <div><strong>Registration No.:</strong> <span className="font-medium">{selectedFPO.registration_no}</span></div>
              <div><strong>Active:</strong> <span className={`font-medium ${selectedFPO.active ? 'text-green-600' : 'text-red-600'}`}>{selectedFPO.active ? 'Yes' : 'No'}</span></div>
              <div><strong>Created At:</strong> <span className="font-medium">{new Date(selectedFPO.created_at).toLocaleString()}</span></div>
              <div><strong>Updated At:</strong> <span className="font-medium">{new Date(selectedFPO.updated_at).toLocaleString()}</span></div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedFPO.pan_image && (
                <div className="rounded-md shadow-md overflow-hidden">
                  <img src={selectedFPO.pan_image} alt="PAN" className="w-full h-auto object-cover" />
                  <p className="text-xs mt-1 text-center text-gray-500">PAN Image</p>
                </div>
              )}
              {selectedFPO.incorporation_doc_img && (
                <div className="rounded-md shadow-md overflow-hidden">
                  <img src={selectedFPO.incorporation_doc_img} alt="Incorporation Document" className="w-full h-auto object-cover" />
                  <p className="text-xs mt-1 text-center text-gray-500">Incorporation Document</p>
                </div>
              )}
              {selectedFPO.registration_no_img && (
                <div className="rounded-md shadow-md overflow-hidden">
                  <img src={selectedFPO.registration_no_img} alt="Registration Document" className="w-full h-auto object-cover" />
                  <p className="text-xs mt-1 text-center text-gray-500">Registration Document</p>
                </div>
              )}
              {selectedFPO.director_shareholder_list_image && (
                <div className="rounded-md shadow-md overflow-hidden">
                  <img src={selectedFPO.director_shareholder_list_image} alt="Director/Shareholder List" className="w-full h-auto object-cover" />
                  <p className="text-xs mt-1 text-center text-gray-500">Director/Shareholder List</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FPO;