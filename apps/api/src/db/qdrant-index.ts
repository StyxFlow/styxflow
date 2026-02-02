import { QdrantClient } from "@qdrant/js-client-rest";
import config from "../config/index.js";

const client = new QdrantClient({
  url: config.qdrant.url!,
  apiKey: config.qdrant.key!,
});

async function setupCollection() {
  const collectionName = "resume";

  try {
    // Check if collection exists
    const collections = await client.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName,
    );

    if (exists) {
      console.log(`Collection "${collectionName}" already exists. Deleting...`);
      await client.deleteCollection(collectionName);
    }

    // Create collection with proper vector config for all-MiniLM-L6-v2 (384 dimensions)
    await client.createCollection(collectionName, {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    });
    console.log(
      `✅ Collection "${collectionName}" created with 384-dim vectors`,
    );

    // Create payload index for candidateId
    await client.createPayloadIndex(collectionName, {
      field_name: "metadata.candidateId",
      field_schema: "keyword",
    });
    console.log("✅ Index created for candidateId");
  } catch (error) {
    console.error("❌ Error setting up collection:", error);
  }
}

setupCollection();
