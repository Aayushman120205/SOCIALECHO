const Log = require("../models/log.model");
const dayjs = require("dayjs");
const formatCreatedAt = require("../utils/timeConverter");
const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminToken = require("../models/token.admin.model");
const Config = require("../models/config.model");
const Community = require("../models/community.model");
const User = require("../models/user.model");

/**
 * @route GET /admin/logs
 */
const retrieveLogInfo = async (req, res) => {
  try {
    // Only sign in logs contain encrypted context data & email
    const [signInLogs, generalLogs] = await Promise.all([
      Log.find({ type: "sign in" }).sort({ createdAt: -1 }).limit(50),

      Log.find({ type: { $ne: "sign in" } })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    const formattedSignInLogs = [];
    for (let i = 0; i < signInLogs.length; i++) {
      const { _id, email, context, message, type, level, timestamp } =
        signInLogs[i];
      const contextData = context ? context.split(",") : [];
      const formattedContext = {};

      for (let j = 0; j < contextData.length; j++) {
        const [key, value] = contextData[j].split(":");
        if (key === "IP") {
          formattedContext["IP Address"] = contextData[j]
            .split(":")
            .slice(1)
            .join(":");
        } else {
          formattedContext[key.trim()] = value.trim();
        }
      }

      formattedSignInLogs.push({
        _id,
        email,
        contextData: formattedContext,
        message,
        type,
        level,
        timestamp,
      });
    }
    const formattedGeneralLogs = generalLogs.map((log) => ({
      _id: log._id,
      email: log.email,
      message: log.message,
      type: log.type,
      level: log.level,
      timestamp: log.timestamp,
    }));

    const formattedLogs = [...formattedSignInLogs, ...formattedGeneralLogs]
      .map((log) => ({
        ...log,
        formattedTimestamp: formatCreatedAt(log.timestamp),
        relativeTimestamp: dayjs(log.timestamp).fromNow(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("Error retrieving logs:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * @route DELETE /admin/logs
 */
const deleteLogInfo = async (req, res) => {
  try {
    await Log.deleteMany({});
    res.status(200).json({ message: "All logs deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

/**
 * @route POST /admin/signin
 */
const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await Admin.findOne({
      username,
    });
    if (!existingUser) {
      return res.status(404).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const payload = {
      id: existingUser._id,
      username: existingUser.username,
    };

    const accessToken = jwt.sign(payload, process.env.SECRET, {
      expiresIn: "6h",
    });

    const newAdminToken = new AdminToken({
      user: existingUser._id,
      accessToken,
    });

    await newAdminToken.save();

    res.status(200).json({
      accessToken,
      accessTokenUpdatedAt: new Date().toLocaleString(),
      user: {
        _id: existingUser._id,
        username: existingUser.username,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/**
 * @route GET /admin/preferences
 */
const retrieveServicePreference = async (req, res) => {
  try {
    const config = await Config.findOne({});

    if (!config) {
      const newConfig = new Config();
      await newConfig.save();
      return res.status(200).json(newConfig);
    }

    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving system preferences" });
  }
};

/**
 * @route PUT /admin/preferences
 */
const updateServicePreference = async (req, res) => {
  try {
    const {
      usePerspectiveAPI,
      categoryFilteringServiceProvider,
      categoryFilteringRequestTimeout,
    } = req.body;

    const config = await Config.findOneAndUpdate(
      {},
      {
        usePerspectiveAPI,
        categoryFilteringServiceProvider,
        categoryFilteringRequestTimeout,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error updating system preferences" });
  }
};

const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({}).select("_id name banner");
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving communities" });
  }
};

const getCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId)
      .select("_id name description banner moderators members")
      .populate("moderators", "_id name")
      .lean();

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const moderatorCount = community.moderators.length;
    const memberCount = community.members.length;
    const formattedCommunity = {
      ...community,
      memberCount,
      moderatorCount,
    };
    res.status(200).json(formattedCommunity);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving community" });
  }
};

const getModerators = async (req, res) => {
  try {
    const moderators = await User.find({ role: "moderator" }).select(
      "_id name email avatar"
    );
    if (moderators.length === 0) {
      console.warn("No moderators found. Create users with @mod.socialecho.com email to register as moderators.");
    }
    res.status(200).json(moderators);
  } catch (error) {
    console.error("Error retrieving moderators:", error);
    res.status(500).json({ message: "Error retrieving moderators" });
  }
};
const addModerator = async (req, res) => {
  try {
    const { communityId, moderatorId } = req.query;
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    const existingModerator = community.moderators.find(
      (mod) => mod.toString() === moderatorId
    );
    if (existingModerator) {
      return res.status(400).json({ message: "Already a moderator" });
    }
    community.moderators.push(moderatorId);
    community.members.push(moderatorId);
    await community.save();
    res.status(200).json({ message: "Moderator added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding moderator" });
  }
};

const removeModerator = async (req, res) => {
  try {
    const { communityId, moderatorId } = req.query;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    const existingModerator = community.moderators.find(
      (mod) => mod.toString() === moderatorId
    );
    if (!existingModerator) {
      return res.status(400).json({ message: "Not a moderator" });
    }
    community.moderators = community.moderators.filter(
      (mod) => mod.toString() !== moderatorId
    );
    community.members = community.members.filter(
      (mod) => mod.toString() !== moderatorId
    );

    await community.save();
    res.status(200).json({ message: "Moderator removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing moderator" });
  }
};

const testAPIs = async (req, res) => {
  const testContent = "This is a test post about programming and technology";
  const results = {
    perspectiveAPI: { status: "untested", message: "" },
    textRazorAPI: { status: "untested", message: "" },
    classifierAPI: { status: "untested", message: "" },
  };

  try {
    const { google } = require("googleapis");
    const PERSPECTIVE_KEY = process.env.PERSPECTIVE_API_KEY;
    const PERSPECTIVE_URL = process.env.PERSPECTIVE_API_DISCOVERY_URL;

    if (PERSPECTIVE_KEY && PERSPECTIVE_URL) {
      try {
        const client = await google.discoverAPI(PERSPECTIVE_URL);
        const analyzeRequest = {
          comment: { text: testContent },
          requestedAttributes: { TOXICITY: {} },
        };
        const response = await client.comments.analyze({
          key: PERSPECTIVE_KEY,
          resource: analyzeRequest,
        });
        results.perspectiveAPI = {
          status: "working",
          message: `Score: ${response.data.attributeScores.TOXICITY.summaryScore.value}`,
        };
      } catch (error) {
        results.perspectiveAPI = {
          status: "failed",
          message: error.message,
        };
      }
    } else {
      results.perspectiveAPI = {
        status: "not-configured",
        message: "Missing API key or discovery URL",
      };
    }

    const axios = require("axios");
    const TEXTRAZOR_KEY = process.env.TEXTRAZOR_API_KEY;
    const TEXTRAZOR_URL = process.env.TEXTRAZOR_API_URL;

    if (TEXTRAZOR_KEY && TEXTRAZOR_URL) {
      try {
        const response = await axios.post(
          TEXTRAZOR_URL,
          {
            text: testContent,
            classifiers: "community",
            cleanup: { mode: "stripTags" },
          },
          {
            headers: {
              "X-TextRazor-Key": TEXTRAZOR_KEY,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 5000,
          }
        );
        results.textRazorAPI = {
          status: "working",
          message: `Categories: ${response.data.response.categories?.map((c) => c.label).join(", ") || "none"}`,
        };
      } catch (error) {
        results.textRazorAPI = {
          status: "failed",
          message: error.message,
        };
      }
    } else {
      results.textRazorAPI = {
        status: "not-configured",
        message: "Missing API key or URL",
      };
    }

    const CLASSIFIER_URL = process.env.CLASSIFIER_API_URL;

    if (CLASSIFIER_URL) {
      try {
        const response = await axios.post(
          CLASSIFIER_URL,
          { text: testContent },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
          }
        );
        results.classifierAPI = {
          status: "working",
          message: `Categories: ${response.data.response.categories?.map((c) => c.label).join(", ") || "none"}`,
        };
      } catch (error) {
        results.classifierAPI = {
          status: "failed",
          message: error.message,
        };
      }
    } else {
      results.classifierAPI = {
        status: "not-configured",
        message: "Missing API URL",
      };
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error testing APIs:", error);
    res.status(500).json({ message: "Error testing APIs", error: error.message });
  }
};

module.exports = {
  retrieveServicePreference,
  updateServicePreference,
  retrieveLogInfo,
  deleteLogInfo,
  signin,
  getCommunities,
  getCommunity,
  addModerator,
  removeModerator,
  getModerators,
  testAPIs,
};
