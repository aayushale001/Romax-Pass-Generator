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

export function QrFocusedCard({
  brandProfile,
  concept,
  memberData,
  selectedFields,
  qrValue,
  compact,
}: CardTemplateProps) {
  const details = getVisibleDetails(selectedFields, memberData, "high", compact);

  return (
    <div
      className={`relative grid h-full w-full overflow-hidden rounded-lg border shadow-sm ${
        compact
          ? "grid-cols-[1fr_68px] gap-2 p-3"
          : "grid-cols-[1fr_120px] gap-4 p-5"
      }`}
      style={cardStyle(concept)}
    >
      <DecorativeLayer concept={concept} />
      <div className="relative flex min-w-0 flex-col justify-between">
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
          <div className="truncate text-xs font-semibold opacity-70">
            {getDisplayValue("memberId", memberData)}
          </div>
        </div>
        <DetailGrid details={details} compact={compact} />
      </div>
      <div
        className={`relative flex flex-col items-center justify-between rounded-md ${
          compact ? "p-2" : "p-3"
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
        ) : null}
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
