import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadMultipleEPS = upload.fields([
  { name: "captainEPS", maxCount: 1 },
  { name: "playersEPS", maxCount: 50 },
]);

export const uploadSingleEPS = upload.single("playerEPS");
