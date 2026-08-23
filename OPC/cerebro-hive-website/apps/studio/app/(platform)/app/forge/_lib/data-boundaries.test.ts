import assert from "node:assert/strict";
import test from "node:test";

import {
  parseForgeArchitecture,
  parseForgePlan,
  parseForgeRequirements,
  parseForgeRequirementRows,
  selectProjectValue,
} from "./data-boundaries";

const validArchitecture = {
  pattern: "microservices",
  services: [{
    name: "API Gateway",
    port: 3000,
    database: null,
    runtime: "Node.js",
    responsibilities: ["Route requests"],
  }],
  techStack: { frontend: ["Next.js"], database: ["PostgreSQL"] },
  decisions: [{
    title: "Use an API gateway",
    context: "Multiple services need one entry point",
    decision: "Route traffic through the gateway",
    status: "accepted",
  }],
  folderStructure: "apps/\npackages/",
};

const validPlan = {
  modules: [{
    name: "Accounts",
    description: "User account management",
    priority: "critical",
    storyCount: 3,
    apiCount: 2,
    status: "pending",
  }],
  actors: ["Administrator"],
  milestones: [{ title: "Foundation", weekLabel: "Weeks 1-2", order: 1 }],
  totalStories: 3,
  totalApis: 2,
  stack: {
    frontend: "Next.js",
    backend: "NestJS",
    database: "PostgreSQL",
    mobile: null,
    infra: "Kubernetes",
  },
  businessSummary: "Manage customer accounts.",
};

test("persisted architecture is exposed only when its nested contract is valid", () => {
  assert.deepEqual(parseForgeArchitecture(validArchitecture), validArchitecture);
  assert.equal(parseForgeArchitecture({
    ...validArchitecture,
    services: [{ ...validArchitecture.services[0], port: "3000" }],
  }), null);
});

test("persisted plans reject malformed nested workflow values", () => {
  assert.deepEqual(parseForgePlan(validPlan), validPlan);
  assert.equal(parseForgePlan({
    ...validPlan,
    modules: [{ ...validPlan.modules[0], priority: "urgent" }],
  }), null);
});

test("persisted requirement rows reconstruct descriptions and structured stories", () => {
  const rows = [
    { id: "f-1", type: "functional", title: "Users can sign in", priority: "high" },
    { id: "n-1", type: "non_functional", title: "Respond within 200 ms", priority: "medium" },
    {
      id: "a-1",
      type: "api_contract",
      title: "POST /users",
      description: "Creates a user",
      priority: "high",
    },
    {
      id: "s-1",
      type: "user_story",
      title: "As a manager, I want to invite users so that teams can collaborate",
      priority: "medium",
    },
  ];

  assert.deepEqual(parseForgeRequirementRows(rows), {
    functional: ["Users can sign in"],
    nonFunctional: ["Respond within 200 ms"],
    actors: [],
    entities: [],
    apiContracts: [{ method: "POST", path: "/users", description: "Creates a user" }],
    userStories: [{
      actor: "manager",
      action: "invite users",
      benefit: "teams can collaborate",
    }],
  });
  assert.equal(parseForgeRequirementRows([{ type: "functional", title: 42 }]), null);
});

test("generated requirements are exposed only when every nested value is valid", () => {
  const requirements = {
    functional: ["Users can sign in"],
    nonFunctional: ["Respond within 200 ms"],
    actors: [{ name: "Manager", permissions: ["invite:users"] }],
    entities: [{ name: "User", fields: ["id", "email"] }],
    apiContracts: [{ method: "POST", path: "/users", description: "Creates a user" }],
    userStories: [{ actor: "manager", action: "invite users", benefit: "teams can collaborate" }],
  };

  assert.deepEqual(parseForgeRequirements(requirements), requirements);
  assert.equal(parseForgeRequirements({
    ...requirements,
    actors: [{ name: "Manager", permissions: [42] }],
  }), null);
});

test("generated values are scoped to the project that produced them", () => {
  const generated = { source: "generated" };
  const persisted = { source: "persisted" };
  const override = { projectId: "project-a", value: generated };

  assert.equal(selectProjectValue("project-a", override, persisted), generated);
  assert.equal(selectProjectValue("project-b", override, persisted), persisted);
});
