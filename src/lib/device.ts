/** Lightweight client hints used for the login history record. */
export function getDeviceInfo() {
  if (typeof navigator === "undefined") {
    return { device: "unknown", browser: "unknown", platform: "unknown" };
  }
  const ua = navigator.userAgent;
  const device = /iPad|Tablet/i.test(ua)
    ? "tablet"
    : /Mobi|Android|iPhone/i.test(ua)
      ? "mobile"
      : "desktop";

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : /Firefox\//.test(ua)
            ? "Firefox"
            : "Other";

  const platform =
    /Windows/i.test(ua) ? "Windows"
    : /Mac OS/i.test(ua) ? "macOS"
    : /Android/i.test(ua) ? "Android"
    : /iPhone|iPad|iPod/i.test(ua) ? "iOS"
    : /Linux/i.test(ua) ? "Linux"
    : "Other";

  return { device, browser, platform: platform.slice(0, 120) };
}
