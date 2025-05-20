import { useEffect, useState } from "react";
type propsType ={
    farmerId: string|undefined,
    applicationId: string|undefined,
    financialYear: string
}
export default function ScoreCard({ farmerId, applicationId, financialYear}: propsType ) {
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchScoreCard() {
      try {
        const url = `https://baupmo41v5.execute-api.ap-south-1.amazonaws.com/dev/api/scorecard-mini?farmerId=${farmerId}&applicationId=${applicationId}&financialYear=${financialYear}`;
        const token = localStorage.getItem('token');

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const text = await response.text();
        setHtmlContent(text);
      } catch (err) {
        console.error("Failed to fetch Score Card:", err);
        setError("Failed to load Score Card.");
      }
    }

    if (farmerId && applicationId && financialYear) {
      fetchScoreCard();
    }
  }, [farmerId, applicationId, financialYear]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!htmlContent) {
    return <div>Loading Score Card...</div>;
  }

  return (
    <div
      className="w-full overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
