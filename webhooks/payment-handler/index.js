/**
 * Payment webhook stub.
 *
 * Expected responsibilities:
 * - verify request signature
 * - normalize provider payload
 * - trigger product delivery email or queue job
 */

const PRODUCTS = {
  "mvp-automation-kit": {
    id: "mvp-automation-kit",
    name: "MVP Automation Kit",
    downloadUrl: "https://example.com/downloads/mvp-automation-kit.zip",
  },
};

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const event = normalizeBody(req.body);

  // TODO: verify provider signature.
  const productId = event.product_id;
  const buyerEmail = event.buyer_email;

  if (!productId || !buyerEmail) {
    return json(res, 400, {
      error: "Missing required fields",
      required: ["product_id", "buyer_email"],
    });
  }

  const product = PRODUCTS[productId];
  if (!product) {
    return json(res, 404, {
      error: "Unknown product_id",
      product_id: productId,
    });
  }

  // TODO: handoff to transactional email provider and fulfillment logging.
  return json(res, 200, {
    message: "Delivery queued",
    recipient: buyerEmail,
    product: product.name,
    download_url: product.downloadUrl,
    status: "stubbed",
  });
};
