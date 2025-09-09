import { supabase } from "../config/supabase.js";

/**
 * Uploads an image to Supabase carousel bucket
 * @param {Object} file - Multer file object
 * @param {string} fileName - Name for the file
 * @returns {Promise<string>} Public URL of the uploaded image
 */
async function uploadImageToSupabase(file, fileName) {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed");
  }

  // Get file extension
  const extension = file.originalname.split('.').pop();
  const filePath = `carrusel/${fileName}.${extension}`;

  const { data, error } = await supabase.storage
    .from("carrusel")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload carousel image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("carrusel").getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Gets all images from the carousel bucket
 * @returns {Promise<Array>} Array of image objects with URL and metadata
 */
export const getCarouselImages = async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from("carrusel")
      .list("carrusel", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" }
      });

    if (error) {
      throw new Error(`Failed to fetch carousel images: ${error.message}`);
    }

    // Get public URLs for each image
    const images = data.map(file => {
      const {
        data: { publicUrl },
      } = supabase.storage.from("carrusel").getPublicUrl(`carrusel/${file.name}`);
      
      return {
        name: file.name,
        url: publicUrl,
        size: file.metadata?.size || 0,
        lastModified: file.updated_at,
        id: file.id
      };
    });

    res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching carousel images",
      error: error.message
    });
  }
};

/**
 * Uploads a new image to the carousel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadCarouselImage = async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `carrusel_${timestamp}`;
    
    const imageUrl = await uploadImageToSupabase(file, fileName);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: {
        url: imageUrl,
        name: `${fileName}.${file.originalname.split('.').pop()}`
      }
    });
  } catch (error) {
    console.error("Error uploading carousel image:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message
    });
  }
};

/**
 * Deletes an image from the carousel bucket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteCarouselImage = async (req, res) => {
  try {
    const { imageName } = req.params;
    
    if (!imageName) {
      return res.status(400).json({
        success: false,
        message: "Image name is required"
      });
    }

    const { error } = await supabase.storage
      .from("carrusel")
      .remove([`carrusel/${imageName}`]);

    if (error) {
      throw new Error(`Failed to delete carousel image: ${error.message}`);
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting carousel image:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message
    });
  }
};
