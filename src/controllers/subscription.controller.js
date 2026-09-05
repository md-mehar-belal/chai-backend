import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Toggle subscription (Subscribe / Unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  // User cannot subscribe to their own channel
  if (channelId.toString() === req.user?._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId
  });

  if (existingSubscription) {
    // Already subscribed -> Unsubscribe
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribed successfully"));
  }

  // Not subscribed -> Subscribe
  await Subscription.create({
    subscriber: req.user?._id,
    channel: channelId
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully"));
});

// 2. Controller to return subscriber list of a channel (Channel ke subscribers kaun hain)
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        subscriber: {
          $first: "$subscriber"
        }
      }
    },
    {
      $project: {
        subscriber: 1,
        createdAt: 1
      }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers list fetched successfully")
    );
});

// 3. Controller to return channel list to which a user has subscribed (User ne kin channels ko subscribe kiya hai)
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber ID");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        subscribedChannel: {
          $first: "$subscribedChannel"
        }
      }
    },
    {
      $project: {
        subscribedChannel: 1,
        createdAt: 1
      }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
};