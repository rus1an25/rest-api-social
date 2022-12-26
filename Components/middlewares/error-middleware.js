const apiError = require('./../exceptions/api-error.js');

module.exports = function (err, req, res, next) {
    if (err instanceof apiError) {
        return res.status(err.status).json({message: err.message, errors: err.errors});
    }
    return res.status(500).json({message: 'Unexpected error'});
}