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

export function ModernVerticalCard({
  brandProfile,
  concept,
  memberData,
  selectedFields,
  qrValue,
  compact,
}: CardTemplateProps) {
  const details = getVisibleDetails(selectedFields, memberData, "low", compact);

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-lg border text-center shadow-sm ${
        compact ? "p-3" : "p-5"
      }`}
      style={cardStyle(concept)}
    >
      <DecorativeLayer concept={concept} />
      <div
        className="absolute inset-x-0 top-0 h-28 opacity-35"
        style={{ background: secondaryBackground(concept) }}
      />
      <div className="relative">
        <LogoBlock brandProfile={brandProfile} compact={compact} align="center" />
      </div>
      <div
        className={`relative flex flex-1 flex-col items-center ${
          compact ? "mt-3" : "mt-7"
        }`}
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
        <div className={`${compact ? "mt-2" : "mt-4"} max-w-full`}>
          <div
            className={`truncate font-bold leading-tight ${
              compact ? "text-base" : "text-2xl"
            }`}
          >
            {getDisplayValue("name", memberData)}
          </div>
          <div className="mt-1 text-xs font-semibold opacity-70">
            {getDisplayValue("memberId", memberData)}
          </div>
        </div>
        <AccentMark
          concept={concept}
          compact={compact}
          className={compact ? "my-2" : "my-4"}
        />
        <div className="w-full">
          <DetailGrid details={details} compact={compact} columns={1} />
        </div>
      </div>
      {selectedFields.qrCode ? (
        <div className="relative flex justify-center">
          <QrBlock
            qrValue={qrValue}
            foreground={concept.colors.text}
            compact={compact}
          />
        </div>
      ) : null}
    </div>
  );
}
