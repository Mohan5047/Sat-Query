/**
 * SatQuery AI API Service Layer
 */
const API_BASE_URL = '/api';

export const getHealth = async () => {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
};

export const getTools = async () => {
  const res = await fetch(`${API_BASE_URL}/tools`);
  return res.json();
};

export const getSamples = async () => {
  const res = await fetch(`${API_BASE_URL}/samples`);
  return res.json();
};

export const analyzeQuery = async ({
  query,
  pairMode,
  sampleImage1Path,
  sampleImage2Path,
  file1,
  file2
}) => {
  const formData = new FormData();
  formData.append('query', query);
  if (pairMode) formData.append('pair_mode', pairMode);
  if (sampleImage1Path) formData.append('sample_image1_path', sampleImage1Path);
  if (sampleImage2Path) formData.append('sample_image2_path', sampleImage2Path);
  if (file1) formData.append('file1', file1);
  if (file2) formData.append('file2', file2);

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(err.detail || 'Network error during analysis');
  }

  return res.json();
};

export const getPdfReportUrl = (sessionId) => `${API_BASE_URL}/report/pdf/${sessionId}`;
export const getJsonReportUrl = (sessionId) => `${API_BASE_URL}/report/json/${sessionId}`;
