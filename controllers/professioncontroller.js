const data = require("../data.json");
const User = require("../models/userModel");

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function findProfessionById(id) {
  for (const category of data.Categories) {
    if (category.Subcategories) {
      for (const subcategory of category.Subcategories) {
        const prof = subcategory.Professions.find((p) => p.id === id);
        if (prof) return { prof, subcategory, category };
      }
    } else if (category.Professions) {
      const prof = category.Professions.find((p) => p.id === id);
      if (prof) return { prof, subcategory: null, category };
    }
  }
  return null;
}

function findSubcategory(categoryId, subcategoryName) {
  const targetCategory = data.Categories.find((c) => c.id === categoryId);

  if (targetCategory && targetCategory.Subcategories) {
    return targetCategory.Subcategories.find(
      (s) => s.Subcategory_Name === subcategoryName
    );
  }
  return null;
}

function generateId() {
  let count = 100;

  data.Categories.forEach((category) => {
    const professionLists = category.Subcategories
      ? category.Subcategories.flatMap((sub) => sub.Professions)
      : category.Professions || [];

    professionLists.forEach((prof) => {
      const num = parseInt(prof.id.substring(1), 10);
      if (!isNaN(num) && num >= count) {
        count = num + 1;
      }
    });
  });
  return `P${count.toString().padStart(3, "0")}`;
}

function getFlattenedProfessions(searchTerm = "") {
  const term = searchTerm.toLowerCase();

  const flattened = data.Categories.flatMap((category) => {
    const categoryName = category.Category_Name;

    const allProfessions = category.Subcategories
      ? category.Subcategories.flatMap((subcategory) =>
          subcategory.Professions.map((prof) => ({
            ...prof,
            categoryName: categoryName,
            subcategoryName: subcategory.Subcategory_Name,
          }))
        )
      : (category.Professions || []).map((prof) => ({
          ...prof,
          categoryName: categoryName,
          subcategoryName: "N/A",
        }));

    return allProfessions;
  });

  if (term) {
    return flattened.filter(
      (prof) =>
        prof.display_name.toLowerCase().includes(term) ||
        prof.id.toLowerCase().includes(term) ||
        prof.categoryName.toLowerCase().includes(term) ||
        (prof.subcategoryName &&
          prof.subcategoryName.toLowerCase().includes(term))
    );
  }

  return flattened;
}

exports.getCategoriesList = (req, res) => {
  const lang = req.query.lang ? req.query.lang.toLowerCase() : "en";
  const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";

  const translations = data.Translations[lang] || data.Translations.en;

  let categoriesToProcess = data.Categories;

  if (searchTerm) {
    categoriesToProcess = categoriesToProcess.filter((category) => {
      const englishName = category.Category_Name.toLowerCase();
      const translatedName = (
        translations[category.id] || category.Category_Name
      ).toLowerCase();

      return (
        englishName.includes(searchTerm) ||
        translatedName.includes(searchTerm) ||
        category.id.toLowerCase().includes(searchTerm)
      );
    });
  }

  const categoriesList = categoriesToProcess.map((category) => ({
    id: category.id,
    Category_Name: translations[category.id] || category.Category_Name,
    image_url: category.image_url,
  }));

  res.json({ Categories: categoriesList, issuccess: true });
};

exports.getSubcategoriesByCategoryId = (req, res) => {
  const categoryId = req.params.categoryId;
  const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";

  const lang = req.query.lang ? req.query.lang.toLowerCase() : "en";
  const translations = data.Translations[lang] || data.Translations.en;

  const targetCategory = data.Categories.find((c) => c.id === categoryId);

  if (!targetCategory) {
    return res
      .status(404)
      .json({ message: `Category ID '${categoryId}' not found.` });
  }

  const processProfessions = (professionList) => {
    let filteredProfessions = professionList.filter((prof) => prof.isActive);

    if (searchTerm) {
      filteredProfessions = filteredProfessions.filter(
        (prof) =>
          prof.display_name.toLowerCase().includes(searchTerm) ||
          prof.id.toLowerCase().includes(searchTerm)
      );
    }

    return filteredProfessions.map((prof) => ({
      id: prof.id,
      display_name: translations[prof.id] || prof.display_name,
      image_url: prof.image_url,
    }));
  };

  let resultData = {
    id: targetCategory.id,
    Category_Name:
      translations[targetCategory.id] || targetCategory.Category_Name,
    image_url: targetCategory.image_url,
  };

  if (targetCategory.Subcategories) {
    let processedSubcategories = targetCategory.Subcategories.filter(
      (sub) => sub.isActive !== false
    ).map((sub) => ({
      Subcategory_Name: sub.Subcategory_Name,
      Professions: processProfessions(sub.Professions),
    }));

    resultData.Subcategories = processedSubcategories.filter(
      (sub) => sub.Professions.length > 0
    );
  } else if (targetCategory.Professions) {
    resultData.Professions = processProfessions(targetCategory.Professions);
  }

  res.json(resultData);
};

