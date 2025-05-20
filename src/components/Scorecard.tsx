import { useEffect, useState } from "react";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import DOMPurify from "dompurify";

interface ScoreCardProps {
  farmerId: string | undefined;
  applicationId: string | undefined;
  financialYear: string;
}

export default function ScoreCard({ farmerId, applicationId, financialYear }: ScoreCardProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchScoreCard() {
      try {
        setLoading(true);
        setError("");

        if (!farmerId || !applicationId || !financialYear) {
          throw new Error("Missing required parameters");
        }

        const url = `https://baupmo41v5.execute-api.ap-south-1.amazonaws.com/dev/api/scorecard-mini?farmerId=${farmerId}&applicationId=${applicationId}&financialYear=${financialYear}`;
        // url.searchParams.append("farmerId", farmerId);
        // url.searchParams.append("applicationId", applicationId);
        // url.searchParams.append("financialYear", financialYear);

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        
        if (!text) {
          throw new Error("No data received from server");
        }

        // Sanitize HTML content before setting it
        const sanitizedHtml = DOMPurify.sanitize(text);
        setHtmlContent(sanitizedHtml);
      } catch (err) {
        console.error("Failed to fetch Score Card:", err);
        setError(err instanceof Error ? err.message : "Failed to load Score Card");
      } finally {
        setLoading(false);
      }
    }

    fetchScoreCard();
  }, [farmerId, applicationId, financialYear]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
        <FaExclamationTriangle className="text-red-500 mr-2" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <FaSpinner className="animate-spin text-blue-500 mr-2" />
        <p className="text-gray-600">Loading Score Card...</p>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No score card data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
      <div
        className="p-4"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
