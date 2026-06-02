"use client";

import type { CSSProperties, ReactNode } from "react";
import { QRCodeCanvas } from "qrcode.react";
import type {
  BrandProfile,
  CardConcept,
  CardVisualStyle,
  MemberData,
  MemberFieldKey,
  SelectedFields,
} from "@/types/card";
import { memberFieldLabels, memberFieldKeys } from "@/types/card";
import { getReadableTextColor } from "@/lib/colors";

export type CardTemplateProps = {
  brandProfile: BrandProfile;
  concept: CardConcept;
  memberData: MemberData;
  selectedFields: SelectedFields;
  qrValue: string;
  compact?: boolean;
};

const defaultVisualStyle: CardVisualStyle = {
  backgroundTreatment: "solid",
  accentShape: "bar",
  texture: "none",
  decorativeMotif: "none",
};

export const fieldFallbacks: Record<MemberFieldKey, string> = {
  name: "Avery Morgan",
  photo: "",
  email: "avery@example.com",
  phone: "+44 7700 900321",
  memberId: "MEM-0001",
  tier: "Gold",
  expiryDate: "2027-06-01",
  dateJoined: "2026-06-01",
  studentId: "S-48291",
  course: "Design Systems",
  loyaltyPoints: "1,250",
  qrCode: "",
  decorativeArt: "",
};

export function getDisplayValue(key: MemberFieldKey, memberData: MemberData) {
  if (key === "name") {
    return memberData.name || fieldFallbacks.name;
  }

  if (key === "memberId") {
    return memberData.memberId || fieldFallbacks.memberId;
  }

  return (
    memberData[key as keyof MemberData]?.toString() ||
    fieldFallbacks[key] ||
    ""
  );
}

export function getInitials(value: string) {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (parts[0]?.[0] ?? "M") + (parts[1]?.[0] ?? "");
}

export function getVisibleDetails(
  selectedFields: SelectedFields,
  memberData: MemberData,
  density: CardConcept["layout"]["fieldDensity"],
  compact?: boolean,
) {
  const hidden = new Set<MemberFieldKey>([
    "name",
    "photo",
    "qrCode",
    "decorativeArt",
  ]);
  const max = compact
    ? density === "high"
      ? 3
      : density === "medium"
        ? 2
        : 1
    : density === "high"
      ? 8
      : density === "medium"
        ? 5
        : 3;

  return memberFieldKeys
    .filter((key) => selectedFields[key] && !hidden.has(key))
    .map((key) => ({
      key,
      label: memberFieldLabels[key],
      value: getDisplayValue(key, memberData),
    }))
    .slice(0, max);
}

export function LogoBlock({
  brandProfile,
  align = "left",
  compact,
}: {
  brandProfile: BrandProfile;
  align?: "left" | "center";
  compact?: boolean;
}) {
  const showMark = brandProfile.logoMode !== "none";
  const showLogoImage = brandProfile.logoMode === "image" && brandProfile.logoUrl;

  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === "center" ? "justify-center text-center" : ""
      }`}
    >
      {showMark ? (
        <div
          className={`grid shrink-0 place-items-center overflow-hidden rounded-md border border-black/10 bg-white/95 ${
            compact ? "h-6 w-6" : "h-10 w-10"
          }`}
        >
          {showLogoImage ? (
            <img
              src={brandProfile.logoUrl ?? ""}
              alt={`${brandProfile.businessName} logo`}
              className="h-full w-full object-contain p-1"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-[11px] font-bold text-gray-900">
              {getInitials(brandProfile.businessName)}
            </span>
          )}
        </div>
      ) : null}
      <div className="min-w-0">
        <div
          className={`truncate font-semibold leading-tight ${
            compact ? "text-[9px]" : "text-sm"
          }`}
        >
          {brandProfile.businessName}
        </div>
        {!compact ? (
          <div className="truncate text-[10px] opacity-70">
            {brandProfile.industry}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MemberPhoto({
  memberData,
  shape,
  compact,
}: {
  memberData: MemberData;
  shape: CardConcept["layout"]["photoShape"];
  compact?: boolean;
}) {
  const name = getDisplayValue("name", memberData);
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "square"
        ? "rounded-none"
        : "rounded-md";

  return (
    <div
      className={`${shapeClass} grid shrink-0 place-items-center overflow-hidden border border-black/10 bg-white/80 ${
        compact ? "h-12 w-12" : "h-24 w-24"
      }`}
    >
      {memberData.photoUrl ? (
        <img
          src={memberData.photoUrl}
          alt={`${name} portrait`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={`${compact ? "text-sm" : "text-lg"} font-bold text-gray-800`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

export function ArtSlot({
  memberData,
  concept,
  compact,
  children,
}: {
  memberData: MemberData;
  concept?: CardConcept;
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md border border-white/25 bg-white/20 ${
        compact ? "h-12 w-12" : "h-24 w-24"
      }`}
    >
      {memberData.decorativeArtUrl ? (
        <img
          src={memberData.decorativeArtUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        (children ?? (concept ? <MotifArt concept={concept} compact={compact} /> : null))
      )}
    </div>
  );
}

