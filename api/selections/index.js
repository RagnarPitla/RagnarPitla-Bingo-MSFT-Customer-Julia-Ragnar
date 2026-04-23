const { TableClient } = require("@azure/data-tables");

const TABLE = "selections";
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
        rows.push({ participant_id: e.participantId, agent_key: e.agentKey });
      }
      context.res = { status: 200, headers: HEADERS, body: JSON.stringify(rows) };

    } else if (req.method === "POST") {
      const { participant_id, agent_key } = req.body;
      const rowKey = `${participant_id}_${agent_key}`;
      await client.upsertEntity({ partitionKey: PK, rowKey, participantId: participant_id, agentKey: agent_key }, "Replace");
      context.res = { status: 201, headers: HEADERS, body: JSON.stringify({ ok: true }) };

    } else if (req.method === "DELETE") {
      const { participantId, agentKey } = req.query;
      if (participantId && agentKey) {
        // Delete specific selection
        try {
          await client.deleteEntity(PK, `${participantId}_${agentKey}`);
        } catch {}
      } else {
        // Delete all selections
        const all = [];
        for await (const e of client.listEntities()) all.push(e);
        await Promise.all(all.map(e => client.deleteEntity(e.partitionKey, e.rowKey)));
      }
      context.res = { status: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }
  } catch (err) {
    context.res = { status: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
