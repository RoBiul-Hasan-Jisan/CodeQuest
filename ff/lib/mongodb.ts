import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function getCollection(collectionName: string) {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    if (!client) {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        db = client.db();
        console.log('✅ MongoDB connected');
    }

    return db.collection(collectionName);
}