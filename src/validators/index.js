import { body } from "express-validator";

const userRegisterValidator = () => {
    return[
        body("email").trim().isEmail().notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid"),
        body("username").trim().notEmpty().withMessage("Username is required").isLowercase().withMessage("Username must be lowercase").isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters"),
        body("password").trim().notEmpty().withMessage("Password is required"),
        body("fullName").optional().trim(),
    ]
}

export{
    userRegisterValidator
}