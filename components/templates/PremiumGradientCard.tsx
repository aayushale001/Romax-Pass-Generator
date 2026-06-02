"use client";

import {
  AccentMark,
  ArtSlot,
  DecorativeLayer,
  DetailGrid,
  LogoBlock,
  MemberPhoto,
  QrBlock,
  getDisplayValue,
  getVisibleDetails,
  secondaryBackground,
  type CardTemplateProps,
} from "@/components/templates/templateUtils";

export function PremiumGradientCard({
  brandProfile,
  concept,
  memberData,
  selectedFields,
  qrValue,
  compact,
}: CardTemplateProps) {
  const details = getVisibleDetails(
    selectedFields,
    memberData,
    concept.layout.fieldDensity,
    compact,
  );

  return (
    <div
      className={`relative flex h-full w-full overflow-hidden rounded-lg border border-white/20 shadow-sm ${
        compact ? "p-3" : "p-5"
      }`}
      style={{
        background: `linear-gradient(135deg, ${concept.colors.background}, ${secondaryBackground(concept)})`,
        color: concept.colors.text,
      }}
    >
      <DecorativeLayer concept={concept} />
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/20" />
      <div className="relative flex min-w-0 flex-1 flex-col justify-between">
        <LogoBlock
          brandProfile={brandProfile}
          compact={compact}
          align={concept.layout.logoPosition === "top-center" ? "center" : "left"}
        />
        <div className="min-w-0">
          <AccentMark concept={concept} compact={compact} className="mb-2" />
          <div
            className={`truncate font-bold leading-tight ${
              compact ? "text-base" : "text-3xl"
            }`}
          >
            {getDisplayValue("name", memberData)}
          </div>
          <div className="mt-1 truncate text-xs font-medium opacity-75">
            {getDisplayValue("tier", memberData)}
          </div>
        </div>
        <DetailGrid details={details} compact={compact} />
      </div>
      <div
        className={`relative flex shrink-0 flex-col items-end justify-between ${
          compact ? "ml-2" : "ml-4"
        }`}
      >
        <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
          {selectedFields.decorativeArt ? (
            <ArtSlot memberData={memberData} concept={concept} compact={compact} />
          ) : selectedFields.photo ? (
            <MemberPhoto
              memberData={memberData}
              shape={concept.layout.photoShape}
              compact={compact}
            />
          ) : null}
        </div>
        {selectedFields.qrCode ? (
          <QrBlock
            qrValue={qrValue}
            foreground={concept.colors.text}
            compact={compact}
          />
        ) : null}
      </div>
    </div>
  );
}
