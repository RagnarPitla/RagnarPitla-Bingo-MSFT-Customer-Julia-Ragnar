const { TableClient } = require("@azure/data-tables");

const HEADERS = { "Content-Type": "application/json" };

async function clearTable(connStr, tableName) {
  const client = TableClient.fromConnectionString(connStr, tableName);
  try { await client.createTable(); } catch {}
  const all = [];
  for await (const e of client.listEntities()) all.push(e);
  await Promise.all(all.map(e => client.deleteEntity(e.partitionKey, e.rowKey)));
}

module.exports = async function (context, req) {
  try {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    await Promise.all([
      clearTable(conn, "participants"),
      clearTable(conn, "selections"),
    ]);
    // Reset game state
    const gsClient = TableClient.fromConnectionString(conn, "gamestate");
    try { await gsClient.createTable(); } catch {}
    try {
      await gsClient.updateEntity(
        { partitionKey: "game", rowKey: "state", currentCardIndex: -1, reviewingCardKey: "" },
        "Replace"
      );
    } catch {
      await gsClient.createEntity(
        { partitionKey: "game", rowKey: "state", currentCardIndex: -1, reviewingCardKey: "" }
      );
    }
    context.res = { status: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    context.res = { status: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
