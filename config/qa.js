module.exports = {
  database: {},
  aws: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    bucket: "om-heb",
  },
  db_username: process.env.DB_USERNAME,
  db_password: process.env.DB_PASSWORD,
  db_host: process.env.DB_HOST,
  db_name: process.env.DB_NAME,
  jwt_secret: process.env.JWT_SECRET,
  key: process.env.ENCRYPTION_KEY,
  ivString: process.env.IV_STRING,
  pk_config: [
    "aws.accessKeyId",
    "aws.secretAccessKey",
    "db_username",
    "db_password",
    "jwt_secret",
  ],
  base_url: `https://om.com`,
};
