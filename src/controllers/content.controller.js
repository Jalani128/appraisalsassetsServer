import SiteContent from "../models/SiteContent.js";

async function getOrCreateContent() {
  let content = await SiteContent.findOne();
  if (!content) {
    content = await SiteContent.create({});
  }
  return content;
}

// GET SITE CONTENT (public)
export const getSiteContent = async (req, res) => {
  try {
    const content = await getOrCreateContent();
    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Get site content error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving site content",
      error: error.message,
    });
  }
};

// UPDATE HERO SECTION
export const updateHero = async (req, res) => {
  try {
    const { badgeText, headline, description } = req.body;
    const content = await getOrCreateContent();

    if (badgeText !== undefined) content.hero.badgeText = badgeText;
    if (headline !== undefined) content.hero.headline = headline;
    if (description !== undefined) content.hero.description = description;

    await content.save();

    res.status(200).json({
      success: true,
      message: "Hero section updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("Update hero error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating hero section",
      error: error.message,
    });
  }
};

// UPDATE ABOUT SECTION
export const updateAbout = async (req, res) => {
  try {
    const { headline, description, mission, vision } = req.body;
    const content = await getOrCreateContent();

    if (headline !== undefined) content.about.headline = headline;
    if (description !== undefined) content.about.description = description;
    if (mission !== undefined) content.about.mission = mission;
    if (vision !== undefined) content.about.vision = vision;

    await content.save();

    res.status(200).json({
      success: true,
      message: "About section updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("Update about error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating about section",
      error: error.message,
    });
  }
};

// UPDATE CONTACT INFO
export const updateContact = async (req, res) => {
  try {
    const {
      officeAddress,
      phone,
      email,
      whatsapp,
      officeHours,
      socialLinks,
      mapEmbedUrl,
    } = req.body;

    const content = await getOrCreateContent();

    if (officeAddress !== undefined) content.contact.officeAddress = officeAddress;
    if (phone !== undefined) content.contact.phone = phone;
    if (email !== undefined) content.contact.email = email;
    if (whatsapp !== undefined) content.contact.whatsapp = whatsapp;
    if (officeHours !== undefined) content.contact.officeHours = officeHours;
    if (mapEmbedUrl !== undefined) content.contact.mapEmbedUrl = mapEmbedUrl;

    if (socialLinks) {
      if (socialLinks.facebook !== undefined)
        content.contact.socialLinks.facebook = socialLinks.facebook;
      if (socialLinks.instagram !== undefined)
        content.contact.socialLinks.instagram = socialLinks.instagram;
      if (socialLinks.linkedin !== undefined)
        content.contact.socialLinks.linkedin = socialLinks.linkedin;
      if (socialLinks.twitter !== undefined)
        content.contact.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.youtube !== undefined)
        content.contact.socialLinks.youtube = socialLinks.youtube;
    }

    await content.save();

    res.status(200).json({
      success: true,
      message: "Contact info updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating contact info",
      error: error.message,
    });
  }
};
