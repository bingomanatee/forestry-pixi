import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/index.jsx"),
  route(":packageId/:sourceMode", "routes/package-validator.jsx"),
] satisfies RouteConfig;
