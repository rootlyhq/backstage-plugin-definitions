# Rootly Backstage plugin definitions

[![CI](https://github.com/rootlyhq/backstage-plugin-definitions/actions/workflows/ci.yml/badge.svg)](https://github.com/rootlyhq/backstage-plugin-definitions/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)

Example [Backstage catalog](https://backstage.io/docs/features/software-catalog/) definitions used to develop, test and demo the Rootly Backstage integration:

- [`@rootly/backstage-plugin`](https://github.com/rootlyhq/backstage-plugin) — frontend plugin (Rootly page, overview card, incidents page)
- [`@rootly/backstage-plugin-entity-processor`](https://github.com/rootlyhq/backstage-plugin-entity-processor) — catalog processor that syncs entities with Rootly

Each Rootly resource type comes in two flavors: `*-info.yml` carries `rootly.com/*` annotations (entity linked to Rootly), `*-no-annotations-info.yml` has none (entity not linked yet, used to exercise the import/link flows).

| Directory | Backstage kind | Rootly resource | Annotations |
| --- | --- | --- | --- |
| [`definitions/services`](definitions/services) | `Component` | Service | `rootly.com/service-slug`, `rootly.com/service-auto-import` |
| [`definitions/functionalities`](definitions/functionalities) | `System` | Functionality | `rootly.com/functionality-slug`, `rootly.com/functionality-auto-import` |
| [`definitions/teams`](definitions/teams) | `Group` | Team | `rootly.com/team-slug`, `rootly.com/team-auto-import` |
| [`definitions/catalog-entities`](definitions/catalog-entities) | `Component` | Catalog entity | `rootly.com/catalog-slug`, `rootly.com/catalog-entity-slug`, `rootly.com/catalog-entity-auto-import` |
| [`definitions/systems`](definitions/systems) | `System` | — | — |

All definitions use `rootly.com/organization-id: rootly-main`; match it to an organization key under `rootly:` in your `app-config.yaml`. See the [plugin README](https://github.com/rootlyhq/backstage-plugin#annotations) for every supported annotation.

## Usage

Register the definitions in your Backstage `app-config.yaml`:

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/rootlyhq/backstage-plugin-definitions/blob/master/definitions/services/elasticsearch-prod-info.yml
      rules:
        - allow: [Component]
    # ...or a local checkout:
    - type: file
      target: ../../backstage-plugin-definitions/definitions/services/elasticsearch-prod-info.yml
```

Load only one flavor (`-info` or `-no-annotations-info`) of a given entity at a time — both declare the same entity name.

## Development

Requires Node.js 24 and Yarn 4 (see `mise.toml`).

```sh
corepack enable
yarn install
yarn validate   # validates every definition against the Backstage catalog model
```

CI runs `yarn validate` on every pull request.

## License

MIT
