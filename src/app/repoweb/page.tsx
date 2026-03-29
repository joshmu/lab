import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RepoWeb - GitHub Repository Proxy for AI Agents",
  robots: "noindex, nofollow",
};

export default function RepoWebPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">RepoWeb</h1>
        <p className="text-muted-foreground text-lg">
          A proxy that makes GitHub repositories readable by AI agents via plain
          text HTTP responses.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">How to use</h2>
        <div className="bg-muted p-4">
          <code className="text-sm">
            /repoweb/github.com/&#123;owner&#125;/&#123;repo&#125;/&#123;path&#125;
          </code>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Examples</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/repoweb/github.com/sindresorhus/is"
              className="text-primary hover:underline"
            >
              /repoweb/github.com/sindresorhus/is
            </Link>
            <span className="text-muted-foreground ml-2 text-sm">
              — repo root
            </span>
          </li>
          <li>
            <Link
              href="/repoweb/github.com/sindresorhus/is/source"
              className="text-primary hover:underline"
            >
              /repoweb/github.com/sindresorhus/is/source
            </Link>
            <span className="text-muted-foreground ml-2 text-sm">
              — directory
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Response format</h2>
        <p className="text-muted-foreground mb-3 text-sm">
          All responses are <code>text/plain</code>. Files return raw content.
          Directories return a listing.
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 text-sm font-bold">Directory</h3>
            <pre className="bg-muted overflow-x-auto p-3 text-xs">
              {`owner/repo: A short description

src/
test/
README.md (1.2kb)
package.json (482b)`}
            </pre>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-bold">File</h3>
            <pre className="bg-muted overflow-x-auto p-3 text-xs">
              {`import { parse } from "./parser";

export function render(input: string) {
  // raw file content, nothing else
}`}
            </pre>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Rate limits</h2>
        <p className="text-muted-foreground text-sm">
          Uses GitHub&apos;s Contents API. Without a token: 60 req/hr. With{" "}
          <code>GITHUB_TOKEN</code>: 5,000 req/hr. Responses are edge-cached for
          5 minutes.
        </p>
      </section>
    </main>
  );
}
