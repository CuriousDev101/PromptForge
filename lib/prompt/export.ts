/**
 * PromptForge Integration Code Exporters
 * - JavaScript / TypeScript
 */

export interface ExportConfig {
  promptContent: string;
  variableDefaults: Record<string, string>;
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export function exportTypeScript(config: ExportConfig): string {
  const { promptContent, variableDefaults, provider, model, temperature = 0.7, maxTokens = 1000 } = config;
  const varsJson = JSON.stringify(variableDefaults, null, 2);

  if (provider === "anthropic") {
    return `// npm install @anthropic-ai/sdk
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Set in environment
});

// Parameterized variables
const variables: Record<string, string> = ${varsJson};

// System prompt template
const template = ${JSON.stringify(promptContent)};

function renderPrompt(tmpl: string, vars: Record<string, string>): string {
  return tmpl.replace(/\\{\\{\\s*([\\w.-]+)\\s*\\}\\}/g, (_, key) => vars[key] ?? "");
}

async function main() {
  const systemPrompt = renderPrompt(template, variables);

  const response = await anthropic.messages.create({
    model: "${model}",
    max_tokens: ${maxTokens},
    temperature: ${temperature},
    system: systemPrompt,
    messages: [
      { role: "user", content: "Hello! Please follow the system prompt instructions." }
    ],
  });

  console.log(response.content[0]);
}

main().catch(console.error);
`;
  }

  // Default to OpenAI / OpenAI compatible
  return `// npm install openai
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set in environment
});

// Parameterized variables
const variables: Record<string, string> = ${varsJson};

// System prompt template
const template = ${JSON.stringify(promptContent)};

function renderPrompt(tmpl: string, vars: Record<string, string>): string {
  return tmpl.replace(/\\{\\{\\s*([\\w.-]+)\\s*\\}\\}/g, (_, key) => vars[key] ?? "");
}

async function main() {
  const systemPrompt = renderPrompt(template, variables);

  const completion = await openai.chat.completions.create({
    model: "${model}",
    temperature: ${temperature},
    max_tokens: ${maxTokens},
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Hello! Please follow the instructions." },
    ],
  });

  console.log(completion.choices[0].message.content);
}

main().catch(console.error);
`;
}

export function exportPython(config: ExportConfig): string {
  const { promptContent, variableDefaults, provider, model, temperature = 0.7, maxTokens = 1000 } = config;

  // Format variables as python dict
  const varLines = Object.entries(variableDefaults)
    .map(([k, v]) => `    "${k}": "${v.replace(/"/g, '\\"')}",`)
    .join("\n");
  const pyDict = Object.keys(variableDefaults).length > 0 ? `{\n${varLines}\n}` : "{}";

  if (provider === "anthropic") {
    return `# pip install anthropic
import os
import re
from anthropic import Anthropic

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Parameterized variables
variables = ${pyDict}

# System prompt template
template = ${JSON.stringify(promptContent)}

def render_prompt(tmpl: str, vars_dict: dict) -> str:
    return re.sub(r"\\{\\{\\s*([\\w.-]+)\\s*\\}\\}", lambda m: vars_dict.get(m.group(1), ""), tmpl)

def main():
    system_prompt = render_prompt(template, variables)
    
    response = client.messages.create(
        model="${model}",
        max_tokens=${maxTokens},
        temperature=${temperature},
        system=system_prompt,
        messages=[
            {"role": "user", "content": "Hello! Please follow the system prompt instructions."}
        ]
    )
    print(response.content[0].text)

if __name__ == "__main__":
    main()
`;
  }

  // OpenAI Python
  return `# pip install openai
import os
import re
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Parameterized variables
variables = ${pyDict}

# System prompt template
template = ${JSON.stringify(promptContent)}

def render_prompt(tmpl: str, vars_dict: dict) -> str:
    return re.sub(r"\\{\\{\\s*([\\w.-]+)\\s*\\}\\}", lambda m: vars_dict.get(m.group(1), ""), tmpl)

def main():
    system_prompt = render_prompt(template, variables)

    response = client.chat.completions.create(
        model="${model}",
        temperature=${temperature},
        max_tokens=${maxTokens},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Hello! Please follow the instructions."}
        ]
    )
    print(response.choices[0].message.content)

if __name__ == "__main__":
    main()
`;
}

export function exportCurl(config: ExportConfig): string {
  const { promptContent, variableDefaults, provider, model, temperature = 0.7, maxTokens = 1000 } = config;

  // Render the prompt directly for cURL representation
  let rendered = promptContent;
  for (const [k, v] of Object.entries(variableDefaults)) {
    rendered = rendered.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), v);
  }

  if (provider === "anthropic") {
    const payload = {
      model,
      max_tokens: maxTokens,
      temperature,
      system: rendered,
      messages: [{ role: "user", content: "Hello! Please follow the instructions." }],
    };

    return `curl https://api.anthropic.com/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '${JSON.stringify(payload, null, 2).replace(/'/g, "'\\''")}'
`;
  }

  // OpenAI cURL
  const payload = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: rendered },
      { role: "user", content: "Hello! Please follow the instructions." },
    ],
  };

  return `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '${JSON.stringify(payload, null, 2).replace(/'/g, "'\\''")}'
`;
}