export function MotifArt({
  concept,
  compact,
}: {
  concept: CardConcept;
  compact?: boolean;
}) {
  const visual = getVisualStyle(concept);
  const motif = visual.decorativeMotif;
  const badgeText = concept.artDirection?.badgeText ?? "Member";
  const labelClass = compact ? "text-[8px]" : "text-[10px]";

  if (motif === "manga-burst") {
    return (
      <div
        className="grid h-full w-full place-items-center"
        style={{
          background: `repeating-conic-gradient(from 0deg, ${concept.colors.accent} 0 9deg, #ffffff 9deg 18deg)`,
        }}
      >
        <div className="rounded-full bg-white/90 px-2 py-1 text-center text-xs font-black text-gray-950">
          {badgeText}
        </div>
      </div>
    );
  }

  if (motif === "cinematic-poster") {
    return (
      <div
        className="flex h-full w-full flex-col justify-between p-2"
        style={{
          background: `linear-gradient(155deg, #111827, ${concept.colors.accent})`,
          color: "#ffffff",
        }}
      >
        <div className={`${labelClass} font-bold uppercase opacity-80`}>
          {badgeText}
        </div>
        <div className="h-8 w-8 rounded-full bg-white/20 ring-2 ring-white/40" />
        <div className="h-1 w-full rounded-full bg-white/70" />
      </div>
    );
  }

  if (motif === "mascot-badge") {
    return (
      <div className="grid h-full w-full place-items-center bg-white/80">
        <div
          className="grid h-3/4 w-3/4 place-items-center rounded-full text-sm font-black"
          style={{ background: concept.colors.accent, color: "#ffffff" }}
        >
          {badgeText.slice(0, 2).toUpperCase()}
        </div>
      </div>
    );
  }

  if (motif === "portrait-frame") {
    return (
      <div className="grid h-full w-full place-items-center bg-white/70 p-2">
        <div
          className="grid h-full w-full place-items-center rounded-md border-2"
          style={{ borderColor: concept.colors.accent }}
        >
          <div className="h-1/2 w-1/2 rounded-full bg-gray-900/20" />
        </div>
      </div>
    );
  }

  if (motif === "geometric-orbit") {
    return (
      <div className="relative h-full w-full bg-white/50">
        <div
          className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: concept.colors.accent }}
        />
        <div
          className="absolute left-1/4 top-1/3 h-5 w-5 rounded-full"
          style={{ background: concept.colors.accent }}
        />
        <div className="absolute bottom-4 right-4 h-3 w-10 rounded-full bg-gray-900/20" />
      </div>
    );
  }

  if (motif === "abstract-waves") {
    return (
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, ${concept.colors.accent} 0 20%, transparent 21%), radial-gradient(circle at 80% 65%, ${secondaryBackground(
            concept,
          )} 0 28%, transparent 29%)`,
          backgroundColor: "#ffffff99",
        }}
      />
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{ background: `${concept.colors.accent}22` }}
    />
  );
}

export function QrBlock({
  qrValue,
  foreground,
  compact,
}: {
  qrValue: string;
  foreground: string;
  compact?: boolean;
}) {
  const background =
    getReadableTextColor(foreground) === "#ffffff" ? "#ffffff" : "#f8fafc";

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-md bg-white p-1 shadow-sm ${
        compact ? "h-12 w-12" : "h-20 w-20"
      }`}
    >
      <QRCodeCanvas
        value={qrValue}
        size={compact ? 38 : 68}
        bgColor={background}
        fgColor="#111827"
        marginSize={0}
      />
    </div>
  );
}

export function getVisualStyle(concept: CardConcept): CardVisualStyle {
  return concept.visualStyle ?? defaultVisualStyle;
}

function overlayColor(concept: CardConcept, opacity: string) {
  return `${concept.colors.accent}${opacity}`;
}

