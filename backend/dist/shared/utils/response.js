"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, statusCode, message, errors) => {
    return res.status(statusCode).json({
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        message,
        errors
    });
};
exports.sendError = sendError;
