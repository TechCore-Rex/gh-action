import * as core from "@actions/core";
import http from "./api.js";
import qs from "qs";
import dotenv from "dotenv";
async function handler() {
  core.info("Running handler");
  console.log("running handler");
  const apiKey =
    core.getInput("techcore-api-key") || process.env.TECHCORE_API_KEY;
  const image = core.getInput("image") || process.env.IMAGE;
  const environment = core.getInput("environment") || process.env.NAMESPACE;

  console.log(apiKey);
  console.log(image);
  console.log(environment);
  const params = new URLSearchParams();
  params.append("grant_type", "api_key");
  params.append("api_key", apiKey);

  const unauthorizedRequest = http();
  const apiTokenSet = await unauthorizedRequest
    .post(`/auth/token`, params)
    .catch((e) => {
      console.log(e.data);
    });

  if (!apiTokenSet) {
    throw new Error("Failed authentication against TechCoreAPI");
  }

  const authorizedRequest = http(apiTokenSet.access_token);
  const user = await authorizedRequest.get("/auth/me", {
    headers: { Authorization: `Bearer ${apiTokenSet.data.access_token}` },
  });
  const query = {
    github_uri: process.env.GITHUB_REPOSITORY,
    environment,
    image,
  };
  console.log("sending query!", query);
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
}
handler();
