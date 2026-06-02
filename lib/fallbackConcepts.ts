import type {
  BrandProfile,
  CardConcept,
  MemberFieldKey,
} from "@/types/card";
import {
  getDeepBackground,
  getMutedAccent,
  getReadableTextColor,
  getSoftBackground,
  mixColors,
  normalizeHexColor,
} from "@/lib/colors";

const brandLock = {
  businessName: true,
  logo: true,
  primaryColor: true,
  tone: true,
  templateFamily: true,
} as const;

const coreFields: MemberFieldKey[] = [
  "name",
  "photo",
  "memberId",
  "tier",
  "expiryDate",
  "qrCode",
];

function fieldsForIndustry(industry: string): MemberFieldKey[] {
  const value = industry.toLowerCase();

  if (value.includes("education") || value.includes("university")) {
    return [...coreFields, "studentId", "course", "email"];
  }

  if (value.includes("fitness") || value.includes("club")) {
    return [...coreFields, "dateJoined", "phone", "loyaltyPoints"];
  }

  if (value.includes("retail") || value.includes("hospitality")) {
    return [...coreFields, "loyaltyPoints", "email", "decorativeArt"];
  }

  return [...coreFields, "email", "phone", "dateJoined"];
}

function defaultBlueprint(
  structure: CardConcept["blueprint"]["structure"],
  orientation: CardConcept["blueprint"]["orientation"],
): CardConcept["blueprint"] {
  const vertical = orientation === "vertical";

  return {
    structure,
    orientation,
    brandZone: vertical ? "top-center" : "top-left",
    identityZone: structure === "split-panel" ? "right" : "center",
    mediaZone:
      structure === "poster"
        ? "background"
        : structure === "split-panel"
          ? "left-panel"
          : structure === "vertical-profile"
            ? "top-hero"
            : "none",
    qrZone: structure === "qr-hero" ? "large-center" : "bottom-right",
    fieldZone:
      structure === "minimal"
        ? "compact-row"
        : structure === "poster"
          ? "badges"
          : "grid",
  };
}

function selectedBrandImage(brand: BrandProfile) {
  return (
    brand.selectedBackgroundImageUrl ??
    brand.selectedHeroImageUrl ??
    brand.assets?.find((asset) => asset.role === "backgroundCandidate")?.url ??
    brand.assets?.find((asset) => asset.role === "heroCandidate")?.url ??
    null
  );
}

