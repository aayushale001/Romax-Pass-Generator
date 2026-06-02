"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  DetailGrid,
  LogoBlock,
  MemberPhoto,
  MotifArt,
  QrBlock,
  getDisplayValue,
  getVisibleDetails,
  secondaryBackground,
  type CardTemplateProps,
} from "@/components/templates/templateUtils";
import { getReadableTextColor } from "@/lib/colors";

function resolveImage({
  brandProfile,
  concept,
  memberData,
}: Pick<CardTemplateProps, "brandProfile" | "concept" | "memberData">) {
  const explicit = concept.background.imageUrl;

  if (concept.background.imageRole === "decorativeArt") {
    return (
      memberData.decorativeArtUrl ??
      explicit ??
      brandProfile.selectedBackgroundImageUrl ??
      brandProfile.selectedHeroImageUrl ??
      null
    );
  }

  if (concept.background.imageRole === "memberPhoto") {
    return memberData.photoUrl ?? brandProfile.selectedProfileImageUrl ?? explicit ?? null;
  }

  if (concept.background.imageRole === "heroImage") {
    return (
      explicit ??
      brandProfile.selectedHeroImageUrl ??
      brandProfile.selectedBackgroundImageUrl ??
      null
    );
  }

  return explicit ?? brandProfile.selectedBackgroundImageUrl ?? null;
}

function backgroundStyle({
  brandProfile,
  concept,
  memberData,
}: Pick<CardTemplateProps, "brandProfile" | "concept" | "memberData">): CSSProperties {
  const base = concept.background.color ?? concept.colors.background;
  const secondary = secondaryBackground(concept);
  const imageUrl = resolveImage({ brandProfile, concept, memberData });

  if (
    concept.background.type === "image" ||
    concept.background.type === "image-overlay"
  ) {
    return imageUrl
      ? {
          backgroundColor: base,
          backgroundImage: `url("${imageUrl}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }
      : { background: base };
  }

  if (concept.background.type === "gradient") {
    return {
      background: `linear-gradient(135deg, ${base}, ${secondary} 46%, ${concept.colors.accent})`,
    };
  }

  return { background: base };
}

function PatternLayer({ concept }: Pick<CardTemplateProps, "concept">) {
  const color = concept.background.overlayColor ?? concept.colors.accent;
  const pattern = concept.background.pattern;

  if (!pattern || pattern === "none") {
    return null;
  }

  const styleByPattern: Record<string, CSSProperties> = {
    grid: {
      backgroundImage: `linear-gradient(${color}55 1px, transparent 1px), linear-gradient(90deg, ${color}55 1px, transparent 1px)`,
      backgroundSize: "20px 20px",
    },
    dots: {
      backgroundImage: `radial-gradient(${color}88 1.2px, transparent 1.2px)`,
      backgroundSize: "14px 14px",
    },
    diagonal: {
      backgroundImage: `repeating-linear-gradient(135deg, ${color}55 0 2px, transparent 2px 12px)`,
    },
    waves: {
      backgroundImage: `radial-gradient(circle at 20% 20%, ${color}66 0 12%, transparent 13%), radial-gradient(circle at 80% 70%, ${color}44 0 18%, transparent 19%)`,
    },
    noise: {
      backgroundImage: `repeating-radial-gradient(circle at 20% 30%, ${color}33 0 1px, transparent 1px 4px)`,
      backgroundSize: "18px 18px",
    },
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-35"
      style={styleByPattern[pattern]}
    />
  );
}

function BackgroundLayer(props: CardTemplateProps) {
  const { concept } = props;
  const overlayColor = concept.background.overlayColor ?? concept.colors.accent;
  const overlayOpacity =
    concept.background.type === "image-overlay"
      ? concept.background.overlayOpacity ?? 0.42
      : 0;

  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0" style={backgroundStyle(props)} />
      {overlayOpacity ? (
        <div
          className="absolute inset-0"
          style={{ background: overlayColor, opacity: overlayOpacity }}
        />
      ) : null}
      <PatternLayer concept={concept} />
      <div
        className="absolute -right-14 -top-14 h-40 w-40 rounded-full border-[28px] opacity-20"
        style={{ borderColor: concept.colors.accent }}
      />
    </div>
  );
}

function Panel({
  children,
  compact,
  subtle,
}: {
  children: ReactNode;
  compact?: boolean;
  subtle?: boolean;
}) {
  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-md border border-white/20 ${
        subtle ? "bg-white/12" : "bg-white/18"
      } ${compact ? "p-2" : "p-4"}`}
    >
      {children}
    </div>
  );
}

