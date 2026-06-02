import type {
  BrandProfile,
  CardConcept,
  MemberFieldKey,
  RefinementPatch,
  RefinementPatchValue,
} from "@/types/card";
import { memberFieldKeys } from "@/types/card";
import { lockConceptToBrand } from "@/lib/fallbackConcepts";
import { getDeepBackground, getReadableTextColor, normalizeHexColor } from "@/lib/colors";

const memberFieldKeySet = new Set<string>(memberFieldKeys);

function patchValue(value: RefinementPatchValue) {
  if (value.stringArrayValue) {
    return value.stringArrayValue;
  }
  if (value.stringValue !== null) {
    return value.stringValue;
  }
  if (value.numberValue !== null) {
    return value.numberValue;
  }
  if (value.booleanValue !== null) {
    return value.booleanValue;
  }

  return null;
}

function emptyValue(): RefinementPatchValue {
  return {
    stringValue: null,
    numberValue: null,
    booleanValue: null,
    stringArrayValue: null,
  };
}

function stringValue(value: string | null): RefinementPatchValue {
  return { ...emptyValue(), stringValue: value };
}

function numberValue(value: number): RefinementPatchValue {
  return { ...emptyValue(), numberValue: value };
}

function stringArrayValue(values: string[]): RefinementPatchValue {
  return { ...emptyValue(), stringArrayValue: values };
}

