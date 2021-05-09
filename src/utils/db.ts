
import { MongoClient, Db } from "mongodb";
import config from "../config/convict";

class MongoConnection {
    private db: Db = undefined;
    private mongoClient: MongoClient = undefined;
    private uri: string = config.get("db.uri");
    private dbName: string = config.get("db.name");

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