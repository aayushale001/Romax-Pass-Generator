"use client";

import {
  AccentMark,
  ArtSlot,
  DecorativeLayer,
  DetailGrid,
  LogoBlock,
  MemberPhoto,
  QrBlock,
  cardStyle,
  getDisplayValue,
  getVisibleDetails,
  secondaryBackground,
  type CardTemplateProps,
} from "@/components/templates/templateUtils";

export function PhotoLeftCard({
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
      className="relative grid h-full w-full grid-cols-[34%_1fr] overflow-hidden rounded-lg border shadow-sm"
      style={cardStyle(concept)}
    >
      <DecorativeLayer concept={concept} />
      <div
        className={`relative flex flex-col items-center justify-between ${
          compact ? "p-3" : "p-5"
        }`}
        style={{ background: secondaryBackground(concept) }}
      >
        {selectedFields.decorativeArt ? (
          <ArtSlot memberData={memberData} concept={concept} compact={compact} />
        ) : selectedFields.photo ? (
          <MemberPhoto
            memberData={memberData}
            shape={concept.layout.photoShape}
            compact={compact}
          />
        ) : (
          <div />
        )}
      </div>
      <div
        className={`relative flex min-w-0 flex-col justify-between ${
          compact ? "p-3" : "p-5"
        }`}
      >
        <LogoBlock
          brandProfile={brandProfile}
          compact={compact}
          align={concept.layout.logoPosition === "top-center" ? "center" : "left"}
        />
        <div className="min-w-0">
          <AccentMark concept={concept} compact={compact} className="mb-2" />
          <div
            className={`truncate font-bold leading-tight ${
              compact ? "text-base" : "text-2xl"
            }`}
          >
            {getDisplayValue("name", memberData)}
          </div>
          <div className="truncate text-xs font-medium opacity-70">
            {getDisplayValue("tier", memberData)}
          </div>
        </div>
        <div className={`flex items-end ${compact ? "gap-2" : "gap-4"}`}>
          <div className="min-w-0 flex-1">
            <DetailGrid details={details} compact={compact} />
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
    </div>
  );
}
