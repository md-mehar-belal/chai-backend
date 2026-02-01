import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req, res, next) => {
  // get user details from frontend
  // validate - not empty
  // check if user already exists: username, email
  // check for image, check for avtar
  // upload them to cloudinary, avtar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  //return response

  const { username, email, fullName, password } = req.body;
  //console.log("email:", email);

  if (!username || !email || !fullName || !password) {

    throw new ApiError(400, "All fields are required");

  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "User with given email or username already exists");
  }
  //console.log("req.files:", req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUrl = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatarUrl) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  const user = await User.create({
    username: username.toLowerCase().trim(),
    email,
    fullName,
    password,
    avatar: avatarUrl,
    coverImage: coverImageUrl || "",
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));

});

export { registerUser };