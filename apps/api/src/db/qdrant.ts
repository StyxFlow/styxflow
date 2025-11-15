import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";
import config from "../config/index.js";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: config.huggingface.api_key!,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});
export const vectorStore = await QdrantVectorStore.fromExistingCollection(
  embeddings,
  {
    url: config.qdrant.url!,
    collectionName: "resume",
    apiKey: config.qdrant.key!,
  }
);
