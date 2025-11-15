import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";
import config from "../config/index.js";

let vectorStoreInstance: QdrantVectorStore | null = null;
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: config.huggingface.api_key!,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

export const connectQdrant = async () => {
  vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: config.qdrant.url!,
      collectionName: "resume",
      apiKey: config.qdrant.key!,
    }
  );
  console.log("✅ Qdrant vector store connected");
};

export const getVectorStore = async (): Promise<QdrantVectorStore> => {
  if (vectorStoreInstance) {
    return vectorStoreInstance;
  }
  try {
    vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: config.qdrant.url!,
        collectionName: "resume",
        apiKey: config.qdrant.key!,
      }
    );
    console.log("✅ Qdrant vector store connected");
    return vectorStoreInstance;
  } catch (error) {
    console.error("❌ Failed to connect to Qdrant:", error);
    throw new Error("Failed to initialize vector store");
  }
};
