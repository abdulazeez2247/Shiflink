const Admin = require("../models/Admin");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const createError = require("http-errors");

const _validateAdmin = async (adminId, requiredPermission) => {
  const admin = await Admin.findById(adminId).select("permissions");
  if (!admin || !admin.permissions.includes(requiredPermission)) {
    throw createError(403, "Missing required admin permissions", {
      requiredPermission,
      actualPermissions: admin?.permissions,
    });
  }
  return admin;
};

const suspendUser = async (adminId, userId, reason) => {
  await _validateAdmin(adminId, "suspend_users");

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isSuspended: true,
      suspensionReason: reason,
      suspendedBy: adminId,
    },
    { new: true }
  ).select("-password");

  if (!user) throw createError(404, "User not found");

  await AuditLog.create({
    user: adminId,
    role: "admin",
    action: `Suspended user ${userId}`,
    targetModel: "User",
    targetId: userId,
    metadata: { reason, permissionsUsed: ["suspend_users"] },
  });

  return user;
};

const overrideCompliance = async (adminId, userId) => {
  await _validateAdmin(adminId, "override_compliance");

  const user = await User.findByIdAndUpdate(
    userId,
    { "complianceStatus.override": true },
    { new: true }
  );

  await AuditLog.create({
    user: adminId,
    role: "admin",
    action: `Overrode compliance for ${userId}`,
    targetModel: "User",
    targetId: userId,
  });

  return user;
};

const listUsers = async (adminId, page = 1, limit = 20) => {
  await _validateAdmin(adminId, "view_all");

  return User.paginate(
    {},
    {
      page,
      limit,
      select: "-password -__v",
      sort: { createdAt: -1 },
    }
  );
};

module.exports = {
  suspendUser,
  overrideCompliance,
  listUsers,
};
