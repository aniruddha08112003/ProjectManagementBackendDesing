import mongoose
 from "mongoose";

 const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI, {
            
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        comsole.error("MongoDB connection failed:", error);
        process.exit(1);
    }
 }


 export default connectDB