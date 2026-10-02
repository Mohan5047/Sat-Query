/**
 * SatQuery AI - Default Benchmark Remote Sensing Datasets
 * High-quality embedded datasets providing instant previews and offline fallback capability.
 */

// Helper to create synthetic satellite pattern SVGs encoded as Data URLs
function createSatellitePatternSvg(type) {
  let content = '';
  if (type === 'optical_urban') {
    // Urban, Runway, Water, Forest
    content = `
      <rect width="512" height="512" fill="#587a50"/>
      <!-- Water Lake -->
      <path d="M 60,340 C 100,280 200,320 220,400 C 240,480 120,500 70,470 Z" fill="#1b4d7e" stroke="#2563eb" stroke-width="2"/>
      <path d="M 180,350 Q 300,380 480,360" stroke="#1b4d7e" stroke-width="16" fill="none"/>
      <!-- Forest Canopy -->
      <rect x="320" y="20" width="180" height="200" rx="15" fill="#1e4d2b" opacity="0.9"/>
      <circle cx="360" cy="70" r="30" fill="#15381f"/>
      <circle cx="430" cy="110" r="45" fill="#184325"/>
      <circle cx="380" cy="160" r="35" fill="#13331b"/>
      <!-- Urban Built-up Fabric -->
      <rect x="50" y="50" width="200" height="200" fill="#a0a4aa" opacity="0.95" stroke="#71717a" stroke-width="2"/>
      <rect x="70" y="70" width="40" height="40" fill="#d4d4d8" stroke="#52525b"/>
      <rect x="130" y="70" width="50" height="35" fill="#e4e4e7" stroke="#52525b"/>
      <rect x="70" y="130" width="45" height="55" fill="#f4f4f5" stroke="#52525b"/>
      <rect x="135" y="125" width="45" height="45" fill="#cbd5e1" stroke="#52525b"/>
      <rect x="195" y="140" width="35" height="35" fill="#e2e8f0" stroke="#52525b"/>
      <!-- Runway -->
      <rect x="270" y="265" width="230" height="30" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <line x1="280" y1="280" x2="490" y2="280" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,8"/>
      <!-- Compass & Scale -->
      <text x="20" y="35" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold">CARTOSAT-2S OPTICAL (RGB) | 2.5m GSD</text>
    `;
  } else if (type === 'sar') {
    // SAR microwave backscatter (Double-bounce bright, water specular dark)
    content = `
      <rect width="512" height="512" fill="#3f3f46"/>
      <!-- Water Specular Dark -->
      <path d="M 60,340 C 100,280 200,320 220,400 C 240,480 120,500 70,470 Z" fill="#09090b"/>
      <path d="M 180,350 Q 300,380 480,360" stroke="#09090b" stroke-width="16" fill="none"/>
      <!-- Forest Volume Scatter -->
      <rect x="320" y="20" width="180" height="200" fill="#52525b" opacity="0.8"/>
      <!-- Urban High Double Bounce Bright White/Yellow -->
      <rect x="50" y="50" width="200" height="200" fill="#71717a"/>
      <rect x="70" y="70" width="40" height="40" fill="#ffffff"/>
      <rect x="130" y="70" width="50" height="35" fill="#fafafa"/>
      <rect x="70" y="130" width="45" height="55" fill="#ffffff"/>
      <rect x="135" y="125" width="45" height="45" fill="#f4f4f5"/>
      <rect x="195" y="140" width="35" height="35" fill="#ffffff"/>
      <!-- Runway Flat Pavement Medium Gray -->
      <rect x="270" y="265" width="230" height="30" fill="#27272a"/>
      <!-- Noise texture -->
      <text x="20" y="35" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold">RISAT-1A SAR BACKSCATTER (VV/VH) | C-BAND</text>
    `;
  } else if (type === 'bitemporal_t1') {
    // 2021 T1 Baseline (Agricultural / Vegetation in South-East)
    content = `
      <rect width="512" height="512" fill="#587a50"/>
      <path d="M 60,340 C 100,280 200,320 220,400 C 240,480 120,500 70,470 Z" fill="#1b4d7e"/>
      <rect x="50" y="50" width="180" height="180" fill="#a0a4aa"/>
      <rect x="70" y="70" width="40" height="40" fill="#d4d4d8"/>
      <rect x="130" y="70" width="50" height="35" fill="#e4e4e7"/>
      <!-- Agricultural Fields in South-East -->
      <rect x="270" y="330" width="220" height="160" fill="#65a30d" stroke="#4d7c0f" stroke-width="2"/>
      <line x1="380" y1="330" x2="380" y2="490" stroke="#4d7c0f" stroke-width="2"/>
      <line x1="270" y1="410" x2="490" y2="410" stroke="#4d7c0f" stroke-width="2"/>
      <text x="20" y="35" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold">T1: 2021-03-15 (PRE-DEVELOPMENT BASELINE)</text>
    `;
  } else if (type === 'bitemporal_t2') {
    // 2024 T2 Post-Expansion (New Urban & Commercial Complexes in South-East)
    content = `
      <rect width="512" height="512" fill="#587a50"/>
      <path d="M 60,340 C 100,280 200,320 220,400 C 240,480 120,500 70,470 Z" fill="#1b4d7e"/>
      <rect x="50" y="50" width="180" height="180" fill="#a0a4aa"/>
      <rect x="70" y="70" width="40" height="40" fill="#d4d4d8"/>
      <rect x="130" y="70" width="50" height="35" fill="#e4e4e7"/>
      <!-- NEW Built-up Expansion in South-East -->
      <rect x="270" y="330" width="220" height="160" fill="#94a3b8" stroke="#ef4444" stroke-width="3"/>
      <rect x="285" y="345" width="55" height="45" fill="#ffffff" stroke="#ef4444" stroke-width="2"/>
      <rect x="360" y="345" width="60" height="45" fill="#f1f5f9" stroke="#ef4444" stroke-width="2"/>
      <rect x="435" y="345" width="45" height="45" fill="#e2e8f0" stroke="#ef4444" stroke-width="2"/>
      <rect x="285" y="415" width="80" height="60" fill="#ffffff" stroke="#ef4444" stroke-width="2"/>
      <rect x="385" y="415" width="95" height="60" fill="#f8fafc" stroke="#ef4444" stroke-width="2"/>
      <text x="20" y="35" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold">T2: 2024-03-20 (POST-EXPANSION OBSERVATION)</text>
      <text x="280" y="320" fill="#ef4444" font-family="monospace" font-size="11" font-weight="bold">★ EXPANSION ZONE</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${content}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_SAMPLES = [
  {
    id: 'single_optical_urban',
    name: 'Cartosat-2S High-Res Optical (Urban, Port & Runway)',
    category: 'SINGLE_OPTICAL',
    mode: 'SINGLE',
    image1_preview: createSatellitePatternSvg('optical_urban'),
    image2_preview: null,
    description: 'Multi-spectral optical image containing urban built-up fabric, coastal water bodies, forest canopy, and airport runway.',
    suggested_queries: [
      'Describe the land-cover and major objects visible in this image.',
      'Highlight the water body referred to in the query.',
      'How many airport runways or aircraft facilities are present?',
      'What is the dominant land cover class across the scene?'
    ]
  },
  {
    id: 'single_sar_scene',
    name: 'RISAT-1A SAR Microwave Backscatter Scene',
    category: 'SINGLE_SAR',
    mode: 'SINGLE',
    image1_preview: createSatellitePatternSvg('sar'),
    image2_preview: null,
    description: 'Synthetic Aperture Radar (SAR) backscatter image demonstrating microwave scattering, double-bounce built-up return, and specular water absorption.',
    suggested_queries: [
      'Describe the microwave backscatter patterns and surface structures visible.',
      'Identify built-up regions exhibiting high double-bounce radar return.',
      'Locate the dark specular water surface in this SAR imagery.'
    ]
  },
  {
    id: 'bitemporal_urban_expansion',
    name: 'Bi-Temporal Urban Expansion Pair (2021 vs 2024)',
    category: 'BITEMPORAL',
    mode: 'BITEMPORAL',
    image1_preview: createSatellitePatternSvg('bitemporal_t1'),
    image2_preview: createSatellitePatternSvg('bitemporal_t2'),
    description: 'Spatially coregistered bi-temporal pair capturing 3-year urban expansion, infrastructure addition, and agricultural clearing.',
    suggested_queries: [
      'What changed between these two dates, and where did the change occur?',
      'Has the built-up area increased, decreased, or remained unchanged?',
      'Generate a spatial change heatmap highlighting newly developed zones.',
      'Quantify the percentage of surface modification between T1 and T2.'
    ]
  },
  {
    id: 'crossmodal_cartosat_risat',
    name: 'Cross-Modal Cartosat Optical + RISAT SAR Pair',
    category: 'CROSSMODAL',
    mode: 'CROSSMODAL',
    image1_preview: createSatellitePatternSvg('optical_urban'),
    image2_preview: createSatellitePatternSvg('sar'),
    description: 'Co-registered Optical and Synthetic Aperture Radar (SAR) pair for joint information extraction and complementary surface characterization.',
    suggested_queries: [
      'Use the optical and SAR images together to identify built-up and water-covered regions.',
      'Extract complementary information from this optical-SAR pair.',
      'Generate a fused multimodal thematic land-cover classification map.'
    ]
  }
];

export const DEFAULT_TOOLS = [
  {
    id: 'rs_domain_adapter',
    name: 'BigEarthNet Domain Representation Adapter',
    description: 'Multi-band & SAR feature extractor adapted on BigEarthNet representations.',
    type: 'REPRESENTATION_BACKBONE',
    permitted_params: ['modality', 'feature_layer']
  },
  {
    id: 'rs_vqa_engine',
    name: 'Remote Sensing VQA Specialist (RSVQA / VRSBench)',
    description: 'Factual, presence, counting, and spatial relationship VQA engine.',
    type: 'VQA',
    permitted_params: ['query', 'modality', 'confidence_threshold']
  },
  {
    id: 'rs_captioner',
    name: 'Remote Sensing Scene Captioner & Land-Cover Descriptor',
    description: 'Generates structured scene descriptions, land cover breakdown, and spatial summaries.',
    type: 'CAPTIONING',
    permitted_params: ['modality', 'detail_level']
  },
  {
    id: 'rs_grounding',
    name: 'Text-Guided Region Grounding & Bounding Locator',
    description: 'Localizes and delineates queried entities with bounding boxes and masks.',
    type: 'GROUNDING',
    permitted_params: ['query', 'target_category', 'iou_threshold']
  },
  {
    id: 'rs_change_engine',
    name: 'Bi-Temporal Change Engine & CDVQA Specialist',
    description: 'Performs CVA differencing, change heatmap generation, and Change-VQA.',
    type: 'CHANGE_ANALYSIS',
    permitted_params: ['query', 'change_threshold', 'temporal_delta']
  },
  {
    id: 'rs_optical_sar_fusion',
    name: 'Optical-SAR Cross-Modal Fusion Specialist',
    description: 'Extracts complementary features from co-registered Optical and SAR pairs.',
    type: 'CROSSMODAL_FUSION',
    permitted_params: ['query', 'fusion_weight', 'polarization']
  },
  {
    id: 'spectral_band_analyzer',
    name: 'Spectral & Radar Band Index Analyzer',
    description: 'Computes NDVI, NDWI, False-Color NIR composites, and SAR dB amplitude.',
    type: 'SPECTRAL_ANALYSIS',
    permitted_params: ['index_type', 'colormap']
  }
];
