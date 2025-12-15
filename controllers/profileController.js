const ProfileView = require("../models/profileViewModel");
const mongoose = require("mongoose");

// exports.trackProfileView = async (req, res) => {
//   try {
//     const { profileUserId } = req.params;
//     const viewerUserId = req.user._id;

//     console.log("[PROFILE VIEW] Request", {
//       profileUserId,
//       viewerUserId,
//     });

//     // ✅ Prevent self-view (FIXED)
//     if (profileUserId === viewerUserId) {
//       console.log("[PROFILE VIEW] Self view blocked");
//       return res.status(200).json({ viewed: false });
//     }

//     const result = await ProfileView.updateOne(
//       {
//         profileUserId: new mongoose.Types.ObjectId(profileUserId),
//         viewerUserId: new mongoose.Types.ObjectId(viewerUserId),
//       },
//       {
//         $setOnInsert: {
//           profileUserId,
//           viewerUserId,
//           viewedAt: new Date(),
//         },
//       },
//       { upsert: true }
//     );

//     if (result.upsertedCount > 0) {
//       console.log("[PROFILE VIEW] New view added");
//       return res.status(200).json({ viewed: true, issuccess: true });
//     }

//     console.log("[PROFILE VIEW] Already viewed");
//     return res.status(200).json({ viewed: false, issuccess: false });
//   } catch (error) {
//     if (error.code === 11000) {
//       console.log("[PROFILE VIEW] Duplicate blocked");
//       return res.status(200).json({ viewed: false, issuccess: true });
//     }

//     console.error("[PROFILE VIEW] Error:", error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

exports.trackProfileView = async (req, res) => {
  try {
    const { profileUserId } = req.params;
    const viewerUserId = req.user._id;

    console.log("[PROFILE VIEW] Request", {
      profileUserId,
      viewerUserId,
    });

    // ❌ Safety check
    if (!viewerUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Prevent self-view (CORRECT)
    if (profileUserId.toString() === viewerUserId.toString()) {
      console.log("[PROFILE VIEW] Self view blocked");
      return res.status(200).json({ viewed: false, issuccess: true });
    }

    const result = await ProfileView.updateOne(
      {
        profileUserId: new mongoose.Types.ObjectId(profileUserId),
        viewerUserId: new mongoose.Types.ObjectId(viewerUserId),
      },
      {
        $setOnInsert: {
          profileUserId,
          viewerUserId,
          viewedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log("[PROFILE VIEW] New view added");
      return res.status(200).json({ viewed: true, issuccess: true });
    }

    console.log("[PROFILE VIEW] Already viewed");
    return res.status(200).json({ viewed: false, issuccess: true });
  } catch (error) {
    console.error("[PROFILE VIEW] Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getProfileViewCount = async (req, res) => {
  try {
    const { profileUserId } = req.params;

    const count = await ProfileView.countDocuments({
      profileUserId,
    });

    return res.status(200).json({
      profileUserId,
      issuccess: true,
      totalViews: count,
    });
  } catch (error) {
    console.error("[PROFILE VIEW COUNT] Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
exports.getProfileViewers = async (req, res) => {
  try {
    const { profileUserId } = req.params;

    const viewers = await ProfileView.find({ profileUserId })
      .populate("viewerUserId", "name businessName avatar")
      .sort({ viewedAt: -1 });

    return res.status(200).json({
      issuccess: true,
      profileUserId,
      totalViewers: viewers.length,
      viewers: viewers.map((v) => ({
        viewerId: v.viewerUserId?._id,
        name: v.viewerUserId?.name,
        businessName: v.viewerUserId?.businessName,
        avatar: v.viewerUserId?.avatar,
        viewedAt: v.viewedAt,
      })),
    });
  } catch (error) {
    console.error("[PROFILE VIEWERS] Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
