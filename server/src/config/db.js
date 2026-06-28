import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB_NAME || "task_tracker";

  if (!uri) {
    throw new Error("MONGODB_URI is required. Add it to server/.env.");
  }

  const connection = await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000
  });
  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
};
