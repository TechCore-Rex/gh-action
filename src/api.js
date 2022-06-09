import axios from "axios";
import config from "config";

const { url: apiUrl, client_id, client_secret } = config.get("techcore-api");
const http = (access_token) =>
  axios.create({
    baseURL: apiUrl,
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
