export interface RoutingContact {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface RoutingDocument {
  id: string;
  name: string;
  tag: string;
  fileRef: string;
}

export interface RoutingRule {
  id: string;
  role: string;
  tags: string[];
}

export interface RoutingResult {
  contactId: string;
  documentId: string;
  ruleId: string;
  contactName: string;
  contactEmail: string;
  documentName: string;
  documentTag: string;
  roleMatched: string;
}

/**
 * Pure function — applies routing rules to contacts + documents.
 * Each contact whose role matches a rule receives every document
 * whose tag is listed in that rule.
 */
export function applyRoutingRules(
  contacts: RoutingContact[],
  documents: RoutingDocument[],
  rules: RoutingRule[]
): RoutingResult[] {
  const results: RoutingResult[] = [];

  for (const contact of contacts) {
    const matchingRule = rules.find((r) => r.role === contact.role);
    if (!matchingRule) continue;

    const matchingDocs = documents.filter((d) =>
      matchingRule.tags.includes(d.tag)
    );

    for (const doc of matchingDocs) {
      results.push({
        contactId: contact.id,
        documentId: doc.id,
        ruleId: matchingRule.id,
        contactName: contact.name,
        contactEmail: contact.email,
        documentName: doc.name,
        documentTag: doc.tag,
        roleMatched: contact.role,
      });
    }
  }

  return results;
}
