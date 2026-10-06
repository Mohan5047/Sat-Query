/**
 * SatQuery AI - Advanced Remote Sensing & Engine Settings
 * Defines configuration keys, validation limits, descriptions, and Mission Scenario Presets.
 */

export const MISSION_PRESETS = [
  {
    id: 'standard',
    name: 'Balanced Observation (Default)',
    icon: 'Satellite',
    description: 'Autonomous agentic routing with standard BigEarthNet representations across all modalities.',
    badge: 'Standard EO',
    settings: {
      forced_tool: 'AUTO',
      rs_backbone: 'bigearthnet',
      response_style: 'technical_scientific',
      min_confidence: 0.85,
      change_percentile: 80,
      change_colormap: 'inferno',
      optical_weight: 0.6,
      sar_weight: 0.4,
      box_color: 'gold',
      iou_threshold: 0.5,
      speckle_filter: 'none',
      sar_scale: 'db',
      coordinate_crosshair: true,
      trace_auto_expand: true
    }
  },
  {
    id: 'infrastructure',
    name: 'Urban & Infrastructure Cadastre',
    icon: 'Building2',
    description: 'Enhanced SAR double-bounce radar sensitivity and strict CVA change filtering for urban development.',
    badge: 'Urban / SAR Focus',
    settings: {
      forced_tool: 'AUTO',
      rs_backbone: 'remoteclip',
      response_style: 'technical_scientific',
      min_confidence: 0.90,
      change_percentile: 85,
      change_colormap: 'magma',
      optical_weight: 0.45,
      sar_weight: 0.55,
      box_color: 'crimson',
      iou_threshold: 0.6,
      speckle_filter: 'lee',
      sar_scale: 'db',
      coordinate_crosshair: true,
      trace_auto_expand: true
    }
  },
  {
    id: 'disaster',
    name: 'Flood & Disaster Response',
    icon: 'Waves',
    description: 'High-sensitivity water specular radar absorption and vibrant Turbo change colormap for flood mapping.',
    badge: 'Emergency / Flood',
    settings: {
      forced_tool: 'AUTO',
      rs_backbone: 'bigearthnet',
      response_style: 'technical_scientific',
      min_confidence: 0.80,
      change_percentile: 72,
      change_colormap: 'turbo',
      optical_weight: 0.5,
      sar_weight: 0.5,
      box_color: 'cyan',
      iou_threshold: 0.4,
      speckle_filter: 'median',
      sar_scale: 'db',
      coordinate_crosshair: true,
      trace_auto_expand: true
    }
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Forest Phenology',
    icon: 'TreePine',
    description: 'Optical spectral canopy priority (NDVI/FCC) with diffuse volume radar scattering for vegetation health.',
    badge: 'Vegetation / Agritech',
    settings: {
      forced_tool: 'AUTO',
      rs_backbone: 'geochat_vlm',
      response_style: 'technical_scientific',
      min_confidence: 0.85,
      change_percentile: 75,
      change_colormap: 'viridis',
      optical_weight: 0.75,
      sar_weight: 0.25,
      box_color: 'emerald',
      iou_threshold: 0.45,
      speckle_filter: 'frost',
      sar_scale: 'linear',
      coordinate_crosshair: true,
      trace_auto_expand: true
    }
  },
  {
    id: 'high_sensitivity',
    name: 'Target Grounding & Pinpoint Delineation',
    icon: 'Target',
    description: 'Low IoU thresholds, high bounding box recall, and neon cyber highlighting for small objects.',
    badge: 'High Recall Grounding',
    settings: {
      forced_tool: 'SINGLE_GROUNDING',
      rs_backbone: 'remoteclip',
      response_style: 'standard',
      min_confidence: 0.75,
      change_percentile: 80,
      change_colormap: 'jet',
      optical_weight: 0.6,
      sar_weight: 0.4,
      box_color: 'cyan',
      iou_threshold: 0.35,
      speckle_filter: 'none',
      sar_scale: 'db',
      coordinate_crosshair: true,
      trace_auto_expand: true
    }
  }
];

export const DEFAULT_ADVANCED_SETTINGS = {
  ...MISSION_PRESETS[0].settings,
  activePresetId: 'standard'
};