function assignPath<T extends object>(target: T, path: string, value: unknown) {
  const [, ...parts] = path.split(".");
  let cursor: Record<string, unknown> = target as Record<string, unknown>;

  for (const part of parts.slice(0, -1)) {
    const current = cursor[part];
    if (!current || typeof current !== "object") {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }

  const last = parts.at(-1);
  if (last) {
    cursor[last] = value;
  }
}

function sanitizePatchValue(path: string, value: unknown) {
  if (path === "cardConcept.recommendedFields") {
    const values = Array.isArray(value) ? value : [value];
    return Array.from(
      new Set(
        values.filter((field): field is MemberFieldKey =>
          memberFieldKeySet.has(String(field)),
        ),
      ),
    );
  }

  if (
    path === "brandProfile.primaryColor" ||
    path === "brandProfile.secondaryColor" ||
    path.startsWith("cardConcept.colors.") ||
    path === "cardConcept.background.color" ||
    path === "cardConcept.background.overlayColor"
  ) {
    return value ? normalizeHexColor(String(value)) : null;
  }

  if (path === "cardConcept.background.overlayOpacity") {
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? Math.min(Math.max(number, 0), 0.92) : null;
  }

  return value;
}

export function applyRefinementPatches(
  brandProfile: BrandProfile,
  concept: CardConcept,
  patches: RefinementPatch[],
) {
  const nextBrandProfile = structuredClone(brandProfile);
  const nextConcept = structuredClone(concept);

  for (const patch of patches) {
    const value = sanitizePatchValue(patch.path, patchValue(patch.value));

    if (patch.path === "cardConcept.recommendedFields") {
      const values = Array.isArray(value) ? value : [];
      if (patch.op === "appendUnique") {
        nextConcept.recommendedFields = Array.from(
          new Set([...nextConcept.recommendedFields, ...values]),
        );
      } else if (patch.op === "remove") {
        nextConcept.recommendedFields = nextConcept.recommendedFields.filter(
          (field) => !values.includes(field),
        );
      } else {
        nextConcept.recommendedFields = values.length
          ? values
          : nextConcept.recommendedFields;
      }
      continue;
    }

    if (patch.op === "remove") {
      assignPath(
        patch.path.startsWith("brandProfile.") ? nextBrandProfile : nextConcept,
        patch.path,
        null,
      );
      continue;
    }

    assignPath(
      patch.path.startsWith("brandProfile.") ? nextBrandProfile : nextConcept,
      patch.path,
      value,
    );
  }

  const lockedConcept = lockConceptToBrand(nextConcept, nextBrandProfile, concept);

  return {
    brandProfile: nextBrandProfile,
    concept: lockedConcept,
  };
}

export function locallyCreateRefinementPatches(
  brandProfile: BrandProfile,
  concept: CardConcept,
  instruction: string,
) {
  const lowerInstruction = instruction.toLowerCase();
  const patches: RefinementPatch[] = [];
  const asksForArt =
    /actor|anime|manga|character|avatar|mascot|poster|picture|photo|image|art/.test(
      lowerInstruction,
    );
  const asksForLogoChange =
    /remove logo|no logo|wrong logo|text only|text-only|change logo/.test(
      lowerInstruction,
    );
  const asksForColorImpact =
    /strong|bold|dominant|brand color|more color|full background|gradient|impact/.test(
      lowerInstruction,
    );
  const asksForBackground =
    /background|hero|portfolio|cover|banner/.test(lowerInstruction);
  const primary = normalizeHexColor(brandProfile.primaryColor);
  const deep = getDeepBackground(primary);
  const readable = getReadableTextColor(deep);
  const selectedImage =
    brandProfile.selectedBackgroundImageUrl ??
    brandProfile.selectedHeroImageUrl ??
    null;

  if (asksForLogoChange) {
    patches.push(
      {
        target: "brandProfile",
        op: "set",
        path: "brandProfile.logoUrl",
        value: stringValue(null),
        reason: "Remove the incorrect detected logo.",
      },
      {
        target: "brandProfile",
        op: "set",
        path: "brandProfile.logoMode",
        value: stringValue(lowerInstruction.includes("no logo") ? "none" : "text-only"),
        reason: "Use text identity instead of the detected logo image.",
      },
    );
  }

  if (asksForColorImpact) {
    patches.push(
      {
        target: "brandProfile",
        op: "set",
        path: "brandProfile.brandColorUsage",
        value: stringValue("dominant"),
        reason: "Use the brand color more visibly.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.brandColorUsage",
        value: stringValue("gradient"),
        reason: "Move the card to a stronger color treatment.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.colors.background",
        value: stringValue(deep),
        reason: "Make the brand color dominate the card background.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.colors.text",
        value: stringValue(readable),
        reason: "Keep text readable on the stronger background.",
      },
    );
  }

  if (asksForArt || asksForBackground) {
    patches.push(
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.templateId",
        value: stringValue("blueprint-renderer"),
        reason: "Switch to the controlled custom blueprint renderer.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.templateFamily",
        value: stringValue(asksForArt ? "creative" : "identity"),
        reason: "Match the requested custom visual direction.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.visualTone",
        value: stringValue(asksForArt ? "creative" : "bold"),
        reason: "Make the refinement visibly different.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.background.type",
        value: stringValue(selectedImage ? "image-overlay" : "pattern"),
        reason: "Use the background system instead of only color changes.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.background.imageUrl",
        value: stringValue(selectedImage),
        reason: "Use the selected brand image when available.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.background.imageRole",
        value: stringValue(asksForArt ? "decorativeArt" : "heroImage"),
        reason: "Reserve a controlled media role for the requested visual.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.background.overlayColor",
        value: stringValue(primary),
        reason: "Keep the official color locked over image media.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.background.overlayOpacity",
        value: numberValue(asksForArt ? 0.46 : 0.36),
        reason: "Balance imagery with legible official fields.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.background.pattern",
        value: stringValue(asksForArt ? "dots" : "waves"),
        reason: "Add a visible decorative system.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.blueprint.structure",
        value: stringValue(asksForArt ? "poster" : "split-panel"),
        reason: "Change the information hierarchy, not just the colors.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.blueprint.mediaZone",
        value: stringValue(asksForArt ? "right-panel" : "background"),
        reason: "Give the visual request a dedicated zone.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.blueprint.fieldZone",
        value: stringValue(asksForArt ? "badges" : "grid"),
        reason: "Adjust field hierarchy for the new layout.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.visualStyle.decorativeMotif",
        value: stringValue(
          /anime|manga/.test(lowerInstruction)
            ? "manga-burst"
            : /actor|cinematic|poster/.test(lowerInstruction)
              ? "cinematic-poster"
              : "portrait-frame",
        ),
        reason: "Represent the prompt through a controlled art motif.",
      },
      {
        target: "cardConcept",
        op: "set",
        path: "cardConcept.artDirection.artPrompt",
        value: stringValue(
          asksForArt
            ? `Create or upload decorative member art for this brief: ${instruction.slice(0, 180)}`
            : `Use brand background imagery for this brief: ${instruction.slice(0, 180)}`,
        ),
        reason: "Store the image direction without letting AI render arbitrary UI.",
      },
      {
        target: "cardConcept",
        op: "appendUnique",
        path: "cardConcept.recommendedFields",
        value: stringArrayValue(asksForArt ? ["decorativeArt", "photo"] : ["photo"]),
        reason: "Expose fields needed by the requested media treatment.",
      },
    );
  }

  if (!patches.length) {
    patches.push({
      target: "cardConcept",
      op: "set",
      path: "cardConcept.shortReason",
      value: stringValue(`${concept.shortReason} Refined for: ${instruction.slice(0, 80)}`),
      reason: "Record the requested refinement while preserving the current brand lock.",
    });
  }

  return {
    patches,
    summary: "Applied controlled brand-safe refinement patches.",
  };
}