export function DecorativeLayer({ concept }: { concept: CardConcept }) {
  const visual = getVisualStyle(concept);
  const secondary = secondaryBackground(concept);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {visual.backgroundTreatment === "soft-panel" ? (
        <div
          className="absolute inset-y-4 right-4 w-2/5 rounded-md opacity-30"
          style={{ background: secondary }}
        />
      ) : null}
      {visual.backgroundTreatment === "diagonal-band" ? (
        <div
          className="absolute -inset-y-16 -right-10 w-1/2 rotate-12 opacity-30"
          style={{ background: secondary }}
        />
      ) : null}
      {visual.backgroundTreatment === "split-tone" ? (
        <div
          className="absolute inset-x-0 bottom-0 h-[42%] opacity-35"
          style={{ background: secondary }}
        />
      ) : null}
      {visual.backgroundTreatment === "gradient-depth" ? (
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at 80% 10%, ${overlayColor(
              concept,
              "55",
            )}, transparent 34%), linear-gradient(135deg, transparent, ${secondary})`,
          }}
        />
      ) : null}
      {visual.backgroundTreatment === "verification-grid" ? (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(${overlayColor(
              concept,
              "66",
            )} 1px, transparent 1px), linear-gradient(90deg, ${overlayColor(
              concept,
              "66",
            )} 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
          }}
        />
      ) : null}
      {visual.accentShape === "corner-ribbon" ? (
        <div
          className="absolute right-0 top-0 h-16 w-16 opacity-80"
          style={{
            background: `linear-gradient(45deg, transparent 0 50%, ${concept.colors.accent} 51%)`,
          }}
        />
      ) : null}
      {visual.accentShape === "side-rail" ? (
        <div
          className="absolute inset-y-0 left-0 w-2"
          style={{ background: concept.colors.accent }}
        />
      ) : null}
      {visual.accentShape === "large-stamp" ? (
        <div
          className="absolute bottom-3 right-3 rounded-md border px-3 py-1 text-[10px] font-bold uppercase opacity-20"
          style={{
            borderColor: concept.colors.accent,
            color: concept.colors.accent,
          }}
        >
          Verified
        </div>
      ) : null}
      {visual.accentShape === "halo" ? (
        <div
          className="absolute -right-8 top-8 h-28 w-28 rounded-full border-[18px] opacity-20"
          style={{ borderColor: concept.colors.accent }}
        />
      ) : null}
      {visual.decorativeMotif !== "none" ? (
        <div className="absolute -right-4 bottom-4 h-20 w-20 opacity-20">
          <MotifArt concept={concept} compact />
        </div>
      ) : null}
      {visual.texture === "fine-lines" ? (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, ${overlayColor(
              concept,
              "88",
            )} 0 1px, transparent 1px 10px)`,
          }}
        />
      ) : null}
      {visual.texture === "dot-grid" ? (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(${overlayColor(
              concept,
              "88",
            )} 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
          }}
        />
      ) : null}
      {visual.texture === "topographic" ? (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-radial-gradient(circle at 12% 18%, transparent 0 10px, ${overlayColor(
              concept,
              "77",
            )} 11px 12px, transparent 13px 22px)`,
          }}
        />
      ) : null}
    </div>
  );
}

export function AccentMark({
  concept,
  compact,
  className = "",
}: {
  concept: CardConcept;
  compact?: boolean;
  className?: string;
}) {
  const visual = getVisualStyle(concept);

  if (visual.accentShape === "pill" || visual.accentShape === "halo") {
    return (
      <div
        aria-hidden
        className={`h-2.5 w-16 shrink-0 rounded-full ${className}`}
        style={accentStyle(concept)}
      />
    );
  }

  if (visual.accentShape === "corner-ribbon") {
    return (
      <div
        aria-hidden
        className={`h-2.5 w-16 shrink-0 rounded-sm ${className}`}
        style={{
          background: `linear-gradient(90deg, ${concept.colors.accent}, transparent)`,
        }}
      />
    );
  }

  if (visual.accentShape === "large-stamp") {
    return (
      <div
        aria-hidden
        className={`grid shrink-0 place-items-center rounded-md border font-bold uppercase tracking-normal ${
          compact ? "h-5 w-14 text-[7px]" : "h-7 w-16 text-[8px]"
        } place-items-center ${className}`}
        style={{
          borderColor: concept.colors.accent,
          color: concept.colors.accent,
        }}
      >
        Verified
      </div>
    );
  }

  if (visual.accentShape === "side-rail") {
    return (
      <div
        aria-hidden
        className={`h-1.5 w-16 shrink-0 rounded-sm ${className}`}
        style={accentStyle(concept)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`h-1 w-14 shrink-0 rounded-sm ${className}`}
      style={accentStyle(concept)}
    />
  );
}

export function DetailGrid({
  details,
  compact,
  columns = 2,
}: {
  details: Array<{ key: string; label: string; value: string }>;
  compact?: boolean;
  columns?: 1 | 2;
}) {
  return (
    <div
      className={`grid min-w-0 ${compact ? "gap-1" : "gap-2"} ${
        columns === 2 ? "grid-cols-2" : "grid-cols-1"
      }`}
    >
      {details.map((detail) => (
        <div key={detail.key} className="min-w-0">
          <div
            className={`truncate font-medium uppercase opacity-60 ${
              compact ? "text-[7px]" : "text-[9px]"
            }`}
          >
            {detail.label}
          </div>
          <div
            className={`truncate font-semibold leading-tight ${
              compact ? "text-[9px]" : "text-xs"
            }`}
          >
            {detail.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function cardStyle(concept: CardConcept): CSSProperties {
  return {
    background: concept.colors.background,
    color: concept.colors.text,
    borderColor: `${concept.colors.accent}33`,
  };
}

export function accentStyle(concept: CardConcept): CSSProperties {
  return {
    background: concept.colors.accent,
  };
}

export function secondaryBackground(concept: CardConcept) {
  return concept.colors.secondaryBackground ?? concept.colors.background;
}

export function getArtPrompt(concept: CardConcept) {
  return concept.artDirection?.artPrompt?.trim() || "";
}