export function createFallbackConcepts(brand: BrandProfile): CardConcept[] {
  const primary = normalizeHexColor(brand.primaryColor);
  const soft = getSoftBackground(primary);
  const deep = getDeepBackground(primary);
  const muted = getMutedAccent(primary);
  const fields = fieldsForIndustry(brand.industry);
  const premiumFields: MemberFieldKey[] = [...fields, "decorativeArt"];
  const imageUrl = selectedBrandImage(brand);

  return [
    {
      id: "concept-classic",
      conceptName: "Official Signature",
      shortReason:
        "A direct brand-forward card with clear identity, member details, and verification.",
      templateFamily: "institutional",
      templateId: "classic-horizontal",
      visualTone: "formal",
      brandColorUsage: "balanced",
      background: {
        type: "pattern",
        color: "#ffffff",
        imageUrl: null,
        imageRole: null,
        overlayColor: primary,
        overlayOpacity: 0.1,
        pattern: "grid",
      },
      blueprint: defaultBlueprint("official-grid", "horizontal"),
      colors: {
        background: "#ffffff",
        text: "#111827",
        accent: primary,
        secondaryBackground: soft,
      },
      layout: {
        logoPosition: "top-left",
        photoShape: "rounded-square",
        qrPosition: "bottom-right",
        fieldDensity: "medium",
      },
      typography: {
        style: "clean",
        headingWeight: "semibold",
      },
      visualStyle: {
        backgroundTreatment: "soft-panel",
        accentShape: "bar",
        texture: "none",
        decorativeMotif: "abstract-waves",
      },
      artDirection: {
        badgeText: "Member",
        tagline: "Official brand membership",
        artPrompt: null,
      },
      recommendedFields: fields,
      brandLock,
    },
    {
      id: "concept-modern",
      conceptName: "Modern Credential",
      shortReason:
        "A compact vertical pass that keeps the logo dominant and makes the member profile feel personal.",
      templateFamily: "identity",
      templateId: "blueprint-renderer",
      visualTone: "modern",
      brandColorUsage: "split-panel",
      background: {
        type: imageUrl ? "image-overlay" : "gradient",
        color: soft,
        imageUrl,
        imageRole: imageUrl ? "heroImage" : null,
        overlayColor: primary,
        overlayOpacity: imageUrl ? 0.58 : null,
        pattern: imageUrl ? "none" : null,
      },
      blueprint: defaultBlueprint("vertical-profile", "vertical"),
      colors: {
        background: soft,
        text: "#111827",
        accent: primary,
        secondaryBackground: "#ffffff",
      },
      layout: {
        logoPosition: "top-center",
        photoShape: "circle",
        qrPosition: "bottom-center",
        fieldDensity: "low",
      },
      typography: {
        style: "modern",
        headingWeight: "bold",
      },
      visualStyle: {
        backgroundTreatment: "split-tone",
        accentShape: "halo",
        texture: "dot-grid",
        decorativeMotif: "portrait-frame",
      },
      artDirection: {
        badgeText: "Profile",
        tagline: "Personal identity pass",
        artPrompt: "Upload a clean portrait, avatar, or character-style member image.",
      },
      recommendedFields: fields.slice(0, 7),
      brandLock,
    },
    {
      id: "concept-premium",
      conceptName: "Premium Brand Pass",
      shortReason:
        "A richer treatment using the locked brand color as the card identity while preserving legibility.",
      templateFamily: "premium",
      templateId: "blueprint-renderer",
      visualTone: "premium",
      brandColorUsage: "gradient",
      background: {
        type: "gradient",
        color: deep,
        imageUrl: imageUrl,
        imageRole: imageUrl ? "brandBackground" : null,
        overlayColor: primary,
        overlayOpacity: imageUrl ? 0.42 : null,
        pattern: "waves",
      },
      blueprint: defaultBlueprint("poster", "horizontal"),
      colors: {
        background: deep,
        text: getReadableTextColor(deep),
        accent: primary,
        secondaryBackground: mixColors(primary, "#ffffff", 0.2),
      },
      layout: {
        logoPosition: "top-left",
        photoShape: "rounded-square",
        qrPosition: "bottom-right",
        fieldDensity: "medium",
      },
      typography: {
        style: "bold",
        headingWeight: "bold",
      },
      visualStyle: {
        backgroundTreatment: "gradient-depth",
        accentShape: "corner-ribbon",
        texture: "fine-lines",
        decorativeMotif: "cinematic-poster",
      },
      artDirection: {
        badgeText: "VIP",
        tagline: "Premium visual membership",
        artPrompt:
          "Upload dramatic poster-style artwork or a premium member avatar.",
      },
      recommendedFields: premiumFields.slice(0, 10),
      brandLock,
    },
    {
      id: "concept-minimal",
      conceptName: "Minimal Verification",
      shortReason:
        "A quieter card that prioritizes scannability, official fields, and a strong verification area.",
      templateFamily: "event-access",
      templateId: "blueprint-renderer",
      visualTone: "minimal",
      brandColorUsage: "dominant",
      background: {
        type: "pattern",
        color: "#f8fafc",
        imageUrl: null,
        imageRole: null,
        overlayColor: primary,
        overlayOpacity: 0.12,
        pattern: "diagonal",
      },
      blueprint: defaultBlueprint("qr-hero", "horizontal"),
      colors: {
        background: "#f8fafc",
        text: "#111827",
        accent: primary,
        secondaryBackground: muted,
      },
      layout: {
        logoPosition: "top-left",
        photoShape: "square",
        qrPosition: "bottom-right",
        fieldDensity: "high",
      },
      typography: {
        style: "clean",
        headingWeight: "semibold",
      },
      visualStyle: {
        backgroundTreatment: "verification-grid",
        accentShape: "side-rail",
        texture: "topographic",
        decorativeMotif: "geometric-orbit",
      },
      artDirection: {
        badgeText: "Verified",
        tagline: "Fast scan verification",
        artPrompt: null,
      },
      recommendedFields: fields,
      brandLock,
    },
  ];
}

export function lockConceptToBrand(
  concept: CardConcept,
  brand: BrandProfile,
  fallback: CardConcept,
): CardConcept {
  const primary = normalizeHexColor(brand.primaryColor);
  const background = normalizeHexColor(
    concept.colors.background,
    fallback.colors.background,
  );
  const text = normalizeHexColor(
    concept.colors.text,
    getReadableTextColor(background),
  );

  const recommendedFields = Array.from(
    new Set<MemberFieldKey>([...concept.recommendedFields, "qrCode", "memberId"]),
  );
  const brandColorUsage =
    concept.brandColorUsage ?? brand.brandColorUsage ?? fallback.brandColorUsage;

  return {
    ...concept,
    templateFamily: concept.templateFamily ?? fallback.templateFamily,
    templateId: concept.templateId ?? fallback.templateId,
    visualTone: concept.visualTone ?? fallback.visualTone,
    brandColorUsage,
    background: {
      ...fallback.background,
      ...concept.background,
      color: concept.background?.color
        ? normalizeHexColor(concept.background.color, fallback.background.color ?? background)
        : (concept.background?.color ?? fallback.background.color ?? background),
      imageUrl:
        concept.background?.imageUrl ??
        fallback.background.imageUrl ??
        selectedBrandImage(brand),
      overlayColor: concept.background?.overlayColor
        ? normalizeHexColor(concept.background.overlayColor, primary)
        : (concept.background?.overlayColor ?? primary),
    },
    blueprint: concept.blueprint ?? fallback.blueprint,
    colors: {
      background,
      text,
      accent: primary,
      secondaryBackground: concept.colors.secondaryBackground
        ? normalizeHexColor(
            concept.colors.secondaryBackground,
            fallback.colors.secondaryBackground ?? undefined,
          )
        : fallback.colors.secondaryBackground,
    },
    visualStyle: concept.visualStyle ?? fallback.visualStyle,
    artDirection: concept.artDirection ?? fallback.artDirection,
    recommendedFields,
    brandLock,
  };
}

