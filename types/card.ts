export type ScrapedAsset = {
  id: string;
  url: string;
  role:
    | "logoCandidate"
    | "heroCandidate"
    | "profileCandidate"
    | "backgroundCandidate"
    | "unknown";
  confidence: number;
  reason: string;
};

export type BrandColorUsage =
  | "subtle"
  | "balanced"
  | "dominant"
  | "full-background"
  | "gradient"
  | "split-panel";

export type BrandCreationSource =
  | "website"
  | "prompt"
  | "reference-image"
  | "physical-card"
  | "visiting-card";

export type ReferenceImageMode = "match-original" | "design-inspiration";

export type BrandProfile = {
  websiteUrl: string;
  businessName: string;
  description: string;
  industry: string;
  logoUrl?: string | null;
  logoMode: "image" | "text-only" | "none";
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  themeColor?: string;
  brandColorUsage: BrandColorUsage;
  headings: string[];
  images: string[];
  assets: ScrapedAsset[];
  selectedHeroImageUrl?: string | null;
  selectedBackgroundImageUrl?: string | null;
  selectedProfileImageUrl?: string | null;
  brandTone: string[];
  confirmed: boolean;
  creationSource?: BrandCreationSource;
  referenceImageMode?: ReferenceImageMode;
  referenceImageUrl?: string | null;
  designBrief?: string;
};

export type BrandLock = {
  businessName: true;
  logo: true;
  primaryColor: true;
  tone: true;
  templateFamily: boolean;
};

export const memberFieldKeys = [
  "name",
  "photo",
  "email",
  "phone",
  "memberId",
  "tier",
  "expiryDate",
  "dateJoined",
  "studentId",
  "course",
  "loyaltyPoints",
  "qrCode",
  "decorativeArt",
] as const;

export type MemberFieldKey = (typeof memberFieldKeys)[number];

export const memberFieldLabels: Record<MemberFieldKey, string> = {
  name: "Name",
  photo: "Photo",
  email: "Email",
  phone: "Phone",
  memberId: "Member ID",
  tier: "Tier",
  expiryDate: "Expiry date",
  dateJoined: "Date joined",
  studentId: "Student ID",
  course: "Course",
  loyaltyPoints: "Loyalty points",
  qrCode: "QR code",
  decorativeArt: "Art slot",
};

export type SelectedFields = Record<MemberFieldKey, boolean>;

export type CardTemplateId =
  | "classic-horizontal"
  | "modern-vertical"
  | "photo-left"
  | "qr-focused"
  | "premium-gradient"
  | "minimal-clean"
  | "blueprint-renderer";

export type CardBackground = {
  type: "solid" | "gradient" | "image" | "image-overlay" | "pattern";
  color?: string | null;
  imageUrl?: string | null;
  imageRole?:
    | "brandBackground"
    | "memberPhoto"
    | "decorativeArt"
    | "heroImage"
    | null;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  pattern?: "none" | "grid" | "diagonal" | "dots" | "waves" | "noise" | null;
};

export type CardLayoutBlueprint = {
  structure:
    | "official-grid"
    | "split-panel"
    | "poster"
    | "vertical-profile"
    | "qr-hero"
    | "editorial"
    | "minimal";
  orientation: "horizontal" | "vertical";
  brandZone: "top-left" | "top-center" | "side-panel" | "bottom-left";
  identityZone: "center" | "left" | "right" | "bottom-left";
  mediaZone: "none" | "left-panel" | "right-panel" | "background" | "top-hero";
  qrZone: "bottom-right" | "bottom-center" | "right-panel" | "large-center";
  fieldZone: "grid" | "stack" | "compact-row" | "badges";
};

export type CardTemplateFamily =
  | "institutional"
  | "identity"
  | "event-access"
  | "premium"
  | "minimal"
  | "creative";

export type CardVisualTone =
  | "formal"
  | "modern"
  | "premium"
  | "playful"
  | "minimal"
  | "creative"
  | "bold";

