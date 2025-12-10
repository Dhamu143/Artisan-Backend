// const User = require("../models/userModel");
// const data = require("../data.json");

// const getFullDashboardData = async (req, res) => {
//   try {
//     // 1. Total Users
//     const totalUsers = await User.countDocuments();

//     // 2. Profession Count (from JSON file)
//     let professionCount = 0;

//     data.Categories.forEach((category) => {
//       if (category.Subcategories?.length) {
//         category.Subcategories.forEach((sub) => {
//           if (sub.Professions?.length) {
//             professionCount += sub.Professions.length;
//           }
//         });
//       } else if (category.Professions?.length) {
//         professionCount += category.Professions.length;
//       }
//     });

//     // 3. User Count Grouped by Category
//     const usersByCategory = await User.aggregate([
//       {
//         $match: { categoryId: { $exists: true, $ne: null } },
//       },
//       {
//         $group: {
//           _id: "$categoryId",
//           userCount: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           categoryId: "$_id",
//           userCount: 1,
//         },
//       },
//     ]);

//     // FULL DASHBOARD RESPONSE
//     return res.status(200).json({
//       issuccess: true,
//       data: {
//         userCount: totalUsers,
//         professionCount,
//         usersByCategory,
//       },
//     });

//   } catch (error) {
//     console.error("Dashboard error:", error);
//     return res.status(500).json({
//       issuccess: false,
//       error: "Internal Server Error",
//     });
//   }
// };

// module.exports = { getFullDashboardData };
const User = require("../models/userModel");
const data = require("../data.json");

const getFullDashboardData = async (req, res) => {
  try {
    // 1. Total Users
    const totalUsers = await User.countDocuments();

    // 2. Profession Count
    let professionCount = 0;

    data.Categories.forEach((category) => {
      if (category.Subcategories?.length) {
        category.Subcategories.forEach((sub) => {
          if (sub.Professions?.length) {
            professionCount += sub.Professions.length;
          }
        });
      } else if (category.Professions?.length) {
        professionCount += category.Professions.length;
      }
    });

    // 3. USER COUNT GROUPED BY CATEGORY
    const usersByCategoryRaw = await User.aggregate([
      {
        $match: { categoryId: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$categoryId",
          userCount: { $sum: 1 },
        },
      },
    ]);

    // 4. MERGE CATEGORY NAME + ID
    const usersByCategory = usersByCategoryRaw.map((entry) => {
      const category = data.Categories.find((cat) => cat.id === entry._id);

      return {
        categoryId: entry._id,
        categoryName: category ? category.Category_Name : null,
        userCount: entry.userCount,
      };
    });

    // FINAL RESPONSE
    return res.status(200).json({
      issuccess: true,
      data: {
        userCount: totalUsers,
        professionCount,
        usersByCategory,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      issuccess: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = { getFullDashboardData };