export function locallyRefineConcept(
  concept: CardConcept,
  brand: BrandProfile,
  instruction: string,
): CardConcept {
  const lowerInstruction = instruction.toLowerCase();
  const asksForArt =
    /actor|anime|character|avatar|mascot|poster|picture|photo|image|art/.test(
      lowerInstruction,
    );
  const motif = /anime|manga/.test(lowerInstruction)
    ? "manga-burst"
    : /actor|poster|cinematic/.test(lowerInstruction)
      ? "cinematic-poster"
      : "portrait-frame";
  const fallback = createFallbackConcepts(brand)[0];

  return lockConceptToBrand(
    {
      ...concept,
      conceptName: asksForArt ? "Custom Art Pass" : concept.conceptName,
      shortReason: asksForArt
        ? "Adds a prominent controlled art slot while preserving official brand identity and verification."
        : `${concept.shortReason} Refined for: ${instruction.slice(0, 80)}`,
      visualStyle: {
        ...(concept.visualStyle ?? fallback.visualStyle),
        backgroundTreatment: asksForArt
          ? "diagonal-band"
          : (concept.visualStyle ?? fallback.visualStyle)?.backgroundTreatment ??
            "soft-panel",
        accentShape: asksForArt
          ? "large-stamp"
          : (concept.visualStyle ?? fallback.visualStyle)?.accentShape ?? "bar",
        texture: asksForArt
          ? "dot-grid"
          : (concept.visualStyle ?? fallback.visualStyle)?.texture ?? "none",
        decorativeMotif: asksForArt
          ? motif
          : (concept.visualStyle ?? fallback.visualStyle)?.decorativeMotif ??
            "abstract-waves",
      },
      artDirection: {
        badgeText: asksForArt ? "Custom" : concept.artDirection?.badgeText ?? "Member",
        tagline: asksForArt
          ? "Character-led member identity"
          : concept.artDirection?.tagline ?? "Official membership",
        artPrompt: asksForArt
          ? `Use the decorative art upload for this brief: ${instruction.slice(0, 180)}`
          : concept.artDirection?.artPrompt ?? null,
      },
      templateFamily: asksForArt ? "creative" : concept.templateFamily,
      templateId: asksForArt ? "blueprint-renderer" : concept.templateId,
      visualTone: asksForArt ? "creative" : concept.visualTone,
      brandColorUsage: asksForArt ? "dominant" : concept.brandColorUsage,
      background: asksForArt
        ? {
            type: "image-overlay",
            color: concept.colors.background,
            imageUrl: brand.selectedBackgroundImageUrl ?? brand.selectedHeroImageUrl ?? null,
            imageRole: "decorativeArt",
            overlayColor: brand.primaryColor,
            overlayOpacity: 0.45,
            pattern: "dots",
          }
        : concept.background,
      blueprint: asksForArt
        ? {
            structure: "poster",
            orientation: "horizontal",
            brandZone: "top-left",
            identityZone: "left",
            mediaZone: "right-panel",
            qrZone: "bottom-right",
            fieldZone: "badges",
          }
        : concept.blueprint,
      recommendedFields: asksForArt
        ? Array.from(
            new Set<MemberFieldKey>([
              ...concept.recommendedFields,
              "decorativeArt",
              "photo",
              "qrCode",
              "memberId",
            ]),
          )
        : concept.recommendedFields,
    },
    brand,
    fallback,
  );
}

export function normalizeConceptList(concepts: CardConcept[], brand: BrandProfile) {
  const fallbacks = createFallbackConcepts(brand);
  const merged = concepts.slice(0, 4).map((concept, index) =>
    lockConceptToBrand(concept, brand, fallbacks[index] ?? fallbacks[0]),
  );

  while (merged.length < 4) {
    merged.push(fallbacks[merged.length]);
  }

  return merged;
}
