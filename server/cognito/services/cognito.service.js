const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminInitiateAuthCommand,
  InitiateAuthCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const { COGNITO_REGION } = process.env;
const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION,
});

const parseJwt = (token) => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

module.exports.register = (params) => {
  return new Promise((resolve, reject) => {
    const signUpCommand = new SignUpCommand(params);
    cognitoClient
      .send(signUpCommand)
      .then((response) => {
        return resolve(response);
      })
      .catch((e) => {
        return reject(e);
      });
  });
};

module.exports.adminLogin = (params) => {
  return new Promise((resolve, reject) => {
    const adminInitiateAuthCommand = new AdminInitiateAuthCommand(params);

    cognitoClient
      .send(adminInitiateAuthCommand)
      .then((response) => {
        return resolve({
          authenticationResult: { ...response.AuthenticationResult },
          claims: parseJwt(response.AuthenticationResult.AccessToken),
        });
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

module.exports.login = (params) => {
  return new Promise((resolve, reject) => {
    const adminInitiateAuthCommand = new InitiateAuthCommand(params);

    cognitoClient
      .send(adminInitiateAuthCommand)
      .then((response) => {
        return resolve({
          authenticationResult: { ...response.AuthenticationResult },
          claims: parseJwt(response.AuthenticationResult.AccessToken),
        });
      })
      .catch((err) => {
        return reject(err);
      });
  });
};
