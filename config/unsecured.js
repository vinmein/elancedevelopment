const config = {
  auth: [
    { url: "/", method: ["GET"] },
    { url: "/checkout.html", method: ["GET"] },
    { url: "/video.html", method: ["GET"] },
    { url: "/api/v1/regions", method: ["GET"] },
    { url: /\/api\/docs/i, method: ["GET"], regex: true },
    { url: "/api/v1/users/auth", method: ["POST"] },
    { url: "/api/v1/configurations", method: ["GET"] },
    { url: "/api/v1/payments/paymentSession", method: ["POST"] },
    { url: "/api/v1/users/auth/refreshToken", method: ["POST"] },
    { url: "/api/v1/users/saaspass/token", method: ["GET"] },
    { url: "/api/v1/users/saaspass/verify", method: ["POST"] },
    { url: "/api/v1/users/onboard/visitors", method: ["POST"] },
    { url: "/api/v1/users/onboard/doctors", method: ["POST"] },
    { url: "/api/v1/hooks", method: ["POST"] },
    { url: /\/resources/i, method: ["GET"], regex: true },
    { url: "/api/v1/users/password/forgot", method: ["POST"] },
    { url: "/api/v1/users/password/reset", method: ["PATCH"] },
    { url: "/api/v1/users/verify/account", method: ["POST"] },

    // { url: /^\/api\/v1\/region\/+[\s\S]+$/, method: ['GET'], regex: true },
    // { url: '/api/payment/webhook', method: ['POST'] },
  ],
};

module.exports = config;
