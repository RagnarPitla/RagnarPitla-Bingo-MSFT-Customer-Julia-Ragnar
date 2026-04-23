const { TableClient } = require("@azure/data-tables");

const TABLE = "gamestate";
const PK = "game";
const RK = "state";
const HEADERS = { "Content-Type": "application/json" };

async function getClient() {
  const client = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    TABLE
  );
  try { await client.createTable(); } catch {}
  return client;
}

async function getOrInit(client) {
  try {
    return await client.getEntity(PK, RK);
  } catch {
    const entity = { partitionKey: PK, rowKey: RK, currentCardIndex: -1, reviewingCardKey: "" };
    await client.createEntity(entity);
    return entity;
  }
}

module.exports = async function (context, req) {
  try {
    const client = await getClient();

    if (req.method === "GET") {
      const entity = await getOrInit(client);
      context.res = {
        status: 200,
        headers: HEADERS,
        body: JSON.stringify({
          id: RK,
          current_card_index: entity.currentCardIndex ?? -1,
          reviewing_card_key: entity.reviewingCardKey || null,
        }),
      };

    } else if (req.method === "PATCH") {
      const entity = await getOrInit(client);
      const updates = {};
      if (req.body.current_card_index !== undefined) updates.currentCardIndex = req.body.current_card_index;
      if (req.body.reviewing_card_key !== undefined) updates.reviewingCardKey = req.body.reviewing_card_key || "";
      await client.updateEntity({ partitionKey: PK, rowKey: RK, ...updates }, "Merge");
      const updated = await client.getEntity(PK, RK);
      context.res = {
        status: 200,
        headers: HEADERS,
        body: JSON.stringify({
          id: RK,
          current_card_index: updated.currentCardIndex ?? -1,
          reviewing_card_key: updated.reviewingCardKey || null,
        }),
      };
    }
  } catch (err) {
    context.res = { status: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
