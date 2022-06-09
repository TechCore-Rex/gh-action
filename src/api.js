import axios from "axios";
const url = "https://api.techcore.com";
const client_id = "techcore-gh-action";
const client_secret = "42a6ec6e-9fa5-426a-87a1-9f006f387afa";
const http = (access_token) =>
  axios.create({
    baseURL: url,
    timeout: 1000,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: !access_token
        ? `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString(
            "base64"
          )}`
        : `Bearer ${access_token}`,
    },
  });

export default http;
