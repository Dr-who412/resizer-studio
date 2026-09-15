import { IconSpecification } from './androidIcons';

export interface IosIconConfig {
  officialSource: string;
  officialSourceUrl: string;
  lastUpdated: string;
  version: string;
  icons: IconSpecification[];
}

export const iosIconRequirements: IosIconConfig = {
  officialSource: "Apple Developer - Human Interface Guidelines: App Icons",
  officialSourceUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons",
  lastUpdated: "2026-09-01",
  version: "iOS 18 / Xcode 16",
  icons: [
    // App Store Icon
    {
      id: "ios-app-store-1024",
      name: "App Store Icon (1024x1024)",
      platform: "ios",
      category: "store",
      size: 1024,
      width: 1024,
      height: 1024,
      scale: "1x",
      folderPath: "AppIcon.appiconset",
      filename: "icon-1024.png",
      format: "png",
      hasAlpha: false,
      notes: "App Store product page. Square 90-degree corners, no transparency.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    // iPhone App Icons
    {
      id: "ios-iphone-180",
      name: "iPhone App Icon @3x (180x180)",
      platform: "ios",
      category: "launcher",
      size: 180,
      width: 180,
      height: 180,
      scale: "@3x (60pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-180.png",
      format: "png",
      hasAlpha: false,
      notes: "For Super Retina / Super Retina XDR iPhone models (Pro, Plus, Max).",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    {
      id: "ios-iphone-120",
      name: "iPhone App Icon @2x (120x120)",
      platform: "ios",
      category: "launcher",
      size: 120,
      width: 120,
      height: 120,
      scale: "@2x (60pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-120.png",
      format: "png",
      hasAlpha: false,
      notes: "For Retina iPhone models (iPhone SE, iPhone 11, etc.).",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    // Spotlight & Settings
    {
      id: "ios-spotlight-120",
      name: "Spotlight Search @3x (120x120)",
      platform: "ios",
      category: "launcher",
      size: 120,
      width: 120,
      height: 120,
      scale: "@3x (40pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-spotlight-120.png",
      format: "png",
      hasAlpha: false,
      notes: "For iOS search results.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    {
      id: "ios-spotlight-80",
      name: "Spotlight Search @2x (80x80)",
      platform: "ios",
      category: "launcher",
      size: 80,
      width: 80,
      height: 80,
      scale: "@2x (40pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-spotlight-80.png",
      format: "png",
      hasAlpha: false,
      notes: "For iOS search results on 2x screens.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    {
      id: "ios-settings-87",
      name: "Settings @3x (87x87)",
      platform: "ios",
      category: "launcher",
      size: 87,
      width: 87,
      height: 87,
      scale: "@3x (29pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-settings-87.png",
      format: "png",
      hasAlpha: false,
      notes: "App icon shown inside Settings app.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    {
      id: "ios-settings-58",
      name: "Settings @2x (58x58)",
      platform: "ios",
      category: "launcher",
      size: 58,
      width: 58,
      height: 58,
      scale: "@2x (29pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-settings-58.png",
      format: "png",
      hasAlpha: false,
      notes: "App icon shown inside Settings app on 2x devices.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    // Notifications
    {
      id: "ios-notification-60",
      name: "Notification @3x (60x60)",
      platform: "ios",
      category: "notification",
      size: 60,
      width: 60,
      height: 60,
      scale: "@3x (20pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-notification-60.png",
      format: "png",
      hasAlpha: false,
      notes: "Shown on Lock Screen and Notification Center banners.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    {
      id: "ios-notification-40",
      name: "Notification @2x (40x40)",
      platform: "ios",
      category: "notification",
      size: 40,
      width: 40,
      height: 40,
      scale: "@2x (20pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-notification-40.png",
      format: "png",
      hasAlpha: false,
      notes: "Notification center on standard screens.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    // iPad
    {
      id: "ios-ipad-167",
      name: "iPad Pro App Icon @2x (167x167)",
      platform: "ios",
      category: "launcher",
      size: 167,
      width: 167,
      height: 167,
      scale: "@2x (83.5pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-167.png",
      format: "png",
      hasAlpha: false,
      notes: "iPad Pro home screen icon.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    },
    {
      id: "ios-ipad-152",
      name: "iPad / iPad mini App Icon @2x (152x152)",
      platform: "ios",
      category: "launcher",
      size: 152,
      width: 152,
      height: 152,
      scale: "@2x (76pt)",
      folderPath: "AppIcon.appiconset",
      filename: "icon-152.png",
      format: "png",
      hasAlpha: false,
      notes: "iPad Air, iPad mini, and standard iPad home screen.",
      officialDocUrl: "https://developer.apple.com/design/human-interface-guidelines/app-icons"
    }
  ]
};
