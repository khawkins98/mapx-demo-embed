# MapX demo embed

Explore disaster risk reduction maps through a kitchen-sink SDK demo, a guided
story, a data explorer and a metrics hub, styled with UNDRR Mangrove.

This is an unofficial investigation prototype, not an official UNDRR product or
a production service. Custom overlays (offices, monitoring stations, project
zones and damage events) and Metrics Hub figures are synthetic. MapX layers come
from their third-party sources.

[Open the hosted demos](https://khawkins98.github.io/mapx-demo-embed/). Enter PIN
**5498** and select **Unlock** or press Enter. Access is remembered across the
demos and browser tabs. The PIN is a preview notice, not authentication.

## Run locally

Use Node.js 24.15 or later in the 24 LTS series. `.nvmrc` selects that major when
using nvm. From the repository root:

```sh
npm ci
npm run dev
```

Open **http://localhost:3001/mapx-demo-embed/** and use the same preview PIN. If
Vite selects another port, use the URL it prints. The pages need network access
for Mangrove assets, MapX and other remote content; a build does not bundle those
services for offline use. Leave the dev terminal running while using the demos;
stop it with Ctrl+C.

## Choose a demo

Routes are relative to `/mapx-demo-embed/` locally and on GitHub Pages.

| Demo | Route | Try it for |
| --- | --- | --- |
| Kitchen sink | `demos/kitchen-sink/` | Views, scenarios, custom overlays and analysis tools |
| Risk to resilience | `demos/story/` | Step-by-step map and narrative transitions |
| Data explorer | `demos/explorer/` | Queries and analysis with fictional damage events |
| Metrics hub | `demos/metrics/` | Scrolling charts, country profiles and map actions |

The primary map project is [Eco-DRR](https://app.mapx.org/?project=MX-2LD-FBB-58N-ROK-8RH&language=en&theme=color_light).
For layer IDs and types, see the maintained [view catalogue](src/config/views.js).

## Build and check

Stop the dev server with Ctrl+C, or open another terminal. After installing
dependencies:

```sh
npm run build
npm test
npm run preview
```

The build writes `dist/`. Open the preview URL printed by Vite, normally
**http://localhost:4173/mapx-demo-embed/**. Preview also runs until Ctrl+C.
Deployment uses the GitHub Pages workflow. [Contributor checks](CONTRIBUTING.md#checks) cover Playwright setup,
the CI browser subset and live MapX tests.

## Work on the integration

- [Integration guide](docs/integration.md): SDK setup, overlays, inspection,
  analysis limits, runtime compatibility and Mangrove preview access.
- [Contributing](CONTRIBUTING.md): change and review workflow, documentation
  maintenance and contribution conventions.
- [Investigation record](methodology.md): original experiments and their limits;
  historical examples are marked and include corrections.
- [Decision record](LEARNINGS.md): why the demo uses its current integration
  patterns and where those lessons came from.
- [Metrics concept brief](docs/risk-to-resilience-pitch.md): the proposed audience
  and story arc, including ideas that the prototype does not implement.

Project-authored code and documentation use [Apache-2.0](LICENSE).
[NOTICE](NOTICE) explains third-party content exclusions, including UNDRR assets
and embedded datasets. Check those terms before reusing the content.