export type CardVisualStyle = {
  backgroundTreatment:
    | "solid"
    | "soft-panel"
    | "diagonal-band"
    | "split-tone"
    | "gradient-depth"
    | "verification-grid";
  accentShape:
    | "bar"
    | "pill"
    | "corner-ribbon"
    | "large-stamp"
    | "side-rail"
    | "halo";
  texture: "none" | "fine-lines" | "dot-grid" | "topographic";
  decorativeMotif:
    | "none"
    | "abstract-waves"
    | "geometric-orbit"
    | "manga-burst"
    | "cinematic-poster"
    | "mascot-badge"
    | "portrait-frame";
};

export type CardArtDirection = {
  badgeText: string;
  tagline: string;
  artPrompt?: string | null;
};

export type GeneratedCardDesign = {
  id: string;
  name: string;
  description: string;
  mood:
    | "official"
    | "minimal"
    | "premium"
    | "playful"
    | "creative"
    | "cyberpunk"
    | "academic"
    | "luxury"
    | "event"
    | "identity";
  requiredFields: MemberFieldKey[];
  /**
   * Legacy free-form layout. No longer produced by the AI or used at render
   * time — the deterministic scene graph (lib/cardDocument.ts) owns layout now.
   * Kept optional so older saved states still parse.
   */
  html?: string;
  css?: string;
  designTokens: {
    primaryColor: string;
    secondaryColor?: string | null;
    textColor: string;
    /** Card shape: landscape credit-card or tall Apple Wallet pass. */
    orientation?: "landscape" | "portrait";
    backgroundMode:
      | "solid"
      | "gradient"
      | "image"
      | "image-overlay"
      | "pattern";
    colorUsage: "subtle" | "balanced" | "dominant" | "full";
    brandAssetSource?: "none" | "logo" | "hero" | "background";
    brandAssetTreatment?:
      | "standard"
      | "logo-watermark"
      | "background-emblem"
      | "hero-backdrop"
      | "side-emblem";
    brandAssetIntensity?: "subtle" | "medium" | "bold";
    usesLogo: boolean;
    usesQr: boolean;
    usesPhoto: boolean;
    usesDecorativeArt: boolean;
  };
};

export type CardConcept = {
  id: string;
  conceptName: string;
  shortReason: string;
  templateFamily: CardTemplateFamily;
  templateId: CardTemplateId;
  visualTone: CardVisualTone;
  brandColorUsage: BrandColorUsage;
  background: CardBackground;
  blueprint: CardLayoutBlueprint;
  colors: {
    background: string;
    text: string;
    accent: string;
    secondaryBackground?: string | null;
  };
  layout: {
    logoPosition: "top-left" | "top-center";
    photoShape: "circle" | "rounded-square" | "square";
    qrPosition: "bottom-right" | "bottom-center" | "back";
    fieldDensity: "low" | "medium" | "high";
  };
  typography: {
    style: "formal" | "modern" | "bold" | "clean" | "expressive";
    headingWeight: "medium" | "semibold" | "bold" | "black";
  };
  visualStyle?: CardVisualStyle;
  artDirection?: CardArtDirection;
  recommendedFields: MemberFieldKey[];
  brandLock: BrandLock;
};

export type RefinementPatchValue = {
  stringValue: string | null;
  numberValue: number | null;
  booleanValue: boolean | null;
  stringArrayValue: string[] | null;
};

export type RefinementPatch = {
  target: "brandProfile" | "cardConcept";
  op: "set" | "appendUnique" | "remove";
  path: string;
  value: RefinementPatchValue;
  reason: string;
};

export type LayoutIssue = {
  role: string;
  severity: "warning" | "error";
  message: string;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type DesignReviewResult = {
  status: "pass" | "fixed";
  summary: string;
  issues: string[];
  concept: GeneratedCardDesign | null;
};

export type MemberData = {
  name: string;
  photoUrl?: string;
  decorativeArtUrl?: string;
  email?: string;
  phone?: string;
  memberId: string;
  tier?: string;
  expiryDate?: string;
  dateJoined?: string;
  studentId?: string;
  course?: string;
  loyaltyPoints?: string;
};

export type WalletReadyPass = {
  passType: "storeCard" | "generic";
  organizationName: string;
  description: string;
  logoText: string;
  foregroundColor: string;
  backgroundColor: string;
  labelColor: string;
  barcode: {
    format: "PKBarcodeFormatQR";
    message: string;
  };
  primaryFields: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  secondaryFields: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  auxiliaryFields: Array<{
    key: string;
    label: string;
    value: string;
  }>;
};
