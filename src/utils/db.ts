
import { MongoClient, Db } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

class MongoConnection {
    private db: Db = undefined;
    private mongoClient: MongoClient = undefined;
    private uri: string = process.env.MONGODB_URI; // we may implement convict instead of process.env
    private dbName: string = process.env.DB_NAME;

    public async connect(): Promise<Db> {
        if (!this.db) {
            this.mongoClient = await MongoClient.connect(
                this.uri,
                {
                    // autoReconnect: true,
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    // w: "majority"
                },
            );

            this.db = this.mongoClient.db(this.dbName);
        }

        return this.db;
    }

    public async close(): Promise<void> {
        if (this.db) {
            await this.mongoClient.close();
        }
    }

    public get Context() {
        return this.db;
    }
}

// we are creating it only once
export const db = new MongoConnection();