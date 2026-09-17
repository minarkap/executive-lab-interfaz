# Accepted harness plan

Plan id: `434ebdda2d12e72195a3b0a9ba0e57e6171e56ae1f19bc4f89d93223d9ae36a3`

| Kind | Component | Decision | Reason | Reevaluate when |
| --- | --- | --- | --- | --- |
| agent | base-agents | deferred | No substantial software implementation is planned. | substantial software implementation is introduced |
| capability | memory | selected | Local bounded project memory supports continuity without an external account. | — |
| guard | gitmoji-guard | deferred | No selected target and project policy justify this Claude-only commit guard. | Claude Code is selected and a governed software workflow adopts the convention |
| hook | code-hooks | deferred | Code-only gates would add unrelated behavior to this project. | a substantial software workflow is accepted |
| integration | context7 | excluded | External MCP connections require a separate, provider-specific consent flow and are outside this local harness plan. | — |
| route | harness-documents | selected | The accepted profile and plan are persisted under 02-DOCS/wiki/harness/. | — |
| skill | bro | selected | Included in the lightweight foundation for this software project. | — |
| skill | eli5 | selected | Included in the lightweight foundation for this software project. | — |
| skill | harness | selected | Included in the lightweight foundation for this software project. | — |
| skill | init | selected | Included in the lightweight foundation for this software project. | — |
| skill | orient | selected | Included in the lightweight foundation for this software project. | — |
| skill | show-me | selected | Included in the lightweight foundation for this software project. | — |
| skill | suggest | selected | Included in the lightweight foundation for this software project. | — |
| skill | unslop | selected | Included in the lightweight foundation for this software project. | — |
| workflow | sdd | deferred | The software scope is small, so specification overhead is not justified yet. | multiple related features; authentication or persistence; external integrations; cross-cutting changes |
