import axios from "axios";
const client_id = "techcore-gh-action";
const client_secret = "42a6ec6e-9fa5-426a-87a1-9f006f387afa";
const http = (access_token) => {
  const baseURL = process.env.API_URL
    ? process.env.API_URL
    : "https://api.techcore.com";
  return axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: !access_token
        ? `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString(
            "base64"
          )}`
        : `Bearer ${access_token}`,
    },
  });
};

export default http;
