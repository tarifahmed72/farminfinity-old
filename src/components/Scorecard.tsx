import React from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ScoreCardProps {
  data: {
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
        email?: string;
        village?: string;
        state?: string;
      };
    };
  };
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const ScoreGauge = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '20px',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const calculateScorePercentage = (score: number): number => {
  // Score range is 0-1100, so normalize to 0-100%
  return (score / 1100) * 100;
};

const getScoreColor = (grade: string): string => {
  const colors: { [key: string]: string } = {
    'A': '#4CAF50',
    'B': '#8BC34A',
    'C': '#FFC107',
    'D': '#FF9800',
    'E': '#F44336',
  };
  return colors[grade] || '#757575';
};

const ScoreCard: React.FC<ScoreCardProps> = ({ data }) => {
  const scorePercentage = calculateScorePercentage(data.masked.score_card_info.score);
  const scoreColor = getScoreColor(data.masked.score_card_info.grade);

  return (
    <StyledPaper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Farm Infinity Score - {data.financial_year}
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h3" style={{ color: scoreColor, fontWeight: 'bold' }}>
              {data.masked.score_card_info.score}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Farm Infinity Score
            </Typography>
            <Box display="flex" gap={1} justifyContent="center" mt={1}>
              <Chip 
                label={`Grade ${data.masked.score_card_info.grade}`}
                style={{ backgroundColor: scoreColor, color: 'white' }}
              />
              <Chip 
                label={`Sub Grade ${data.masked.score_card_info.sub_grade}`}
                variant="outlined"
                style={{ borderColor: scoreColor, color: scoreColor }}
              />
            </Box>
          </Box>
          
          <ScoreGauge>
            <LinearProgress
              variant="determinate"
              value={scorePercentage}
              sx={{
                height: 20,
                borderRadius: 10,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: scoreColor,
                  borderRadius: 10,
                },
              }}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              mt={1}
              sx={{ color: 'text.secondary' }}
            >
              <Typography variant="caption">0</Typography>
              <Typography variant="caption">1100</Typography>
            </Box>
          </ScoreGauge>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Name:</strong> {data.masked.basic_info.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Gender:</strong> {data.masked.basic_info.gender}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Date of Birth:</strong> {data.masked.basic_info.dob}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Phone:</strong> {data.masked.basic_info.phone}
                </Typography>
              </Grid>
              {data.masked.basic_info.email && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Email:</strong> {data.masked.basic_info.email}
                  </Typography>
                </Grid>
              )}
              {data.masked.basic_info.village && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Village:</strong> {data.masked.basic_info.village}
                  </Typography>
                </Grid>
              )}
              {data.masked.basic_info.state && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>State:</strong> {data.masked.basic_info.state}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default ScoreCard;
