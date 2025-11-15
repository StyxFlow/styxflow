import { QdrantClient } from "@qdrant/js-client-rest";
import config from "../config/index.js";

const client = new QdrantClient({
  url: config.qdrant.url!,
  apiKey: config.qdrant.key!,
});

async function createIndex() {
  try {
    await client.createPayloadIndex("resume", {
      field_name: "metadata.candidateId",
      field_schema: "keyword",
    });
    console.log("✅ Index created for candidateId");
  } catch (error) {
    console.error("❌ Error creating index:", error);
  }
}

createIndex();