exports.getProfessionsActive = (req, res) => {
  const lang = req.params.lang ? req.params.lang.toLowerCase() : "en";
  const translations = data.Translations[lang] || data.Translations.en;

  const activeData = {
    Categories: data.Categories.map((category) => {
      const newCategory = {
        Category_Name: translations[category.id] || category.Category_Name,
      };

      const processProfessions = (professionList) =>
        professionList
          .filter((prof) => prof.isActive)
          .map((prof) => ({
            id: prof.id,
            display_name: translations[prof.id] || prof.display_name,
          }));

      if (category.Subcategories) {
        newCategory.Subcategories = category.Subcategories.filter(
          (sub) => sub.isActive !== false
        ).map((sub) => ({
          Subcategory_Name: sub.Subcategory_Name,
          Professions: processProfessions(sub.Professions),
        }));
      } else if (category.Professions) {
        newCategory.Professions = processProfessions(category.Professions);
      }
      return newCategory;
    }),
  };

  res.json(activeData);
};

exports.getProfessionById = (req, res) => {
  const professionId = req.params.id;

  const result = findProfessionById(professionId);

  if (result && result.prof) {
    const professionDetails = {
      id: result.prof.id,
      display_name: result.prof.display_name,
      image_url: result.prof.image_url,
      isActive: result.prof.isActive,
      categoryName: result.category.Category_Name,
      subcategoryName: result.subcategory
        ? result.subcategory.Subcategory_Name
        : null,
    };

    res.json(professionDetails);
  } else {
    res.status(404).json({
      message: `Profession ID '${professionId}' not found.`,
    });
  }
};
exports.getProfessionsAdmin = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const searchTerm = req.query.search || "";

  const filteredList = getFlattenedProfessions(searchTerm);

  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedItems = filteredList.slice(startIndex, endIndex);

  res.json({
    professions: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
};

exports.createProfession = (req, res) => {
  const { categoryName, subcategoryName, englishName, initialTranslations } =
    req.body;

  if (
    !categoryName ||
    !englishName ||
    !initialTranslations ||
    !initialTranslations.en
  ) {
    return res.status(400).json({
      message:
        "Missing required fields: categoryName, englishName, and initialTranslations (including 'en').",
    });
  }

  const newId = generateId();
  const newProfession = {
    id: newId,
    display_name: englishName,
    isActive: true,
    image_url: req.body.image_url || null,
  };

  let targetCategory = data.Categories.find(
    (c) => c.Category_Name === categoryName
  );

  if (!targetCategory) {
    targetCategory = {
      Category_Name: categoryName,
      id: generateId(),
      Professions: [],
    };
    data.Categories.push(targetCategory);
  }

  if (subcategoryName && targetCategory.Subcategories) {
    let targetSubcategory = targetCategory.Subcategories.find(
      (s) => s.Subcategory_Name === subcategoryName
    );
    if (!targetSubcategory) {
      targetSubcategory = {
        Subcategory_Name: subcategoryName,
        isActive: true,
        Professions: [],
      };
      targetCategory.Subcategories.push(targetSubcategory);
    }
    targetSubcategory.Professions.push(newProfession);
  } else if (targetCategory.Professions) {
    targetCategory.Professions.push(newProfession);
  } else {
    return res.status(400).json({
      message: "Category structure incompatible with request.",
    });
  }

  Object.keys(data.Translations).forEach((lang) => {
    data.Translations[lang][newId] = initialTranslations[lang] || englishName;
  });

  res.status(201).json({
    message: `Profession created successfully with ID ${newId}`,
    profession: newProfession,
  });
};

// UPDATE (U): Update main profession details (display_name, image_url)
exports.updateProfession = (req, res) => {
  const professionId = req.params.id;
  const { display_name, image_url } = req.body;

  if (!display_name || !image_url) {
    return res.status(400).json({
      message: "Missing required fields: display_name and image_url.",
    });
  }

  const result = findProfessionById(professionId);

  if (result && result.prof) {
    result.prof.display_name = display_name;
    result.prof.image_url = image_url;

    if (data.Translations.en) {
      data.Translations.en[professionId] = display_name;
    }

    res.status(200).json({
      message: `Profession ${professionId} updated successfully.`,
      updatedProfession: result.prof,
    });
  } else {
    res.status(404).json({
      message: "Profession ID not found for update.",
    });
  }
};

// UPDATE- CENTRAL CONTROL: Update Active Status Globally
exports.updateProfessionStatus = (req, res) => {
  const professionId = req.params.id;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "Field 'isActive' must be a boolean.",
    });
  }

  const result = findProfessionById(professionId);

  if (result && result.prof) {
    result.prof.isActive = isActive;
    res.status(200).json({
      message: `Status for profession ${professionId} updated to ${isActive} across all languages.`,
    });
  } else {
    res.status(404).json({
      message: "Profession ID not found.",
    });
  }
};

