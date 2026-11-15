import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import config from "../config/index.js";

let vectorStoreInstance: QdrantVectorStore | null = null;
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: config.huggingface.api_key!,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const COLLECTION_NAME = "resume";
const VECTOR_SIZE = 384; // all-MiniLM-L6-v2 produces 384-dim vectors

async function ensureCollectionExists() {
  const client = new QdrantClient({
    url: config.qdrant.url!,
    apiKey: config.qdrant.key!,
  });

  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === COLLECTION_NAME,
    );

    if (!exists) {
      console.log(`Collection "${COLLECTION_NAME}" not found, creating...`);
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      console.log(`✅ Collection "${COLLECTION_NAME}" created`);

      // Create index for candidateId
      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: "metadata.candidateId",
        field_schema: "keyword",
      });
      console.log("✅ Index created for candidateId");
    }
  } catch (error) {
    console.error("Error ensuring collection exists:", error);
    throw error;
  }
}

export const connectQdrant = async () => {
  try {
    await ensureCollectionExists();

    const url = config.qdrant.url?.replace(":6333", "").replace(":6334", "");
    vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: url!,
        collectionName: COLLECTION_NAME,
        apiKey: config.qdrant.key!,
        contentPayloadKey: "content",
      },
    );
    console.log("✅ Qdrant vector store connected");
  } catch (error) {
    console.error("❌ Failed to connect to Qdrant:", error);
    // Don't crash the server, just log the error
    console.warn(
      "⚠️ Server will continue without Qdrant. Resume features may not work.",
    );
  }
};

export const getVectorStore = async (): Promise<QdrantVectorStore> => {
  if (vectorStoreInstance) {
    return vectorStoreInstance;
  }
  try {
    await ensureCollectionExists();

    vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: config.qdrant.url!,
        collectionName: COLLECTION_NAME,
        apiKey: config.qdrant.key!,
        contentPayloadKey: "content",
      },
    );
    console.log("✅ Qdrant vector store connected");
    return vectorStoreInstance;
  } catch (error) {
    console.error("❌ Failed to connect to Qdrant:", error);
    throw new Error("Failed to initialize vector store");
  }
};
