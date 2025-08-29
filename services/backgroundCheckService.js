const Checkr = require("checkr");
const Credential = require("../models/Credential");
const createError = require("http-errors");

const checkr = new Checkr(process.env.CHECKR_API_KEY);

const initiateBackgroundCheck = async (userId, candidateData) => {
  try {
    const candidate = await checkr.Candidate.create({
      first_name: candidateData.firstName,
      last_name: candidateData.lastName,
      email: candidateData.email,
      ssn: candidateData.ssnLast4 + "XXXX",
      driver_license_number: candidateData.driverLicense,
      driver_license_state: candidateData.driverState,
    });

    const report = await checkr.Report.create({
      package: "driver_pro",
      candidate_id: candidate.id,
    });

    await Credential.create({
      owner: userId,
      type: "background_check",
      verificationStatus: report.status,
      documentUrl: report.download_url,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      metadata: {
        checkrCandidateId: candidate.id,
        checkrReportId: report.id,
      },
    });

    return report;
  } catch (err) {
    throw createError(400, "Background check failed", {
      isOperational: true,
      originalError: err.response?.data || err.message,
    });
  }
};

module.exports = { initiateBackgroundCheck };
