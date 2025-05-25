import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import ScoreCard from './Scorecard';

interface ScoreCardContainerProps {
  farmerId: string;
  applicationId: string;
  financialYear: string;
}

interface ScoreCardData {
  financial_year: string;
  masked: {
    score_card_info: {
      score: number;
      grade: string;
      sub_grade: string;
    };
    basic_info: {
      name: string;
      gender: string;
      dob: string;
      phone: string;
    };
  };
  unmasked?: {
    score_card_info: {
      score: number;
      grade: string;
      sub_grade: string;
    };
    basic_info: {
      name: string;
      gender: string;
      dob: string;
      phone: string;
    };
  };
}

const ScoreCardContainer: React.FC<ScoreCardContainerProps> = ({
  farmerId,
  applicationId,
  financialYear,
}) => {
  const [data, setData] = useState<ScoreCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMasked, setShowMasked] = useState(true);

  useEffect(() => {
    const fetchScoreCard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://baupmo41v5.execute-api.ap-south-1.amazonaws.com/dev/api/credit-report?farmerId=${farmerId}&applicationId=${applicationId}&financialYear=${financialYear}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching Farm Infinity Score:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Farm Infinity Score');
      } finally {
        setLoading(false);
      }
    };

    fetchScoreCard();
  }, [farmerId, applicationId, financialYear]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 p-4">
        No Farm Infinity Score data available.
      </div>
    );
  }

  // Determine which data to show
  const cardData = showMasked || !data.unmasked ? { ...data, ...{ masked: data.masked } } : { ...data, ...{ masked: data.unmasked } };

  return (
    <div>
      <Button
        variant="contained"
        color={showMasked ? 'primary' : 'secondary'}
        onClick={() => setShowMasked((prev) => !prev)}
        sx={{ mb: 2 }}
      >
        {showMasked ? 'Show Unmasked Farm Infinity Score' : 'Show Masked Farm Infinity Score'}
      </Button>
      <ScoreCard data={cardData} />
    </div>
  );
};

export default ScoreCardContainer; 