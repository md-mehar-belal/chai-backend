import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  Credentials: true
}));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(express.static('public'));
app.use(cookieParser());


// Importing Routes
import userRoutes from './routes/user.routes.js';

import videoRoutes from "./routes/video.routes.js";

import tweetRoutes from "./routes/tweet.routes.js";

import subscriptionRoutes from "./routes/subscription.routes.js";

import playlistRoutes from "./routes/playlist.routes.js";

import likeRoutes from "./routes/like.routes.js";

import commentRoutes from "./routes/comment.routes.js";

import healthcheckRoutes from "./routes/healthcheck.routes.js";

import dashboardRoutes from "./routes/dashboard.routes.js";





//routes declaration
app.use('/api/v1/users', userRoutes);   // http://localhost:8000/api/v1/users/register

app.use("/api/v1/videos", videoRoutes);  // http://localhost:8000/api/v1/videos
app.use("/api/v1/tweets", tweetRoutes);

app.use("/api/v1/subscriptions", subscriptionRoutes);   // http://localhost:8000/api/v1/subscriptions

app.use("/api/v1/playlist", playlistRoutes);   // http://localhost:8000/api/v1/playlist

app.use("/api/v1/likes", likeRoutes);   // http://localhost:8000/api/v1/likes

app.use("/api/v1/comments", commentRoutes);   // http://localhost:8000/api/v1/comments

app.use("/api/v1/healthcheck", healthcheckRoutes);   // http://localhost:8000/api/v1/healthcheck

app.use("/api/v1/dashboard", dashboardRoutes);   // http://localhost:8000/api/v1/dashboard



export default app; 

