export interface SupportConfig {
  freeExplanation: string;
  supportEmail: string;
  githubUrl: string;
  twitterUrl: string;
  donationOptions: Array<{
    name: string;
    description: string;
    icon: string;
    url?: string;
    accountOrAddress?: string;
    recommendedAmount?: string;
  }>;
}

export const supportConfig: SupportConfig = {
  freeExplanation: "App Asset Studio is 100% free and open to all mobile developers, indie creators, and UI/UX designers worldwide. No subscriptions, no paywalls, and no hidden watermarks. All image processing executes directly in your browser.",
  supportEmail: "support@appassetstudio.dev",
  githubUrl: "https://github.com/appasset-studio",
  twitterUrl: "https://x.com/AppAssetStudio",
  donationOptions: [
    {
      name: "Buy Me a Coffee",
      description: "Support server maintenance and continuous store spec updates",
      icon: "coffee",
      url: "https://buymeacoffee.com/appassetstudio",
      recommendedAmount: "$5 / coffee"
    },
    {
      name: "GitHub Sponsors",
      description: "Sponsor open-source tooling development and CI testing",
      icon: "github",
      url: "https://github.com/sponsors/appassetstudio",
      recommendedAmount: "$10 / month"
    },
    {
      name: "Crypto (USDC / Ethereum)",
      description: "Direct zero-fee support for decentralized hosting",
      icon: "wallet",
      accountOrAddress: "0x71C...49A9 (ERC-20)",
      recommendedAmount: "Any amount"
    }
  ]
};
