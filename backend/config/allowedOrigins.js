const allowedOrigins = [
  "https://restaurant.codeket.com",
  "https://app.restaurant.codeket.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

module.exports = allowedOrigins;
