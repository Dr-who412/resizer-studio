import { CornerRadii } from '../../../services/imageProcessor';

export type FeatureId = 'resize' | 'crop' | 'corners' | 'background' | 'format' | 'quality';

export interface ActiveFeatures {
  resize: boolean;     // Default: true (always on)
  crop: boolean;       // Default: false
  corners: boolean;    // Default: false
  background: boolean; // Default: false
  format: boolean;     // Default: false
  quality: boolean;    // Default: false
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageMetadata {
  name: string;
  originalWidth: number;
  originalHeight: number;
  fileSizeBytes: number;
  mimeType: string;
}

export interface ResizeSettings {
  width: number;
  height: number;
  lockAspectRatio: boolean;
  aspectRatio: number;
}

export interface CornerSettings {
  uniform: boolean;
  uniformRadius: number;
  perCorner: CornerRadii;
}

export interface BackgroundSettings {
  color: string;
  removeTransparency: boolean;
}

export interface FormatQualitySettings {
  format: 'image/png' | 'image/jpeg' | 'image/webp';
  quality: number; // 0.1 to 1.0
}

export interface AdvancedSettings {
  fitMode: 'fit' | 'cover' | 'stretch';
  smoothing: 'high' | 'medium' | 'low' | 'pixelated';
}
