# n8n-nodes-mq

n8n community node for processing Markdown using the **mq** query language.

[mq](https://github.com/harehare/mq) is a jq-like tool for Markdown - slice, filter, map, and transform structured data from Markdown files.

## Features

- **Query**: Run mq queries on Markdown content (extract headers, code blocks, lists, etc.)
- **Extract Sections**: Split matching sections into separate n8n items
- **Format Query**: Format mq query strings
- **Validate Query**: Check if mq queries are valid

## Installation

### In n8n (Community Nodes)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-mq`
4. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-mq
```

## Operations

### Query

Run an mq query and get the result as a string.

**Parameters:**
- **Markdown Content**: The Markdown to process
- **Query**: The mq query (e.g., `.h`, `.h2`, `.code`)
- **Input Format**: markdown, mdx, or html
- **Output Field**: Name of the result field

### Extract Sections

Extract matching sections as separate items - useful for batch processing.

**Parameters:**
- **Markdown Content**: The Markdown to process
- **Query**: The mq query
- **Split By**: How to split (line breaks or single items)

### Format Query

Format an mq query string for readability.

### Validate Query

Check if a query is valid and get diagnostic information.

## Query Examples

| Query | Description |
|-------|-------------|
| `.h` | All headers |
| `.h1` | Only h1 headers |
| `.h2` | Only h2 headers |
| `.code` | All code blocks |
| `.blockquote` | All blockquotes |
| `.link` | All links |
| `.h2 \| select(contains("API"))` | h2 headers containing "API" |

## Example Workflow

```
[HTTP Request] → [MQ: .h2] → [Extract Sections] → [For Each Item]
     ↓              ↓              ↓                    ↓
  Fetch doc    Query headers   Split items     Process each header
```

## Requirements

- n8n version 1.0.0 or later
- No external dependencies (uses WebAssembly)

## License

MIT

## Credits

- [mq](https://github.com/harehare/mq) by harehare - The underlying Markdown query tool
- Built with [n8n](https://n8n.io)
