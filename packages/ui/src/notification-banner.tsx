import type { ReactNode } from "react";
import { PixelSprite } from "./pixel-sprite";

type NotificationTone = "neutral" | "positive" | "warn" | "danger" | "magic";

const toneStyles: Record<NotificationTone, string> = {
  neutral: "border-[var(--stroke-default)] bg-[var(--surface-neutral-strong)]",
  positive: "border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.08)]",
  warn: "border-[rgba(232,163,61,0.35)] bg-[rgba(232,163,61,0.08)]",
  danger: "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)]",
  magic: "border-[rgba(192,132,252,0.35)] bg-[rgba(192,132,252,0.08)]",
};

type SeededBannerProps = {
  avatarSeed: string;
  eyebrow?: string;
  title: string;
  body: string;
  meta?: string;
  tone?: NotificationTone;
  glow?: boolean;
  aside?: ReactNode;
};

type InlineBannerProps = {
  avatar: ReactNode;
  eyebrow?: string;
  title: string;
  body: string;
  meta?: string;
  tone?: NotificationTone;
  glow?: boolean;
  action?: ReactNode;
};

type NotificationBannerProps = SeededBannerProps | InlineBannerProps;

function isSeededBanner(props: NotificationBannerProps): props is SeededBannerProps {
  return "avatarSeed" in props;
}

export function NotificationBanner(props: NotificationBannerProps) {
  const tone = props.tone ?? "neutral";
  const glow = props.glow ?? false;

  if (isSeededBanner(props)) {
    const { avatarSeed, eyebrow, title, body, meta, aside } = props;

    return (
      <article className="notification-banner" data-glow={glow} data-tone={tone}>
        <PixelSprite decorative label="" seed={avatarSeed} size={52} />
        <div className="notification-banner__copy">
          {eyebrow ? <div className="notification-banner__eyebrow">{eyebrow}</div> : null}
          <h3 className="notification-banner__title">{title}</h3>
          <p className="notification-banner__body">{body}</p>
          {meta ? <p className="notification-banner__meta">{meta}</p> : null}
        </div>
        {aside ? <div className="notification-banner__aside">{aside}</div> : null}
      </article>
    );
  }

  const { avatar, eyebrow, title, body, meta, action } = props;

  return (
    <div
      className={`rounded-[var(--radius-banner)] border p-4 ${toneStyles[tone]} ${
        glow ? "shadow-[var(--shadow-glow)]" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-elevated)] text-sm font-semibold text-[var(--accent-amber)]">
          {avatar}
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
              {eyebrow}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
            {meta ? (
              <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
                {meta}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
