module.exports = {
  getOtpPayload: {
    good: {
      password: "Test!123",
      username: "dinesh",
    },
    faultyEmail: {
      email: "someone@om",
      deviceId: "773467",
    },
    nonWLEmail: {
      email: "someone@hotmail.com",
      deviceId: "773467",
    },
  },
  validateOtpPayload: {
    good: {
      email: "someone@om.com",
      deviceId: "773467",
      otp: "678977",
    },
    badOtp: {
      email: "someone@om.com",
      deviceId: "773467",
      otp: "ab5013",
    },
    badEmail: {
      email: "someone@om",
      deviceId: "773467",
      otp: "678977",
    },
  },
  appId: {
    receiptdee: "RECEIPTDEE",
  },
};
