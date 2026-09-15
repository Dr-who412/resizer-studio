export interface AdPlacementConfig {
  id: string;
  name: string;
  enabled: boolean;
  type: 'banner_top' | 'banner_inline' | 'banner_bottom';
  format: 'leaderboard' | 'medium_rectangle' | 'responsive_strip';
  googleAdSenseSlotId?: string;
  client?: string;
  fallbackText: string;
  sponsorName?: string;
  sponsorUrl?: string;
}

export const defaultAdsConfig: Record<string, AdPlacementConfig> = {
  topLeaderboard: {
    id: 'top-leaderboard-ad',
    name: 'Top Header Banner (728x90 / 320x50)',
    enabled: true,
    type: 'banner_top',
    format: 'leaderboard',
    googleAdSenseSlotId: 'ca-pub-demo-0001',
    fallbackText: 'Sponsored Developer Tools & Cloud Hosting Services',
    sponsorName: 'Mobile Dev Cloud',
    sponsorUrl: 'https://cloud.google.com'
  },
  inlineSection: {
    id: 'inline-section-ad',
    name: 'Mid-Page Responsive Banner',
    enabled: true,
    type: 'banner_inline',
    format: 'responsive_strip',
    googleAdSenseSlotId: 'ca-pub-demo-0002',
    fallbackText: 'Build, Test, and Ship Native iOS & Android Apps Faster with CI/CD',
    sponsorName: 'Native Dev Stack',
    sponsorUrl: 'https://firebase.google.com'
  },
  bottomBanner: {
    id: 'bottom-footer-ad',
    name: 'Footer Responsive Strip',
    enabled: true,
    type: 'banner_bottom',
    format: 'responsive_strip',
    googleAdSenseSlotId: 'ca-pub-demo-0003',
    fallbackText: 'Free & Open Source Assets for App Store & Google Play Optimization',
    sponsorName: 'App Growth Labs',
    sponsorUrl: 'https://support.google.com/googleplay/android-developer'
  }
};
