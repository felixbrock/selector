import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import { appConfig } from '../../../config';

const client = new MongoClient(appConfig.mongodb.url, { serverApi: ServerApiVersion.v1 });

export const connect = async (): Promise<Db> => {
  await client.connect();
  return client.db(appConfig.mongodb.dbName);
};

export const close = async (): Promise<void> => client.close();
