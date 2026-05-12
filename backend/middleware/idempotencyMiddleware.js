const crypto = require("crypto");
const IdempotencyKey = require("../models/IdempotencyKey");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function hashBody(body) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(body ?? {}))
    .digest("hex");
}

function resolveScopeId(req) {
  return (
    req.storeId ||
    req.headers["x-store-id"] ||
    (req.user && req.user.id) ||
    null
  );
}

const idempotencyMiddleware = async (req, res, next) => {
  const key = req.headers["idempotency-key"];

  if (!key) return next();

  if (!UUID_REGEX.test(key)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Idempotency-Key format (expected UUID)",
    });
  }

  const scopeId = resolveScopeId(req);
  if (!scopeId) {
    return res.status(400).json({
      success: false,
      message:
        "Idempotency-Key requires store context (x-store-id) or authenticated user",
    });
  }

  const requestHash = hashBody(req.body);
  const userId = req.user && req.user.id ? req.user.id : undefined;

  let record;
  try {
    record = await IdempotencyKey.create({
      key,
      scopeId: String(scopeId),
      userId,
      method: req.method,
      path: req.originalUrl,
      requestHash,
      status: "pending",
    });
  } catch (err) {
    if (err && err.code === 11000) {
      const existing = await IdempotencyKey.findOne({
        key,
        scopeId: String(scopeId),
      }).lean();

      if (!existing) {
        return res.status(503).json({
          success: false,
          message: "Idempotency key contention; please retry",
        });
      }

      if (existing.requestHash !== requestHash) {
        return res.status(409).json({
          success: false,
          message: "Idempotency-Key reuse with mismatched request body",
        });
      }

      if (existing.status === "pending") {
        return res.status(409).json({
          success: false,
          message:
            "Idempotency-Key request still processing; retry in a moment",
        });
      }

      return res
        .status(existing.statusCode || 200)
        .json(existing.responseBody);
    }

    console.error("Idempotency middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Idempotency check failed",
    });
  }

  let capturedStatus = 200;
  const originalStatus = res.status.bind(res);
  const originalJson = res.json.bind(res);

  res.status = function (code) {
    capturedStatus = code;
    return originalStatus(code);
  };

  res.json = function (body) {
    if (capturedStatus < 400) {
      IdempotencyKey.updateOne(
        { _id: record._id },
        {
          $set: {
            status: "completed",
            statusCode: capturedStatus,
            responseBody: body,
          },
        }
      ).catch((err) =>
        console.error("Idempotency persistence error:", err.message)
      );
    } else {
      IdempotencyKey.deleteOne({ _id: record._id }).catch((err) =>
        console.error("Idempotency cleanup error:", err.message)
      );
    }
    return originalJson(body);
  };

  next();
};

module.exports = idempotencyMiddleware;
