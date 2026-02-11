const allowedOrigins = [
  "https://restaurant.codeket.com",
  "https://app.restaurant.codeket.com",
  process.env.FRONTEND_URL,
  "http://localhost:4173",
].filter(Boolean);

module.exports = allowedOrigins;
