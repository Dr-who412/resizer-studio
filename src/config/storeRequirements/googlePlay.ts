export interface ScreenshotRequirement {
  id: string;
  name: string;
  deviceCategory: 'phone' | 'tablet_7' | 'tablet_10' | 'chromebook' | 'wear';
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  aspectRatioRange?: { min: number; max: number }; // min/max ratio (e.g. 0.5 to 2.0)
  aspectRatioDesc: string;
  allowedFormats: string[];
  maxFileSizeMB: number;
  notes: string;
  officialDocUrl: string;
}

export interface GooglePlayConfig {
  officialSource: string;
  officialSourceUrl: string;
  lastUpdated: string;
  version: string;
  requirements: ScreenshotRequirement[];
}

export const googlePlayRequirements: GooglePlayConfig = {
  officialSource: "Google Play Console Help - Add preview assets to showcase your app",
  officialSourceUrl: "https://support.google.com/googleplay/android-developer/answer/9866180",
  lastUpdated: "2026-09-01",
  version: "2026.3",
  requirements: [
    {
      id: "google-play-phone-portrait",
      name: "Phone Portrait (Standard 9:16 / 9:20)",
      deviceCategory: "phone",
      orientation: "portrait",
      width: 1080,
      height: 2400,
      minWidth: 320,
      maxWidth: 3840,
      minHeight: 320,
      maxHeight: 3840,
      aspectRatioRange: { min: 0.5, max: 2.0 },
      aspectRatioDesc: "Aspect ratio cannot exceed 2:1 (9:16 to 9:20 recommended)",
      allowedFormats: ["image/png", "image/jpeg"],
      maxFileSizeMB: 8,
      notes: "At least 2 screenshots required (max 8). JPEG or 24-bit PNG without alpha.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    {
      id: "google-play-phone-1080x1920",
      name: "Phone Portrait (Full HD 9:16)",
      deviceCategory: "phone",
      orientation: "portrait",
      width: 1080,
      height: 1920,
      minWidth: 320,
      maxWidth: 3840,
      minHeight: 320,
      maxHeight: 3840,
      aspectRatioRange: { min: 0.5, max: 2.0 },
      aspectRatioDesc: "16:9 ratio (standard Android)",
      allowedFormats: ["image/png", "image/jpeg"],
      maxFileSizeMB: 8,
      notes: "Standard FHD 9:16 aspect ratio suitable for most modern phones.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    {
      id: "google-play-phone-landscape",
      name: "Phone Landscape (16:9)",
      deviceCategory: "phone",
      orientation: "landscape",
      width: 1920,
      height: 1080,
      minWidth: 320,
      maxWidth: 3840,
      minHeight: 320,
      maxHeight: 3840,
      aspectRatioRange: { min: 0.5, max: 2.0 },
      aspectRatioDesc: "16:9 landscape ratio",
      allowedFormats: ["image/png", "image/jpeg"],
      maxFileSizeMB: 8,
      notes: "For landscape games and apps. Max dimension cannot exceed 2x min dimension.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    {
      id: "google-play-phone-qhd",
      name: "Phone Portrait (2K QHD 1440x3120)",
      deviceCategory: "phone",
      orientation: "portrait",
      width: 1440,
      height: 3120,
      minWidth: 320,
      maxWidth: 3840,
      minHeight: 320,
      maxHeight: 3840,
      aspectRatioRange: { min: 0.5, max: 2.0 },
      aspectRatioDesc: "Modern flagship 19.5:9 display (Pixel 8/9 Pro)",
      allowedFormats: ["image/png", "image/jpeg"],
      maxFileSizeMB: 8,
      notes: "Crisp high-DPI screenshots for high-density flagship screens.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    {
      id: "google-play-tablet-7",
      name: "7-Inch Tablet (1200 x 1920)",
      deviceCategory: "tablet_7",
      orientation: "portrait",
      width: 1200,
      height: 1920,
      minWidth: 320,
      maxWidth: 3840,
      minHeight: 320,
      maxHeight: 3840,
      aspectRatioRange: { min: 0.5, max: 2.0 },
      aspectRatioDesc: "16:10 portrait ratio",
      allowedFormats: ["image/png", "image/jpeg"],
      maxFileSizeMB: 8,
      notes: "Required if your app supports 7-inch tablets.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    {
      id: "google-play-tablet-10",
      name: "10-Inch Tablet (1600 x 2560)",
      deviceCategory: "tablet_10",
      orientation: "portrait",
      width: 1600,
      height: 2560,
      minWidth: 320,
      maxWidth: 3840,
      minHeight: 320,
      maxHeight: 3840,
      aspectRatioRange: { min: 0.5, max: 2.0 },
      aspectRatioDesc: "16:10 tablet ratio",
      allowedFormats: ["image/png", "image/jpeg"],
      maxFileSizeMB: 8,
      notes: "Required if your app targets 10-inch Android tablets.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    {
      id: "google-play-chromebook",
      name: "Chromebook / Desktop (1920 x 1080)",
      deviceCategory: "chromebook",
      orientation: "landscape",
      width: 1920,
      height: 1080,
      minWidth: 320,
      maxWidth: 3840,
      minHeight: 320,
      maxHeight: 3840,
      aspectRatioRange: { min: 0.5, max: 2.0 },
      aspectRatioDesc: "16:9 standard desktop",
      allowedFormats: ["image/png", "image/jpeg"],
      maxFileSizeMB: 8,
      notes: "Required for apps targeting ChromeOS and Large Screen devices.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    {
      id: "google-play-wear-os",
      name: "Wear OS Watch (384 x 384 / 454 x 454)",
      deviceCategory: "wear",
      orientation: "portrait",
      width: 384,
      height: 384,
      minWidth: 320,
      maxWidth: 3840,
      minHeight: 320,
      maxHeight: 3840,
      aspectRatioRange: { min: 1.0, max: 1.0 },
      aspectRatioDesc: "1:1 square ratio",
      allowedFormats: ["image/png", "image/jpeg"],
      maxFileSizeMB: 8,
      notes: "Required if app supports Wear OS. Transparent background outside circle is not allowed.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    }
  ]
};
