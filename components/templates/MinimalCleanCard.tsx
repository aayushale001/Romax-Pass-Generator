"use client";

import {
  AccentMark,
  DecorativeLayer,
  DetailGrid,
  LogoBlock,
  QrBlock,
  cardStyle,
  getDisplayValue,
  getVisibleDetails,
  type CardTemplateProps,
} from "@/components/templates/templateUtils";

export function MinimalCleanCard({
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
    "medium",
    compact,
  );

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border shadow-sm ${
        compact ? "p-3" : "p-5"
      }`}
      style={cardStyle(concept)}
    >
      <DecorativeLayer concept={concept} />
      <div className="relative flex items-start justify-between gap-4">
        <LogoBlock
          brandProfile={brandProfile}
          compact={compact}
          align={concept.layout.logoPosition === "top-center" ? "center" : "left"}
        />
        <AccentMark concept={concept} compact={compact} />
      </div>
      <div className="relative min-w-0">
        <div
          className={`truncate font-bold leading-tight ${
            compact ? "text-base" : "text-3xl"
          }`}
        >
          {getDisplayValue("name", memberData)}
        </div>
        <div className="mt-1 truncate text-xs font-semibold opacity-70">
          {getDisplayValue("memberId", memberData)}
        </div>
      </div>
      <div className={`relative flex items-end ${compact ? "gap-2" : "gap-5"}`}>
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
  );
}
