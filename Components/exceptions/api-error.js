module.exports = class ApiError extends Error {
    status;
    errors;
    constructor(status, message, errors = []) {
        super();
        this.status = status;
        this.message = message;
        this.errors = errors;
    }

    static UnAuthorized () {
        return new ApiError(401, 'User is not authorized')
    }

    static BadRequest (message, errors) {
        return new ApiError(401, message, errors)
    }
};