const Community = require("../../models/community.model");
const Report = require("../../models/report.model");
const User = require("../../models/user.model");

const requireCommunityModerator = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser = await User.findById(userId).select("role").lean();

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isPrivilegedUser =
      currentUser.role === "moderator" || currentUser.role === "admin";

    if (isPrivilegedUser && !req.params.name && !req.params.communityId && !req.params.postId) {
      return next();
    }

    let communityId =
      req.params.communityId ||
      req.query.communityId ||
      req.body?.communityId ||
      req.body?.info?.communityId;
    const communityName =
      req.params.name ||
      req.params.communityName ||
      req.query.communityName ||
      req.body?.communityName ||
      req.body?.name;

    if (!communityId && req.params.postId) {
      const report = await Report.findOne({ post: req.params.postId })
        .select("community")
        .lean();

      if (report) {
        communityId = report.community;
      }
    }

    let community = null;

    if (communityId) {
      community = await Community.findById(communityId)
        .select("moderators")
        .lean();
    } else if (communityName) {
      community = await Community.findOne({ name: communityName })
        .select("moderators")
        .lean();
    }

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isCommunityModerator = community.moderators?.some(
      (moderatorId) => moderatorId.toString() === userId
    );

    if (isPrivilegedUser || isCommunityModerator) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = requireCommunityModerator;
