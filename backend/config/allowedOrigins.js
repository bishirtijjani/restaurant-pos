const allowedOrigins = [
  "https://",
  "https://app.",
  process.env.FRONTEND_URL,
  "http://localhost:4173",
].filter(Boolean);

module.exports = allowedOrigins;
