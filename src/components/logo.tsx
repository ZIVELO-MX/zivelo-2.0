import Image from "next/image";

const FULL = { width: 346, height: 120 };
const COMPACT = { width: 163, height: 119 };

export function Logo({ compact = false, footer = false }: { compact?: boolean; footer?: boolean }) {
  const size = compact ? COMPACT : FULL;

  if (footer) {
    return (
      <Image
        className="brand__logo brand__logo--footer"
        src="/assets/logo-white-full.svg"
        alt="ZIVELO"
        {...FULL}
        priority
      />
    );
  }

  return (
    <>
      <Image
        className="brand__logo brand__logo--on-light"
        src={`/assets/logo-dark-${compact ? "compact" : "full"}.svg`}
        alt="ZIVELO"
        {...size}
      />
      <Image
        className="brand__logo brand__logo--on-dark"
        src={`/assets/logo-white-${compact ? "compact" : "full"}.svg`}
        alt="ZIVELO"
        {...size}
      />
    </>
  );
}
