/**
 * PromptForge Variable Extraction & Rendering Utilities
 */

// Matches {{identifier}} where identifier can contain alphanumeric, underscore, dot, hyphen
export const VARIABLE_REGEX = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

// Matches incomplete or unclosed {{... patterns for syntax linting
export const UNCLOSED_VARIABLE_REGEX = /\{\{(?![^}]*\}\})/g;

export interface ExtractedVariable {
  name: string;
  firstSeenIndex: number;
}

export interface RenderResult {
  rendered: string;
  missing: string[];
  extracted: string[];
  hasMissing: boolean;
}

/**
 * Extracts unique variable identifiers from template text in order of first appearance.
 */
export function extractVariables(template: string): string[] {
  if (!template) return [];

  const seen = new Set<string>();
  const variables: string[] = [];
  const regex = new RegExp(VARIABLE_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    const rawName = match[1];
    if (rawName) {
      const name = rawName.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        variables.push(name);
      }
    }
  }

  return variables;
}

/**
 * Validates prompt syntax and detects incomplete placeholders (e.g. unclosed {{).
 */
export function validatePromptSyntax(template: string): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (!template) return { isValid: true, warnings };

  // Check unclosed braces
  const openCount = (template.match(/\{\{/g) || []).length;
  const closeCount = (template.match(/\}\}/g) || []).length;

  if (openCount !== closeCount) {
    warnings.push(
      `Mismatched placeholder braces: found ${openCount} opening '{{' and ${closeCount} closing '}}'.`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Substitutes variable values into the template.
 * Unresolved placeholders are highlighted or preserved according to options.
 */
export function renderPrompt(
  template: string,
  values: Record<string, string>,
  options: { preserveUnresolved?: boolean } = { preserveUnresolved: true }
): RenderResult {
  const extracted = extractVariables(template);
  const missing: string[] = [];

  for (const v of extracted) {
    const val = values[v];
    if (val === undefined || val === null || val.trim() === "") {
      missing.push(v);
    }
  }

  const rendered = template.replace(VARIABLE_REGEX, (match, rawName) => {
    const name = rawName.trim();
    const val = values[name];
    if (val !== undefined && val !== null && val !== "") {
      return val;
    }
    return options.preserveUnresolved ? match : "";
  });

  return {
    rendered,
    missing,
    extracted,
    hasMissing: missing.length > 0,
  };
}
