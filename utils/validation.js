import Joi from "@hapi/joi";

export const signUpValidation = data => {
    const schema = Joi.object({
        username: Joi.string().required().max(30),
        email: Joi.string().email().required().min(3).max(300),
        mobile: Joi.string().required().min(8).max(200),
        password: Joi.string().required().min(3).max(400)
    })
    
    return schema.validate(data);
};

export const signInValidation = data => {
    const schema = Joi.object({
        email: Joi.string().email().required().min(3).max(300),
        password: Joi.string().required().min(3).max(400)
    })
    
    return schema.validate(data);
};