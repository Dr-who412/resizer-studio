export interface IconSpecification {
  id: string;
  name: string;
  platform: 'android' | 'ios';
  category: 'store' | 'launcher' | 'adaptive_fg' | 'adaptive_bg' | 'notification' | 'feature_graphic';
  size: number;
  width: number;
  height: number;
  scale?: string;
  folderPath: string;
  filename: string;
  format: 'png' | 'jpg' | 'webp';
  hasAlpha: boolean;
  notes: string;
  officialDocUrl: string;
}

export interface AndroidIconConfig {
  officialSource: string;
  officialSourceUrl: string;
  lastUpdated: string;
  version: string;
  icons: IconSpecification[];
}

export const androidIconRequirements: AndroidIconConfig = {
  officialSource: "Android Developers - Adaptive Icons & Google Play Icon Specifications",
  officialSourceUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive",
  lastUpdated: "2026-09-01",
  version: "Android 15 / Material 3",
  icons: [
    // Play Store Icon
    {
      id: "android-play-store-512",
      name: "Google Play Store Icon",
      platform: "android",
      category: "store",
      size: 512,
      width: 512,
      height: 512,
      folderPath: "playstore",
      filename: "play_store_icon_512.png",
      format: "png",
      hasAlpha: true,
      notes: "32-bit PNG with alpha. Google Play applies dynamic rounded corners and drop shadows.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    // Google Play Feature Graphic
    {
      id: "android-feature-graphic",
      name: "Google Play Feature Graphic",
      platform: "android",
      category: "feature_graphic",
      size: 1024,
      width: 1024,
      height: 500,
      folderPath: "playstore",
      filename: "feature_graphic_1024x500.png",
      format: "png",
      hasAlpha: false,
      notes: "1024 x 500 px. JPEG or 24-bit PNG (no alpha). Highlight of store listing.",
      officialDocUrl: "https://support.google.com/googleplay/android-developer/answer/9866180"
    },
    // Adaptive Icon Assets (108dp canvas with 72dp inner safe zone)
    {
      id: "android-adaptive-foreground-432",
      name: "Adaptive Icon Foreground (xxxhdpi 432x432)",
      platform: "android",
      category: "adaptive_fg",
      size: 432,
      width: 432,
      height: 432,
      scale: "4x (108dp)",
      folderPath: "res/drawable-xxxhdpi",
      filename: "ic_launcher_foreground.png",
      format: "png",
      hasAlpha: true,
      notes: "108dp base canvas size. Keep critical brand logo inside 66dp/72dp safe zone.",
      officialDocUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive"
    },
    {
      id: "android-adaptive-foreground-108",
      name: "Adaptive Icon Foreground Base (mdpi 108x108)",
      platform: "android",
      category: "adaptive_fg",
      size: 108,
      width: 108,
      height: 108,
      scale: "1x (108dp)",
      folderPath: "res/drawable-mdpi",
      filename: "ic_launcher_foreground.png",
      format: "png",
      hasAlpha: true,
      notes: "Base adaptive layer 108x108.",
      officialDocUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive"
    },
    // Legacy / Fallback Launcher Icons (res/mipmap-*)
    {
      id: "android-launcher-xxxhdpi",
      name: "Launcher Icon (xxxhdpi 192x192)",
      platform: "android",
      category: "launcher",
      size: 192,
      width: 192,
      height: 192,
      scale: "xxxhdpi (~640 dpi)",
      folderPath: "res/mipmap-xxxhdpi",
      filename: "ic_launcher.png",
      format: "png",
      hasAlpha: true,
      notes: "Primary launcher icon for extra-extra-extra-high density displays.",
      officialDocUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher"
    },
    {
      id: "android-launcher-xxhdpi",
      name: "Launcher Icon (xxhdpi 144x144)",
      platform: "android",
      category: "launcher",
      size: 144,
      width: 144,
      height: 144,
      scale: "xxhdpi (~480 dpi)",
      folderPath: "res/mipmap-xxhdpi",
      filename: "ic_launcher.png",
      format: "png",
      hasAlpha: true,
      notes: "Launcher icon for high resolution phones.",
      officialDocUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher"
    },
    {
      id: "android-launcher-xhdpi",
      name: "Launcher Icon (xhdpi 96x96)",
      platform: "android",
      category: "launcher",
      size: 96,
      width: 96,
      height: 96,
      scale: "xhdpi (~320 dpi)",
      folderPath: "res/mipmap-xhdpi",
      filename: "ic_launcher.png",
      format: "png",
      hasAlpha: true,
      notes: "Launcher icon for mid-high density phones.",
      officialDocUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher"
    },
    {
      id: "android-launcher-hdpi",
      name: "Launcher Icon (hdpi 72x72)",
      platform: "android",
      category: "launcher",
      size: 72,
      width: 72,
      height: 72,
      scale: "hdpi (~240 dpi)",
      folderPath: "res/mipmap-hdpi",
      filename: "ic_launcher.png",
      format: "png",
      hasAlpha: true,
      notes: "Launcher icon for standard hdpi devices.",
      officialDocUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher"
    },
    {
      id: "android-launcher-mdpi",
      name: "Launcher Icon (mdpi 48x48)",
      platform: "android",
      category: "launcher",
      size: 48,
      width: 48,
      height: 48,
      scale: "mdpi (~160 dpi)",
      folderPath: "res/mipmap-mdpi",
      filename: "ic_launcher.png",
      format: "png",
      hasAlpha: true,
      notes: "Base baseline density 1x launcher icon.",
      officialDocUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher"
    },
    // Notification Icons (monochrome white on transparent)
    {
      id: "android-notification-96",
      name: "Notification Icon (xxhdpi 96x96)",
      platform: "android",
      category: "notification",
      size: 96,
      width: 96,
      height: 96,
      scale: "xxhdpi",
      folderPath: "res/drawable-xxhdpi",
      filename: "ic_stat_notification.png",
      format: "png",
      hasAlpha: true,
      notes: "Must be all-white pixels on a transparent background.",
      officialDocUrl: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_status_bar"
    }
  ]
};
