import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const healthCheck = asyncHandler( async(req,res)=>{
    res.status(200).json(new ApiResponse(200,{message:"Server is running"}));
})
// const healthCheck = (req, res) => {
//     try {
//         res.status(200).json(new ApiResponse(200,{message:"Server is running"}));
//     } catch (error) {
        
//     }
// }

export default healthCheck;