/**
 * Smart collection rule vocabulary — the shared contract between the API and
 * every client that renders or builds collection rules.
 *
 * This is the SINGLE declaration of which fields a merchant may write a rule
 * against and which operators each field accepts. The dashboard renders its
 * field and operator dropdowns from it; the API validates incoming rule sets
 * against its own mirror and rejects anything outside this vocabulary.
 *
 * Deliberately absent: how each field maps onto the search index. That is
 * server implementation detail (a price rule inverts across two index fields,
 * for instance) and must not leak into a client.
 *
 * If you change this, change the API's RULE_MATRIX in
 * src/modules/search/application/utils/collection-rule-set.utils.ts to match.
 * The API cannot import this package (it is a client OF that API, so the
 * dependency would be inverted), so it pins this vocabulary in
 * collection-rule-vocabulary.contract.spec.ts instead: changing RULE_MATRIX
 * fails that test until the change is mirrored here.
 */

export type RuleField =
  | "tag"
  | "category"
  | "price"
  | "rating"
  | "stock"
  | "promotion"
  | "status";

export type RuleOperator =
  | "equals"
  | "not_equals"
  | "any_of"
  | "all_of"
  | "none_of"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "is_true"
  | "is_false";

/** What shape of `value` an operator expects. "none" means the operator
 *  carries its meaning entirely in its name (is_true / is_false). */
export type RuleValueKind =
  | "none"
  | "number"
  | "number_pair"
  | "number_list"
  | "string"
  | "string_list";

export interface RuleOperatorSpec {
  value_kind: RuleValueKind;
}

export interface RuleFieldSpec {
  operators: Readonly<Record<string, RuleOperatorSpec>>;
  /** When present, a string value must be one of these. */
  allowed_values?: readonly string[];
}

export interface CollectionRule {
  field: RuleField;
  op: RuleOperator;
  value?: string | number | string[] | number[];
}

export interface CollectionRuleSet {
  /** "all" ANDs the rules, "any" ORs them. Defaults to "all". */
  match: "all" | "any";
  /** An empty list means every product. */
  rules: CollectionRule[];
}

/** A collection's search_criteria once it carries rule-model criteria. */
export interface CollectionRuleSetCriteria {
  rule_set: CollectionRuleSet;
}

export const COLLECTION_RULE_MATRIX = {
  tag: {
    operators: {
      any_of: { value_kind: "number_list" },
      all_of: { value_kind: "number_list" },
      none_of: { value_kind: "number_list" },
    },
  },
  category: {
    operators: {
      equals: { value_kind: "string" },
      not_equals: { value_kind: "string" },
      any_of: { value_kind: "string_list" },
    },
  },
  price: {
    operators: {
      gt: { value_kind: "number" },
      gte: { value_kind: "number" },
      lt: { value_kind: "number" },
      lte: { value_kind: "number" },
      between: { value_kind: "number_pair" },
    },
  },
  rating: {
    operators: {
      gte: { value_kind: "number" },
      lte: { value_kind: "number" },
    },
  },
  stock: {
    operators: {
      is_true: { value_kind: "none" },
      is_false: { value_kind: "none" },
    },
  },
  promotion: {
    operators: {
      is_true: { value_kind: "none" },
      is_false: { value_kind: "none" },
    },
  },
  status: {
    operators: {
      equals: { value_kind: "string" },
      not_equals: { value_kind: "string" },
    },
    allowed_values: ["active", "draft", "archived"],
  },
} as const satisfies Record<string, RuleFieldSpec>;

/** Display order for the field selector. */
export const RULE_FIELDS: readonly RuleField[] = [
  "tag",
  "category",
  "price",
  "rating",
  "stock",
  "promotion",
  "status",
];

/** Caps the API enforces. Clients should mirror them so a merchant is told
 *  before the request rather than after it is rejected. */
export const MAX_RULES_PER_SET = 25;
export const MAX_RULE_VALUE_ENTRIES = 100;

export function isRuleField(name: string): name is RuleField {
  return Object.prototype.hasOwnProperty.call(COLLECTION_RULE_MATRIX, name);
}

/** The operators a field accepts, in display order. Empty for unknown fields. */
export function operatorsForField(field: string): RuleOperator[] {
  if (!isRuleField(field)) return [];
  return Object.keys(
    COLLECTION_RULE_MATRIX[field].operators
  ) as RuleOperator[];
}

/** The value shape a given field/operator pair expects, or undefined if the
 *  field does not accept that operator. */
export function valueKindFor(
  field: string,
  op: string
): RuleValueKind | undefined {
  if (!isRuleField(field)) return undefined;
  const operators = COLLECTION_RULE_MATRIX[field].operators as Record<
    string,
    RuleOperatorSpec
  >;
  return Object.prototype.hasOwnProperty.call(operators, op)
    ? operators[op].value_kind
    : undefined;
}

/** Values a string-valued field is restricted to, if any. */
export function allowedValuesFor(field: string): readonly string[] | undefined {
  if (!isRuleField(field)) return undefined;
  return (
    COLLECTION_RULE_MATRIX[field] as RuleFieldSpec
  ).allowed_values;
}