exports.updateSubcategoryStatus = (req, res) => {
  const { categoryId, subcategoryName } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "Field 'isActive' must be a boolean.",
    });
  }

  const targetSubcategory = findSubcategory(categoryId, subcategoryName);

  if (targetSubcategory) {
    targetSubcategory.isActive = isActive;
    res.status(200).json({
      message: `Status for subcategory '${subcategoryName}' in category '${categoryId}' updated to ${isActive}.`,
    });
  } else {
    res.status(404).json({
      message: "Subcategory not found in the specified category.",
    });
  }
};

// UPDATE
exports.updateProfessionTranslation = (req, res) => {
  const { id, lang } = req.params;
  const { translation } = req.body;

  if (!translation) {
    return res.status(400).json({
      message: "Missing 'translation' field.",
    });
  }
  if (!data.Translations[lang]) {
    return res.status(404).json({
      message: `Language code '${lang}' not supported.`,
    });
  }

  const result = findProfessionById(id);

  if (!result) {
    return res.status(404).json({
      message: "Profession ID not found in master list.",
    });
  }

  data.Translations[lang][id] = translation;

  if (lang === "en") {
    result.prof.display_name = translation;
  }

  res.status(200).json({
    message: `Translation for ID ${id} in ${lang} updated to: ${translation}`,
  });
};

// DELETE
exports.deleteProfession = (req, res) => {
  const professionId = req.params.id;
  let foundAndDeleted = false;

  for (const category of data.Categories) {
    const lists = category.Subcategories
      ? category.Subcategories.map((s) => s.Professions)
      : [category.Professions];

    for (const professionList of lists) {
      if (professionList) {
        const index = professionList.findIndex((p) => p.id === professionId);

        if (index !== -1) {
          professionList.splice(index, 1);
          foundAndDeleted = true;
          break;
        }
      }
    }
    if (foundAndDeleted) break;
  }

  if (!foundAndDeleted) {
    return res.status(404).json({
      message: "Profession ID not found for deletion.",
    });
  }

  Object.keys(data.Translations).forEach((lang) => {
    if (data.Translations[lang][professionId]) {
      delete data.Translations[lang][professionId];
    }
  });

  res.status(200).json({
    message: `Profession ${professionId} and all its translations deleted successfully.`,
  });
};

exports.getArtisans = async (req, res) => {
  try {
    const {
      categoryId,
      subCategoryId,
      latitude,
      longitude,
      distance = 30,
      city,
      businessName,
      isAvailable,
    } = req.query;

    if (!categoryId || !subCategoryId) {
      return res.status(400).json({
        issuccess: false,
        message: "categoryId and subCategoryId are required.",
      });
    }

    let query = {
      findArtisan: false,
      isAvailable:
        isAvailable === "true"
          ? true
          : isAvailable === "false"
          ? false
          : { $in: [true, false] },
      categoryId,
      subCategoryId,
    };

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (businessName) {
      query.businessName = { $regex: businessName, $options: "i" };
    }

    let artisans = await User.find(query);

    if (latitude && longitude) {
      const lat = Number(latitude);
      const lon = Number(longitude);
      const maxDistanceKm = Number(distance);

      artisans = artisans.filter((item) => {
        if (!item.latitude || !item.longitude) return false;
        const dist = haversine(lat, lon, item.latitude, item.longitude);
        return dist <= maxDistanceKm;
      });
    }

    res.json({
      issuccess: true,
      total: artisans.length,
      artisans,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET CATEGORY & SUBCATEGORY COUNT
exports.getCategorySubcategoryCount = (req, res) => {
  try {
    let categoryCount = 0;
    let subcategoryCount = 0;
    let professionCount = 0;

    data.Categories.forEach((category) => {
      categoryCount++;

      if (category.Subcategories && category.Subcategories.length > 0) {
        subcategoryCount += category.Subcategories.length;

        category.Subcategories.forEach((sub) => {
          if (sub.Professions && sub.Professions.length > 0) {
            professionCount += sub.Professions.length;
          }
        });
      } else if (category.Professions) {
        professionCount += category.Professions.length;
      }
    });

    return res.status(200).json({
      issuccess: true,
      counts: {
        categories: categoryCount,
        subcategories: subcategoryCount,
        professions: professionCount,
      },
    });
  } catch (error) {
    console.error("Count Error:", error);
    return res.status(500).json({
      issuccess: false,
      error: "Internal Server Error",
    });
  }
};

