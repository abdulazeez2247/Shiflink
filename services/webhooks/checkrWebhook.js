const crypto = require("crypto");
const Credential = require("../../models/Credential");
const Notification = require("../../models/Notification");
const createError = require("http-errors");

const _verifySignature = (signature, body) => {
  const hmac = crypto.createHmac("sha256", process.env.CHECKR_WEBHOOK_SECRET);
  const digest = hmac.update(JSON.stringify(body)).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

const handleCheckrWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-checkr-signature"];
    if (!_verifySignature(signature, req.body)) {
      throw createError(403, "Invalid webhook signature");
    }

    const { event, data } = req.body;

    switch (event) {
      case "report.completed":
        await _handleReportCompletion(data);
        break;

      case "candidate.created":
        break;

      default:
        console.warn(`Unhandled Checkr event: ${event}`);
    }

    res.status(200).send("Webhook processed");
  } catch (err) {
    next(err);
  }
};

const _handleReportCompletion = async (report) => {
  const credential = await Credential.findOneAndUpdate(
    { "metadata.checkrReportId": report.id },
    {
      verificationStatus: report.status,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      "metadata.statusCheck": new Date(),
    },
    { new: true }
  ).populate("owner");

  if (!credential) {
    throw createError(404, "Credential record not found");
  }

  if (credential.owner) {
    await Notification.create({
      user: credential.owner._id,
      type: "background_check_completed",
      message: `Your background check is ${report.status.toUpperCase()}`,
      metadata: {
        reportId: report.id,
        status: report.status,
        downloadUrl: report.download_url,
      },
    });
  }
};

module.exports = { handleCheckrWebhook };
