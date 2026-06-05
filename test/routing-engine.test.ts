import { describe, expect, it } from "vitest";
import { applyRoutingRules } from "../src/lib/routing-engine";
import type { RoutingContact, RoutingDocument, RoutingRule } from "../src/lib/routing-engine";

const contacts: RoutingContact[] = [
  { id: "c1", name: "Alice", email: "alice@example.com", role: "Buyer" },
  { id: "c2", name: "Bob", email: "bob@example.com", role: "Advisor" },
  { id: "c3", name: "Carol", email: "carol@example.com", role: "Lender" },
];

const documents: RoutingDocument[] = [
  { id: "d1", name: "P&L Statement", tag: "financials", fileRef: "ref:d1" },
  { id: "d2", name: "SPA Draft", tag: "legal", fileRef: "ref:d2" },
  { id: "d3", name: "Org Chart", tag: "operations", fileRef: "ref:d3" },
];

const rules: RoutingRule[] = [
  { id: "r1", role: "Buyer", tags: ["financials", "legal"] },
  { id: "r2", role: "Advisor", tags: ["financials", "legal", "operations"] },
];

describe("applyRoutingRules", () => {
  it("routes Buyer to financials and legal only", () => {
    const results = applyRoutingRules(contacts, documents, rules);
    const buyerRoutes = results.filter((r) => r.contactId === "c1");
    expect(buyerRoutes).toHaveLength(2);
    expect(buyerRoutes.map((r) => r.documentTag).sort()).toEqual(["financials", "legal"]);
  });

  it("routes Advisor to all three documents", () => {
    const results = applyRoutingRules(contacts, documents, rules);
    const advisorRoutes = results.filter((r) => r.contactId === "c2");
    expect(advisorRoutes).toHaveLength(3);
  });

  it("skips contacts with no matching rule", () => {
    const results = applyRoutingRules(contacts, documents, rules);
    const lenderRoutes = results.filter((r) => r.contactId === "c3");
    expect(lenderRoutes).toHaveLength(0);
  });

  it("returns empty when no rules are defined", () => {
    const results = applyRoutingRules(contacts, documents, []);
    expect(results).toHaveLength(0);
  });

  it("returns empty when no documents match the rule tags", () => {
    const noMatchRules: RoutingRule[] = [{ id: "r99", role: "Buyer", tags: ["nonexistent"] }];
    const results = applyRoutingRules([contacts[0]], documents, noMatchRules);
    expect(results).toHaveLength(0);
  });

  it("populates all result fields correctly", () => {
    const results = applyRoutingRules(
      [contacts[0]],
      [documents[0]],
      [{ id: "r1", role: "Buyer", tags: ["financials"] }]
    );
    expect(results[0]).toMatchObject({
      contactId: "c1",
      documentId: "d1",
      ruleId: "r1",
      contactName: "Alice",
      contactEmail: "alice@example.com",
      documentName: "P&L Statement",
      documentTag: "financials",
      roleMatched: "Buyer",
    });
  });
});
