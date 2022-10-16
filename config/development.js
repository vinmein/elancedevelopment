module.exports = {
  database: {},
  base_url: `http://localhost:${process.env.PORT}`,
  app_url: `http://localhost:3500`,
  aws: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    bucket: "om-heb",
  },
  db_username: "",
  db_password: "",
  db_host: process.env.DB_HOST,
  db_name: process.env.DB_NAME,
  jwt_secret: process.env.JWT_SECRET,
  key: process.env.ENCRYPTION_KEY,
  ivString: process.env.IV_STRING,
  demo_mode: process.env.DEMO_MODE === "true",
  pk_config: ["aws.accessKeyId", "aws.secretAccessKey", "key", "ivString"],
};
