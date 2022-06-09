import * as core from "@actions/core";
import http from "./api.js";
import qs from "qs";
import dotenv from "dotenv";
async function handler() {
  console.log("running handler");
  const apiKey =
    core.getInput("techcore-api-key") || process.env.TECHCORE_API_KEY;
  const image = core.getInput("image") || process.env.IMAGE;
  const namespace = core.getInput("image") || process.env.NAMESPACE;

  const params = new URLSearchParams();
  params.append("grant_type", "api_key");
  params.append("api_key", apiKey);

  const unauthorizedRequest = http();
  const apiTokenSet = await unauthorizedRequest
    .post(`/auth/token`, params)
    .catch((e) => {
      console.error(e);
    });

  if (!apiTokenSet) {
    throw new Error("Failed authentication against TechCoreAPI");
  }

  const authorizedRequest = http(apiTokenSet.access_token);
  const user = await authorizedRequest.get("/auth/me", {
    headers: { Authorization: `Bearer ${apiTokenSet.data.access_token}` },
  });
  console.log(process.env);
  const query = {
    github_uri: "",
  };
  // const deployment = authorizedRequest.get(`/deployments?{}`);
  // await authorizedRequest.post(`/deployment`, {
  //   ...deployment,
  //   image,
  // });
  // POST /realease
}

const IS_GITHUB_ACTION = !!process.env.GITHUB_ACTIONS || process.env.DEBUG;

if (IS_GITHUB_ACTION) {
  console.error = (msg) => console.log(`::error::${msg}`);
  console.warn = (msg) => console.log(`::warning::${msg}`);
} else {
  dotenv.config();
  handler();
}

export default handler;
