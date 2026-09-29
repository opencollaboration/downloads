# Downloads

Frontend for the Open Collaboration Maven repository, listing development builds and
download links at <https://dl.opencollab.dev>.

## Getting started

Requires Node.js 24 or newer, matching the container image.

```bash
npm install
npm run dev
```

The development server runs on <http://localhost:3000>. `npm start` serves the
production build on port 8080, which is what the container runs.

## Scripts

| Script               | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Development server                           |
| `npm run build`      | Production build into `.next/standalone`     |
| `npm start`          | Serve that build on `0.0.0.0:8080`           |
| `npm run lint`       | ESLint, add `:fix` to apply fixes            |
| `npm run format`     | Prettier, add `:check` to verify only        |
| `npm run type-check` | Type check without emitting                  |
| `npm test`           | Test suite, add `:watch` or `:coverage`      |
| `npm run ci-checks`  | Type check, lint, format check and the suite |

Husky runs `lint-staged` on commit and `ci-checks` on push. Use `git commit -n` to skip
once, or `HUSKY=0` for a session.

## Layout

```
src/
  app/          Routes (App Router)
  components/   Application components, ui/ holds vendor primitives
  lib/
    maven/      Repository access and parsing
    view/       View models passed to the UI
    projects/   The configured projects
  test/         Tests, mirroring src/
  scripts/      Build tooling
```

Files in `components/` are PascalCase and hold one component each. Everything else is
lowercase. Types live in a `types.ts` beside the code that uses them, except component
props, which stay with their component.

## Adding a project

Add an entry to `navGroups` in `src/lib/projects/registry.ts`. The route, page, home
page card and sidebar navigation all follow from it.

```ts
{
  slug: 'example',
  label: 'Example',
  projectName: 'Example',
  groupId: 'org.example',
  artifactId: 'example-server',
}
```

Use `ignoredVersions` to exclude exact versions, and `acceptedVersions` to restrict the
listing to versions matching a regular expression.

## How it works

Build listings are fetched on the server and revalidated periodically, so upstream
requests are shared rather than repeated per visitor. Builds are paginated, with the
page held in the URL as `?page=`.

PatternFly components must be reached through `src/components/ui/patternfly.ts`, which
is the client boundary.

`test/setup.ts` patches `ResizeObserver`, `clientWidth` and `matchMedia`, which jsdom
lacks and PatternFly depends on. Removing any of them breaks tests in ways that are hard
to trace.