function IdentityBlock({ memberData, compact }: CardTemplateProps) {
  return (
    <div className="min-w-0">
      <div
        className={`truncate font-black leading-none ${
          compact ? "text-lg" : "text-4xl"
        }`}
      >
        {getDisplayValue("name", memberData)}
      </div>
      <div
        className={`mt-2 truncate font-semibold uppercase opacity-75 ${
          compact ? "text-[9px]" : "text-xs"
        }`}
      >
        {getDisplayValue("tier", memberData)}
      </div>
    </div>
  );
}

function FieldBlock(props: CardTemplateProps) {
  const { concept, memberData, selectedFields, compact } = props;
  const details = getVisibleDetails(
    selectedFields,
    memberData,
    concept.layout.fieldDensity,
    compact,
  );

  if (concept.blueprint.fieldZone === "badges") {
    return (
      <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2"}`}>
        {details.map((detail) => (
          <div
            key={detail.key}
            className={`min-w-0 rounded-md bg-white/20 font-semibold backdrop-blur ${
              compact ? "px-1.5 py-1 text-[8px]" : "px-2 py-1.5 text-[10px]"
            }`}
          >
            <span className="opacity-60">{detail.label}: </span>
            <span>{detail.value}</span>
          </div>
        ))}
      </div>
    );
  }

  if (concept.blueprint.fieldZone === "compact-row") {
    return (
      <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-3"}`}>
        {details.slice(0, compact ? 3 : 5).map((detail) => (
          <div key={detail.key} className="min-w-0">
            <div className="truncate text-[8px] font-bold uppercase opacity-55">
              {detail.label}
            </div>
            <div
              className={`truncate font-semibold ${compact ? "text-[9px]" : "text-xs"}`}
            >
              {detail.value}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DetailGrid
      details={details}
      compact={compact}
      columns={concept.blueprint.fieldZone === "stack" ? 1 : 2}
    />
  );
}

function MediaBlock(props: CardTemplateProps) {
  const { concept, memberData, selectedFields, compact } = props;
  const imageUrl = resolveImage(props);
  const shouldUseArt =
    concept.background.imageRole === "decorativeArt" || selectedFields.decorativeArt;
  const decorativeArtUrl = shouldUseArt ? memberData.decorativeArtUrl : undefined;

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-md border border-white/20 bg-white/15">
      {decorativeArtUrl ? (
        <img
          src={decorativeArtUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : shouldUseArt ? (
        <MotifArt concept={concept} compact={compact} />
      ) : selectedFields.photo ? (
        <div className="grid h-full w-full place-items-center">
          <MemberPhoto
            memberData={memberData}
            shape={concept.layout.photoShape}
            compact={compact}
          />
        </div>
      ) : (
        <MotifArt concept={concept} compact={compact} />
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent, ${concept.colors.background}88)`,
        }}
      />
    </div>
  );
}

function BlueprintContent(props: CardTemplateProps) {
  const { brandProfile, concept, selectedFields, qrValue, compact } = props;
  const showMedia = concept.blueprint.mediaZone !== "none";
  const largeQr = concept.blueprint.qrZone === "large-center";
  const textOnAccent = getReadableTextColor(concept.colors.accent);

  if (concept.blueprint.orientation === "vertical") {
    return (
      <div className="relative z-10 flex h-full min-w-0 flex-col gap-3">
        <LogoBlock
          brandProfile={brandProfile}
          align={concept.blueprint.brandZone === "top-center" ? "center" : "left"}
          compact={compact}
        />
        {showMedia ? (
          <div className={compact ? "h-24" : "h-40"}>
            <MediaBlock {...props} />
          </div>
        ) : null}
        <Panel compact={compact}>
          <IdentityBlock {...props} />
        </Panel>
        <div className="min-h-0 flex-1">
          <FieldBlock {...props} />
        </div>
        {selectedFields.qrCode ? (
          <div className="flex justify-center">
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

  if (concept.blueprint.structure === "split-panel") {
    const mediaFirst = concept.blueprint.mediaZone === "left-panel";
    const media = showMedia ? (
      <Panel compact={compact} subtle>
        <MediaBlock {...props} />
      </Panel>
    ) : null;
    const identity = (
      <div className="relative z-10 flex min-w-0 flex-col justify-between gap-3">
        <LogoBlock brandProfile={brandProfile} compact={compact} />
        <IdentityBlock {...props} />
        <FieldBlock {...props} />
      </div>
    );

    return (
      <div
        className={`relative z-10 grid h-full min-w-0 ${
          compact ? "gap-2" : "gap-4"
        } ${mediaFirst ? "grid-cols-[0.82fr_1fr]" : "grid-cols-[1fr_0.82fr]"}`}
      >
        {mediaFirst ? media : identity}
        {mediaFirst ? identity : media}
        {selectedFields.qrCode ? (
          <div className="absolute bottom-0 right-0">
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

  if (concept.blueprint.structure === "poster") {
    return (
      <div className="relative z-10 grid h-full min-w-0 grid-cols-[1.1fr_0.85fr] gap-3">
        <div className="flex min-w-0 flex-col justify-between gap-3">
          <LogoBlock brandProfile={brandProfile} compact={compact} />
          <IdentityBlock {...props} />
          <FieldBlock {...props} />
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-2">
          <MediaBlock {...props} />
          <div className="flex items-end justify-between gap-2">
            <div
              className={`rounded-md px-2 py-1 font-black uppercase ${
                compact ? "text-[8px]" : "text-[10px]"
              }`}
              style={{ background: concept.colors.accent, color: textOnAccent }}
            >
              {concept.artDirection?.badgeText ?? "Member"}
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

  if (concept.blueprint.structure === "qr-hero") {
    return (
      <div className="relative z-10 grid h-full min-w-0 grid-cols-[1fr_0.55fr] gap-3">
        <div className="flex min-w-0 flex-col justify-between gap-3">
          <LogoBlock brandProfile={brandProfile} compact={compact} />
          <IdentityBlock {...props} />
          <FieldBlock {...props} />
        </div>
        <Panel compact={compact}>
          <div className="flex h-full flex-col items-center justify-center gap-2">
            {selectedFields.qrCode ? (
              <QrBlock
                qrValue={qrValue}
                foreground={concept.colors.text}
                compact={largeQr ? false : compact}
              />
            ) : null}
            <div className="text-center text-[9px] font-bold uppercase opacity-65">
              Verified
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-full min-w-0 flex-col justify-between gap-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <LogoBlock
          brandProfile={brandProfile}
          align={concept.blueprint.brandZone === "top-center" ? "center" : "left"}
          compact={compact}
        />
        {selectedFields.qrCode ? (
          <QrBlock
            qrValue={qrValue}
            foreground={concept.colors.text}
            compact={compact}
          />
        ) : null}
      </div>
      <div className="grid min-w-0 grid-cols-[1fr_auto] items-end gap-3">
        <IdentityBlock {...props} />
        {showMedia ? (
          <div className={compact ? "h-16 w-16" : "h-28 w-28"}>
            <MediaBlock {...props} />
          </div>
        ) : null}
      </div>
      <FieldBlock {...props} />
    </div>
  );
}

export function BlueprintRendererCard(props: CardTemplateProps) {
  const { concept, compact } = props;

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-lg border border-white/25 shadow-sm ${
        compact ? "p-3" : "p-5"
      }`}
      style={{
        color: concept.colors.text,
        borderColor: `${concept.colors.accent}55`,
      }}
    >
      <BackgroundLayer {...props} />
      <BlueprintContent {...props} />
    </div>
  );
}
