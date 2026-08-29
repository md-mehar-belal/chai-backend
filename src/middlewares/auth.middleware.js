import { asyncHandler } from "express-async-handler";
import { AppError } from "../utils/appError.js";  
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies.accessToken || req.headers("authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new AppError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.ACCCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  if (!user) {
    throw new AppError(401, "Invalid Access Token");
  }

  req.user = user;
  next();
  } catch (error) {
    throw new AppError(401, error?.message || "Invalid Access Token");
  }

})