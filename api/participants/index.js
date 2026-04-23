const { TableClient } = require("@azure/data-tables");
const { randomUUID } = require("crypto");

const TABLE = "participants";
const PK = "game";
const HEADERS = { "Content-Type": "application/json" };

async function getClient() {
  const client = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    TABLE
  );
  try { await client.createTable(); } catch {}
  return client;
}

module.exports = async function (context, req) {
  try {
    const client = await getClient();

    if (req.method === "GET") {
      const rows = [];
      for await (const e of client.listEntities()) {
        rows.push({ id: e.rowKey, name: e.name, company: e.company, role: e.role, created_at: e.createdAt });
      }
      context.res = { status: 200, headers: HEADERS, body: JSON.stringify(rows) };

    } else if (req.method === "POST") {
      const { name, company, role } = req.body;
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      await client.createEntity({ partitionKey: PK, rowKey: id, name, company, role, createdAt });
      context.res = { status: 201, headers: HEADERS, body: JSON.stringify({ id, name, company, role, created_at: createdAt }) };

    } else if (req.method === "DELETE") {
      const all = [];
      for await (const e of client.listEntities()) all.push(e);
      await Promise.all(all.map(e => client.deleteEntity(e.partitionKey, e.rowKey)));
      context.res = { status: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }
  } catch (err) {
    context.res = { status: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
