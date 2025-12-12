const { saveLogInfo } = require("../middlewares/logger/logInfo");
const createCategoryFilterService = require("./categoryFilterService");
const Config = require("../models/config.model");
const Community = require("../models/community.model");

/**
 * @param next - confirmPost (/middlewares/post/confirmPost.js)
 */
const processPost = async (req, res, next) => {
  const { content, communityId } = req.body;

  if (!communityId || !content) {
    return res.status(400).json({ message: "Missing required fields: communityId and content" });
  }

  const { serviceProvider, timeout } = await getSystemPreferences();

  try {
    if (serviceProvider === "disabled") {
      req.failedDetection = false;
      return next();
    }

    const categoryFilterService = createCategoryFilterService(serviceProvider);

    const categories = await categoryFilterService.getCategories(
      content,
      timeout
    );

    if (Object.keys(categories).length > 0) {
      const recommendedCommunity = Object.keys(categories)[0];

      const community = await Community.findById(communityId);
      const communityName = community ? community.name : null;

      if (!communityName) {
        console.error(`Community not found for ID: ${communityId}`);
        return res.status(404).json({ message: "Community not found" });
      }

      if (recommendedCommunity !== communityName) {
        const type = "categoryMismatch";
        const info = {
          community: communityName,
          recommendedCommunity,
        };

        return res.status(403).json({ type, info });
      } else {
        req.failedDetection = false;
        next();
      }
    } else {
      req.failedDetection = true;
      next();
    }
  } catch (error) {
    console.error("Error in processPost:", error);
    const errorMessage = `Error processing post: ${error.message}`;
    await saveLogInfo(null, errorMessage, serviceProvider, "error");
    return res.status(500).json({ message: "Error processing post", error: error.message });
  }
};

const getSystemPreferences = async () => {
  try {
    const config = await Config.findOne({}, { _id: 0, __v: 0 });

    if (!config) {
      return {
        serviceProvider: "disabled",
        timeout: 10000,
      };
    }

    const {
      categoryFilteringServiceProvider: serviceProvider = "disabled",
      categoryFilteringRequestTimeout: timeout = 10000,
    } = config;

    return {
      serviceProvider,
      timeout,
    };
  } catch (error) {
    return {
      serviceProvider: "disabled",
      timeout: 10000,
    };
  }
};

module.exports = processPost;
