import {Db, MongoClient} from "mongodb";

// Reuse client across hot reloads in Next.js dev
let _client: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    if (_client && (await isClientHealthy(_client))) return _client;
    _client = new MongoClient(uri, {});
    await _client.connect();
    return _client;
}

async function isClientHealthy(client: MongoClient) {
    try {
        await client.db("admin").command({ping: 1});
        return true;
    } catch {
        return false;
    }
}

export async function getDb(): Promise<Db> {
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB || "intellitrader";
    return client.db(dbName);
}
