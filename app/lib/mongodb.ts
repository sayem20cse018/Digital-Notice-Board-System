import { MongoClient, MongoClientOptions } from "mongodb";
import { isDbDisabled } from "./config";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getUri(): string {
  const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "DATABASE_URL is not defined. Add it to .env.local"
    );
  }
  // For local mongodb:// only — add directConnection
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
        // Atlas — longer timeouts for cold starts
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        maxPoolSize: 10,
        minPoolSize: 1,
      }
    : {
        // Local
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
    // Reuse connection in dev to avoid exhausting connection pool on hot reload
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise().catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

  // Production: new connection per serverless invocation (Vercel/Netlify)
  return createClientPromise();
}

export default getClientPromise;

export async function getDb(dbName?: string) {
  const client = await getClientPromise();
  return client.db(dbName); // uses DB name from URI if not specified
}
