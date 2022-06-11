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
  const environment = core.getInput("hostname") || process.env.HOSTNAME;
  const repo = process.env.GITHUB_REPOSITORY;

  const params = new URLSearchParams();
  params.append("grant_type", "api_key");
  params.append("api_key", apiKey);

  console.log(process.env.API_URL);
  const unauthorizedRequest = http();
  const apiTokenSet = await unauthorizedRequest.post(`/auth/token`, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if (!apiTokenSet) {
    throw new Error("Failed authentication against TechCoreAPI");
  }

  const authorizedRequest = http(apiTokenSet.data.access_token);
  const user = (await authorizedRequest.get("/auth/me", {})).data;
  const projectQuery = {
    user: user.sub,
  };
  const query = {
    github_uri: repo,
    environment,
    image,
  };
  const appQuery = {
    project: user.service.id,
    repo: process.env.GITHUB_REPOSITORY,
  };

  // FIXME: Update all appps with this repo, not just [0]
  const apps = (await authorizedRequest.get(`/apps?${qs.stringify(appQuery)}`))
    ?.data;
  const app = apps.length > 0 ? apps[0] : null;
  if (!app) {
    throw new Error("We couldnt find an app connected to this repository");
  }

  const namespaceQuery = {
    project: app.project,
    base_host: environment,
  };
  const namespaces = (
    await authorizedRequest.get(`/namespaces?${qs.stringify(namespaceQuery)}`)
  ).data;
  const namespace = namespaces.length > 0 ? namespaces[0] : null;
  if (!namespace) {
    throw new Error(
      "We couldnt find a namespace in your project with this domain"
    );
  }
  const deploymentQuery = {
    app: app.sub,
    namespace: namespace.sub,
  };
  const deployments = (
    await authorizedRequest.get(`/deployments?${qs.stringify(deploymentQuery)}`)
  ).data;
  const deployment = deployments.length > 0 ? deployments[0] : null;

  if (!deployment) {
    throw new Error(
      "We couldnt find a deployment for this application and domain"
    );
  }
  deployment.image = image;
  console.log("updating ", deployment);
  await authorizedRequest.put(`/deployments`, deployment);
}

const IS_GITHUB_ACTION = !!process.env.GITHUB_ACTIONS || process.env.DEBUG;
if (IS_GITHUB_ACTION) {
  console.error = (msg) => console.log(`::error::${msg}`);
  console.warn = (msg) => console.log(`::warning::${msg}`);
} else {
  dotenv.config();
}
handler();
