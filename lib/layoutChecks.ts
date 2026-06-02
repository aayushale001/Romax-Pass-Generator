import type { LayoutIssue } from "@/types/card";

const checkedRoles = [
  "business-name",
  "logo",
  "member-name",
  "member-id",
  "tier",
  "field-grid",
  "qr-code",
  "member-photo",
  "decorative-art",
  "background-image",
];

function roundedRect(rect: DOMRect, rootRect: DOMRect) {
  return {
    x: Math.round(rect.left - rootRect.left),
    y: Math.round(rect.top - rootRect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}

function rectArea(rect: DOMRect) {
  return Math.max(0, rect.width) * Math.max(0, rect.height);
}

function intersectionArea(a: DOMRect, b: DOMRect) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function elementRole(element: Element) {
  return element.getAttribute("data-role") ?? element.className?.toString() ?? "element";
}

function isVisibleElement(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity || "1") > 0.03
  );
}

export function runCardLayoutChecks(container: HTMLElement): LayoutIssue[] {
  const issues: LayoutIssue[] = [];
  const card =
    (container.querySelector('[data-role="card-root"]') as HTMLElement | null) ??
    (container.querySelector(".gcd-render-surface > *") as HTMLElement | null) ??
    container;
  const cardRect = card.getBoundingClientRect();

  if (cardRect.width <= 0 || cardRect.height <= 0) {
    return [
      {
        role: "card-root",
        severity: "error",
        message: "Card root has no measurable size.",
      },
    ];
  }

  if (
    card.scrollWidth > card.clientWidth + 2 ||
    card.scrollHeight > card.clientHeight + 2
  ) {
    issues.push({
      role: "card-root",
      severity: "warning",
      message: "Card root has scroll overflow.",
      bounds: roundedRect(cardRect, cardRect),
    });
  }

  const roleElements = checkedRoles.flatMap((role) =>
    Array.from(card.querySelectorAll(`[data-role="${role}"]`)) as HTMLElement[],
  );

  for (const element of roleElements) {
    const role = elementRole(element);
    const rect = element.getBoundingClientRect();

    if (!isVisibleElement(element)) {
      if (role !== "decorative-art" && role !== "background-image") {
        issues.push({
          role,
          severity: "warning",
          message: "Important element is hidden.",
          bounds: roundedRect(rect, cardRect),
        });
      }
      continue;
    }

    if (rect.width <= 1 || rect.height <= 1) {
      if (role !== "decorative-art" && role !== "background-image") {
        issues.push({
          role,
          severity: "error",
          message: "Important element has near-zero size.",
          bounds: roundedRect(rect, cardRect),
        });
      }
      continue;
    }

    const outside =
      rect.left < cardRect.left - 1 ||
      rect.top < cardRect.top - 1 ||
      rect.right > cardRect.right + 1 ||
      rect.bottom > cardRect.bottom + 1;

    if (outside && role !== "background-image") {
      issues.push({
        role,
        severity: "error",
        message: "Important element extends outside the card bounds.",
        bounds: roundedRect(rect, cardRect),
      });
    }

    if (
      element.scrollWidth > element.clientWidth + 2 ||
      element.scrollHeight > element.clientHeight + 2
    ) {
      issues.push({
        role,
        severity: role === "member-name" || role === "business-name" ? "error" : "warning",
        message: "Element content overflows its own box.",
        bounds: roundedRect(rect, cardRect),
      });
    }
  }

  const qr = card.querySelector('[data-role="qr-code"]') as HTMLElement | null;
  if (!qr) {
    issues.push({
      role: "qr-code",
      severity: "error",
      message: "QR code role is missing.",
    });
  } else {
    const qrRect = qr.getBoundingClientRect();
    if (qrRect.width < 44 || qrRect.height < 44) {
      issues.push({
        role: "qr-code",
        severity: "error",
        message: "QR code is too small to scan reliably.",
        bounds: roundedRect(qrRect, cardRect),
      });
    }

    for (const element of roleElements) {
      if (element === qr || element.contains(qr) || qr.contains(element)) {
        continue;
      }

      const role = elementRole(element);
      if (role === "background-image" || role === "decorative-art") {
        continue;
      }

      const rect = element.getBoundingClientRect();
      const overlap = intersectionArea(qrRect, rect);
      const smallerArea = Math.min(rectArea(qrRect), rectArea(rect));

      if (smallerArea > 0 && overlap / smallerArea > 0.08) {
        issues.push({
          role: "qr-code",
          severity: "error",
          message: `QR code overlaps ${role}.`,
          bounds: roundedRect(qrRect, cardRect),
        });
        break;
      }
    }
  }

  return issues.slice(0, 80);
}
