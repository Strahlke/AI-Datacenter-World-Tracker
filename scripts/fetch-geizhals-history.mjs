import { readFile, writeFile } from "node:fs/promises";

const ENDPOINT = "https://geizhals.de/api/gh0/price_history";
const DAYS = 365;
const CONCURRENCY = 4;
const BASELINE_DAYS = 31;
const MIN_BASELINE_OBSERVATIONS = 14;
const MAX_FORWARD_FILL_DAYS = 7;

const round = (value, digits = 2) => Number(value.toFixed(digits));

const dateFromTimestamp = (timestampMs) => new Date(timestampMs).toISOString().slice(0, 10);

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const average = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function requestHistory({ id, itemcount, referer }, attempt = 1) {
  const body = {
    id,
    params: {
      days: DAYS,
      loc: "de",
    },
    ...(itemcount ? { itemcount } : {}),
  };

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Referer: referer,
      "User-Agent": "AI-Datacenter-World-Tracker/1.0 (+public research dataset)",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (attempt < 3 && response.status >= 500) {
      await sleep(750 * attempt);
      return requestHistory({ id, itemcount, referer }, attempt + 1);
    }
    throw new Error(`Geizhals price history returned ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.response) || !payload.meta) {
    throw new Error("Geizhals price history response has an unexpected shape");
  }
  return payload;
}

async function mapWithConcurrency(items, worker, limit = CONCURRENCY) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function normaliseSeries(rows) {
  return rows.map(([timestampMs, price, pricedItemCount]) => [
    dateFromTimestamp(timestampMs),
    Number.isFinite(price) && price > 0 ? round(price, 4) : null,
    Number.isInteger(pricedItemCount) && pricedItemCount >= 0 ? pricedItemCount : 0,
  ]);
}

function aggregateMonthly(series) {
  const months = new Map();
  for (const [date, price, pricedItemCount] of series) {
    const month = date.slice(0, 7);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push({ date, price, pricedItemCount });
  }

  return [...months.entries()].map(([month, rows]) => {
    const prices = rows.map((row) => row.price).filter(Number.isFinite);
    const lastPriced = [...rows].reverse().find((row) => Number.isFinite(row.price));
    const pricedCounts = rows.map((row) => row.pricedItemCount);
    return {
      month,
      observed_days: rows.length,
      priced_days: prices.length,
      last_price_eur: lastPriced ? round(lastPriced.price) : null,
      average_price_eur: prices.length ? round(average(prices)) : null,
      min_price_eur: prices.length ? round(Math.min(...prices)) : null,
      max_price_eur: prices.length ? round(Math.max(...prices)) : null,
      min_priced_item_count: pricedCounts.length ? Math.min(...pricedCounts) : 0,
      max_priced_item_count: pricedCounts.length ? Math.max(...pricedCounts) : 0,
    };
  });
}

function buildComparableIndex(productSeries) {
  const allDates = [...new Set(productSeries.flatMap((product) => product.series.map(([date]) => date)))].sort();
  const baselineDates = new Set(allDates.slice(0, BASELINE_DAYS));

  const eligible = productSeries
    .map((product) => {
      const baselinePrices = product.series
        .filter(([date, price]) => baselineDates.has(date) && Number.isFinite(price))
        .map(([, price]) => price);
      return {
        ...product,
        baselinePrice: baselinePrices.length >= MIN_BASELINE_OBSERVATIONS ? median(baselinePrices) : null,
        priceByDate: new Map(product.series.map(([date, price]) => [date, price])),
      };
    })
    .filter((product) => Number.isFinite(product.baselinePrice));

  const lastKnown = new Map();
  const lastKnownIndex = new Map();
  const daily = allDates.map((date, dateIndex) => {
    const relatives = [];
    let directlyObserved = 0;

    for (const product of eligible) {
      const directPrice = product.priceByDate.get(date);
      if (Number.isFinite(directPrice)) {
        lastKnown.set(product.article_id, directPrice);
        lastKnownIndex.set(product.article_id, dateIndex);
        directlyObserved += 1;
      }
      const age = dateIndex - (lastKnownIndex.get(product.article_id) ?? -Infinity);
      const usablePrice = Number.isFinite(directPrice)
        ? directPrice
        : age <= MAX_FORWARD_FILL_DAYS
          ? lastKnown.get(product.article_id)
          : null;
      if (Number.isFinite(usablePrice)) relatives.push(usablePrice / product.baselinePrice);
    }

    const coverage = eligible.length ? relatives.length / eligible.length : 0;
    const indexValue = relatives.length && coverage >= 0.7
      ? Math.exp(relatives.reduce((sum, value) => sum + Math.log(value), 0) / relatives.length) * 100
      : null;
    return [date, Number.isFinite(indexValue) ? round(indexValue, 3) : null, relatives.length, directlyObserved];
  });

  return {
    eligible_product_count: eligible.length,
    excluded_product_count: productSeries.length - eligible.length,
    baseline_start: allDates[0] || null,
    baseline_end: allDates[Math.min(BASELINE_DAYS - 1, allDates.length - 1)] || null,
    daily,
  };
}

function aggregateIndexMonthly(series, eligibleProductCount) {
  const months = new Map();
  for (const [date, indexValue, availableProductCount, directlyObservedCount] of series) {
    const month = date.slice(0, 7);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push({ date, indexValue, availableProductCount, directlyObservedCount });
  }

  return [...months.entries()].map(([month, rows]) => {
    const values = rows.map((row) => row.indexValue).filter(Number.isFinite);
    const last = [...rows].reverse().find((row) => Number.isFinite(row.indexValue));
    return {
      month,
      observed_days: rows.length,
      valid_index_days: values.length,
      last_index: last ? round(last.indexValue, 2) : null,
      average_index: values.length ? round(average(values), 2) : null,
      min_index: values.length ? round(Math.min(...values), 2) : null,
      max_index: values.length ? round(Math.max(...values), 2) : null,
      average_direct_coverage: eligibleProductCount
        ? round(average(rows.map((row) => row.directlyObservedCount / eligibleProductCount)), 4)
        : 0,
    };
  });
}

const retailDefinition = JSON.parse(await readFile(new URL("../data/retail-baskets.json", import.meta.url), "utf8"));
const basketConfig = retailDefinition.baskets.map((basket) => ({
  id: basket.id,
  articleIds: basket.geizhals_article_ids,
}));
for (const config of basketConfig) {
  if (!Array.isArray(config.articleIds) || !config.articleIds.length || !config.articleIds.every(Number.isInteger)) {
    throw new Error(`Basket ${config.id}: valid geizhals_article_ids are required in retail-baskets.json`);
  }
}

const observations = JSON.parse(await readFile(new URL("../data/retail-observations.json", import.meta.url), "utf8"));
const latestSnapshot = observations.snapshots.at(-1);
if (!latestSnapshot) throw new Error("No retail observation snapshot found");

const generatedAt = new Date().toISOString();
const rawBaskets = [];
const summaryBaskets = [];

for (const config of basketConfig) {
  const basket = latestSnapshot.baskets.find((candidate) => candidate.basket_id === config.id);
  if (!basket) throw new Error(`Missing basket ${config.id} in retail observations`);
  if (basket.products.length !== config.articleIds.length) {
    throw new Error(`Basket ${config.id}: product count does not match configured Geizhals article IDs`);
  }

  const referer = basket.wishlist_url;
  const basketHistory = await requestHistory({
    id: config.articleIds,
    itemcount: config.articleIds.map(() => 1),
    referer,
  });
  const products = await mapWithConcurrency(config.articleIds, async (articleId, index) => {
    const history = await requestHistory({ id: articleId, referer });
    const observedProduct = basket.products[index];
    return {
      article_id: articleId,
      name: observedProduct.name,
      mpn: observedProduct.mpn,
      meta: history.meta,
      series: normaliseSeries(history.response),
    };
  });

  const basketSeries = normaliseSeries(basketHistory.response);
  const comparableIndex = buildComparableIndex(products);
  rawBaskets.push({
    basket_id: config.id,
    wishlist_name: basket.wishlist_name,
    wishlist_url: basket.wishlist_url,
    article_ids: config.articleIds,
    meta: basketHistory.meta,
    basket_series: basketSeries,
    comparable_index_series: comparableIndex.daily,
    products,
  });
  summaryBaskets.push({
    basket_id: config.id,
    wishlist_name: basket.wishlist_name,
    wishlist_url: basket.wishlist_url,
    target_product_count: config.articleIds.length,
    meta: basketHistory.meta,
    raw_basket_monthly: aggregateMonthly(basketSeries),
    comparable_index: {
      eligible_product_count: comparableIndex.eligible_product_count,
      excluded_product_count: comparableIndex.excluded_product_count,
      baseline_start: comparableIndex.baseline_start,
      baseline_end: comparableIndex.baseline_end,
      baseline_value: 100,
      monthly: aggregateIndexMonthly(comparableIndex.daily, comparableIndex.eligible_product_count),
    },
    products: products.map((product) => ({
      article_id: product.article_id,
      name: product.name,
      mpn: product.mpn,
      meta: product.meta,
      monthly: aggregateMonthly(product.series),
    })),
  });
}

const rawPayload = {
  snapshot_date: observations.snapshot_date,
  generated_at: generatedAt,
  version: 1,
  market: "DE",
  currency: "EUR",
  requested_days: DAYS,
  source: {
    id: "geizhals-public-price-history",
    publisher: "Geizhals",
    endpoint: ENDPOINT,
    access: "public_ui_endpoint_no_credentials",
    price_basis: "lowest_listed_gross_ex_shipping",
    grade: "B",
  },
  baskets: rawBaskets,
};

const productPointCount = rawBaskets.reduce(
  (total, basket) => total + basket.products.reduce((basketTotal, product) => basketTotal + product.series.length, 0),
  0,
);
const basketPointCount = rawBaskets.reduce((total, basket) => total + basket.basket_series.length, 0);
const sourceDates = rawBaskets.flatMap((basket) => basket.basket_series.map(([date]) => date));

const summaryPayload = {
  snapshot_date: observations.snapshot_date,
  generated_at: generatedAt,
  version: 1,
  market: "DE",
  currency: "EUR",
  period_start: sourceDates.sort()[0] || null,
  period_end: sourceDates.sort().at(-1) || null,
  source: rawPayload.source,
  method: {
    grain_raw: "daily lowest listed gross price per current basket product and reconstructed current-basket total",
    basket_history_rule: "Geizhals reconstructs the history for today's fixed wishlist membership; it is not an archive of earlier wishlist membership",
    raw_basket_caveat: "total price changes can be caused by a product losing or regaining offers; priced item count must be read together with the total",
    comparable_index_rule: "equal-weighted geometric mean of product price relatives; baseline is each eligible product's median price in the first 31 days",
    baseline_eligibility_rule: `at least ${MIN_BASELINE_OBSERVATIONS} observed prices in the first ${BASELINE_DAYS} days`,
    missing_price_rule: `last observation carried forward for at most ${MAX_FORWARD_FILL_DAYS} days; index suppressed below 70% product coverage`,
    monthly_rule: "calendar-month summary; partial first and last months remain explicitly visible",
  },
  quality: {
    status: "backfilled_with_caveats",
    basket_count: summaryBaskets.length,
    product_series_count: rawBaskets.reduce((total, basket) => total + basket.products.length, 0),
    raw_basket_daily_points: basketPointCount,
    raw_product_daily_points: productPointCount,
    reconstructed_history: true,
    archived_weekly_snapshots: observations.snapshots.length,
  },
  raw_file: "retail-history-daily.json",
  baskets: summaryBaskets,
};

await writeFile(
  new URL("../data/retail-history-daily.json", import.meta.url),
  `${JSON.stringify(rawPayload)}\n`,
);
await writeFile(
  new URL("../data/retail-history.json", import.meta.url),
  `${JSON.stringify(summaryPayload, null, 2)}\n`,
);

console.log(
  `Geizhals history written: ${summaryBaskets.length} baskets, ${summaryPayload.quality.product_series_count} products, ${basketPointCount} basket points, ${productPointCount} product points.`,
);
