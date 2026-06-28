// tokens.js
// CashCow Buttercream design tokens (from the claude.ai design handoff).
// Reusable color/radius/shadow/font values so screens stay consistent as we
// migrate them from the dark Tailwind theme to this warm cream look.

export const colors = {
  // surfaces
  appBg: "#EBE3D2", // app outer background
  bg: "#FBF6EC", // main cream background
  card: "#FFFFFF",
  border: "#F0E9DA",
  divider: "#F5EFE2",

  // brand
  green: "#1FB573", // primary
  greenHover: "#1AA266",
  greenDark: "#1A9D63", // emphasis green text
  greenSoft: "#E4F6EC", // pale green background
  butter: "#FFCB45", // accent
  coral: "#FF7A59", // expense / warning

  // text
  ink: "#2A2520", // body (near black)
  muted: "#A89D8C", // secondary text
  sub: "#8A8073", // inactive

  // chart palette
  cat: ["#FF7A59", "#FFCB45", "#1FB573", "#6B8AFF", "#D9CFBE", "#34C7A0", "#B08CFF"],
  barIdle: "#C9EED9",
  barTrackCream: "#FBE6D8",
};

export const radius = { sm: 8, md: 13, lg: 18, xl: 20, "2xl": 24, full: 999 };

export const shadow = {
  app: "0 26px 80px rgba(70,55,25,.20)",
  card: "0 8px 20px rgba(31,181,115,.30)", // green button glow
};

export const font = {
  family: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
};
