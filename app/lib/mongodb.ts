import { MongoClient, MongoClientOptions } from "mongodb";
import { isDbDisabled } from "./config";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getUri(): string {
  const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("DATABASE_URL is not defined. Add it to .env.local");
  }
  if (
    uri.startsWith("mongodb://") &&
    !uri.includes("directConnection=") &&
    (uri.includes("localhost") || uri.includes("127.0.0.1"))
  ) {
    const sep = uri.includes("?") ? "&" : "?";
    return `${uri}${sep}directConnection=true`;
  }
  return uri;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = getUri();
  const isAtlas = uri.startsWith("mongodb+srv");

  const options: MongoClientOptions = isAtlas
    ? {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        maxPoolSize: 3,
        minPoolSize: 0,
        // Do NOT explicitly set tls:true — the driver handles this from mongodb+srv
        // Setting it can cause TLS handshake conflicts on some Node.js versions
        retryWrites: true,
        retryReads: true,
      }
    : {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 20000,
        directConnection: true,
      };

  const client = new MongoClient(uri, options);
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> {
  if (isDbDisabled()) {
    return Promise.reject(new Error("Database is disabled (SKIP_DB=1)."));
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise().catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

  // Production (Vercel): fresh connection per invocation
  return createClientPromise();
}

export default getClientPromise;

export async function getDb(dbName?: string) {
  const client = await getClientPromise();
  return client.db(dbName);
}
