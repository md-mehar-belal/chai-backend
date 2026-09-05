import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Get channel stats (total views, subscribers, videos, likes)
const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  // Video stats: Total videos and total video views
  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" }
      }
    }
  ]);

  // Total subscribers of the logged-in channel
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId
  });

  // Total likes on all videos uploaded by the logged-in user
  const totalLikes = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails"
      }
    },
    {
      $unwind: "$videoDetails"
    },
    {
      $match: {
        "videoDetails.owner": new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: null,
        totalLikesCount: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalSubscribers: totalSubscribers || 0,
    totalLikes: totalLikes[0]?.totalLikesCount || 0
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

// 2. Get all videos uploaded by the channel/user
const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes"
      }
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        createdAt: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        }
      }
    },
    {
      $project: {
        likes: 0
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});

export {
  getChannelStats,
  getChannelVideos
};