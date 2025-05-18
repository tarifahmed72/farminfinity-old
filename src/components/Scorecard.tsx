import { useEffect, useState } from "react";
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import axiosInstance from '../utils/axios';

type propsType = {
  farmerId: String | undefined;
  applicationId: String | undefined;
  financialYear: String;
}

export default function ScoreCard({ farmerId, applicationId, financialYear }: propsType) {
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScoreCard() {
      try {
        setLoading(true);
        setError("");
        const url = `/credit-report?farmerId=${farmerId}&applicationId=${applicationId}&financialYear=${financialYear}`;
        const token = localStorage.getItem('token');

        const response = await axiosInstance.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/html',
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
          },
          withCredentials: true
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

    if (farmerId && applicationId && financialYear) {
      fetchScoreCard();
    }
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
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <FaExclamationTriangle className="h-8 w-8 mb-4" />
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-600">
        <p>No scorecard data available</p>
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
