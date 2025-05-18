import { useEffect, useState } from "react";
import { FaSpinner, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';
import axiosInstance from '../utils/axios';

type propsType = {
  farmerId: string | undefined;
  applicationId: string | undefined;
  financialYear: string;
}

export default function ScoreCard({ farmerId, applicationId, financialYear }: propsType) {
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScoreCard() {
      if (!farmerId || !applicationId || !financialYear) {
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        const response = await axiosInstance.get(`/credit-report`, {
          params: {
            farmerId,
            applicationId,
            financialYear
          },
          headers: {
            'Accept': 'text/html',
          },
          responseType: 'text'
        });

        if (!response.data) {
          throw new Error('No data received from the server');
        }

        setHtmlContent(response.data);
      } catch (err) {
        console.error("Failed to fetch Score Card:", err);
        setError(err instanceof Error ? err.message : "Failed to load Score Card");
      } finally {
        setLoading(false);
      }
    }

    fetchScoreCard();
  }, [farmerId, applicationId, financialYear]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-600">
        <FaSpinner className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p>Loading scorecard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <FaExclamationTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-600">
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <FaFileAlt className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p>No scorecard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div
          className="w-full overflow-x-auto styled-scorecard"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
