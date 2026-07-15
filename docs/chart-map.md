# Dashboard chart map

| Section | Reader question | Form | Fields | Supported takeaway | Palette | Source |
| --- | --- | --- | --- | --- | --- | --- |
| World map | Where are documented projects and which have the largest documented impact? | Zoomable proportional-symbol map | latitude, longitude, lifecycle status, impact score | Location, status and impact can be explored together; marker size is not a market-total estimate. | Lifecycle categories plus neutral land | `data/projects.json` |
| Sources | Which research queues and cadences have coverage? | Horizontal bars | queue or cadence, source count | Shows the operating shape of the source registry, not source quality by itself. | Single blue root | `data/source-registry.json` |
| Hardware barometer | How has provisional pressure moved over twelve months? | Highlighted multi-series line | month, CHPI, consumer-price sub-index, upstream sub-index, coverage | The composite trend is compared with two interpretable drivers across twelve observations. | Neutral composite plus green and teal comparators; line style also distinguishes series | `data/hardware-history.json` |
| Barometer drivers | Which components carry the current score and how complete are they? | Paired progress bars | component, weight, coverage, component score | Weight and evidence coverage remain distinct; missing availability is visible. | Blue weight and green coverage | `data/hardware-barometer.json` |
| Retail tracking | Are the versioned baskets observable today? | KPI cards with coverage bars | basket, SKU count, available count, summed individual best prices | First direct snapshot covers 39 of 40 SKUs; it is not yet a time-series or one-merchant checkout price. | Single green root plus neutrals | `data/retail-observations.json` |

The supply-chain page is a staged navigation and disclosure interface rather than a quantitative chart. Exposure labels come from `data/supply-chain.json`; they do not claim measured causal price effects.
