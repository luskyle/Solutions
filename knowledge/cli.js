#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KnowledgeBase } from './core.js';
import { extractDocument, localEndpoint } from './model.js';
import { startServer } from './server.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const HELP = `Solutions Knowledge — local-first knowledge explorer

Usage: npm run kb -- <command> [arguments] [options]

  import [directory]     Import supported files (default: repository docs/)
  list                   List imported documents and IDs
  search <query>         Find source chunks, including Chinese text
  show <document-id>     Show source and evidence
  graph <document-id>    Export a local graph as JSON
  remove <document-id>   Remove a source and its derived data
  extract <document-id>  Extract unverified assertions with local Ollama
  review <id> <status>   Set assertion status: accepted, rejected, pending
  serve                  Open the local browser service (default command)

Options:
  --db <filename>        SQLite database (default: .knowledge/knowledge.sqlite)
  --port <number>        Browser port (default: 4317; 0 chooses a free port)
  --model <name>         Explicitly enable an installed local Ollama model
  --ollama <origin>      Loopback HTTP origin (default: http://127.0.0.1:11434)
  --legacy-encoding gb18030
                         Explicit fallback for non-UTF-8 Chinese files
  --include-pending      Include unverified AI assertions in graph JSON
  --help                 Show this help

No content is sent to a model unless extract is explicitly requested.
Import is additive: missing files are not silently deleted. Use remove.
`;

function argumentsFor(argv) {
  const options = {};
  const positional = [];
  for (let index = 0; index < argv.length; index++) {
    const value = argv[index];
    if (['--help', '--include-pending'].includes(value)) options[value.slice(2)] = true;
    else if (['--db', '--port', '--model', '--ollama', '--legacy-encoding'].includes(value)) {
      const next = argv[++index];
      if (!next || next.startsWith('--')) throw new Error(`Missing value for ${value}`);
      options[value.slice(2)] = next;
    } else if (value.startsWith('--')) throw new Error(`Unknown option: ${value}`);
    else positional.push(value);
  }
  return { options, positional };
}

let kb;
try {
  const { options, positional } = argumentsFor(process.argv.slice(2));
  if (options.help) {
    console.log(HELP);
  } else {
    const [command = 'serve', ...args] = positional;
    const arities = { import: [0, 1], list: [0, 0], search: [1, 1], show: [1, 1], graph: [1, 1],
      remove: [1, 1], extract: [1, 1], review: [2, 2], serve: [0, 0] };
    const arity = arities[command];
    if (!arity || args.length < arity[0] || args.length > arity[1]) throw new Error(`Invalid command or arguments. ${HELP}`);
    const endpoint = localEndpoint(options.ollama || 'http://127.0.0.1:11434');
    kb = await KnowledgeBase.open(options.db || path.join(ROOT, '.knowledge', 'knowledge.sqlite'));
    let result;
    switch (command) {
      case 'import':
        result = await kb.importDirectory(args[0] || path.join(ROOT, 'docs'), { legacyEncoding: options['legacy-encoding'] });
        if (result.failed.length) process.exitCode = 1;
        break;
      case 'list': result = kb.list(); break;
      case 'search': result = kb.search(args[0]); break;
      case 'show': result = kb.document(args[0]); break;
      case 'graph': result = kb.graph({ documentId: args[0], includePending: Boolean(options['include-pending']) }); break;
      case 'remove': result = kb.remove(args[0]); break;
      case 'review': result = kb.review(args[0], args[1]); break;
      case 'extract': result = await extractDocument(kb, args[0], { model: options.model, endpoint }); break;
      case 'serve': {
        const { server, origin } = await startServer(kb, {
          port: options.port === undefined ? 4317 : Number(options.port),
          importRoot: path.join(ROOT, 'docs'), model: options.model, endpoint,
        });
        console.log(`Knowledge explorer: ${origin}\nDatabase stays local. AI: ${options.model || 'disabled'}\nPress Ctrl+C to stop.`);
        const shutdown = () => {
          server.close(() => {
            kb.close();
            process.exitCode = 0;
          });
          server.closeIdleConnections();
        };
        process.once('SIGINT', shutdown);
        process.once('SIGTERM', shutdown);
        break;
      }
    }
    if (command !== 'serve') {
      console.log(JSON.stringify(result, null, 2));
      kb.close();
    }
  }
} catch (error) {
  console.error(`Knowledge error: ${error.message}`);
  kb?.close();
  process.exitCode = 1;
}
