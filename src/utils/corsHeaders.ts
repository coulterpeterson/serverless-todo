export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Requested-With',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Helper function to handle OPTIONS requests
export const handleOptions = () => {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: ''
  };
}; 