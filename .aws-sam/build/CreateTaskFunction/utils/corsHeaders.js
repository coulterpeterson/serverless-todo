"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOptions = exports.corsHeaders = void 0;
exports.corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Requested-With',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
    'Content-Type': 'application/json'
};
// Helper function to handle OPTIONS requests
const handleOptions = () => {
    return {
        statusCode: 200,
        headers: exports.corsHeaders,
        body: ''
    };
};
exports.handleOptions = handleOptions;
