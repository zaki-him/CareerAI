import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  return clientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB_NAME || "career_compass_ai");
}
