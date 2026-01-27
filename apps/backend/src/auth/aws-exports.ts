const CognitoAuthConfig = {
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  region: process.env.COGNITO_REGION || 'us-east-2',
};

export default CognitoAuthConfig;
