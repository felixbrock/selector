import {
  DeleteResult,
  Document,
  FindCursor,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import sanitize from 'mongo-sanitize';
import { Selector, SelectorProperties } from '../../domain/entities/selector';
import {
  ISelectorRepository,
  SelectorQueryDto,
  SelectorUpdateDto,
} from '../../domain/selector/i-selector-repository';
import { Alert } from '../../domain/value-types/alert';
import { connect, close, createClient } from './db/mongo-db';

interface AlertPersistence {
  createdOn: number;
}

interface SelectorPersistence {
  _id: string;
  content: string;
  organizationId: string;
  systemId: string;
  alerts: AlertPersistence[];
  modifiedOn: number;
}

interface AlertsQueryFilter {
  createdOn?: { [key: string]: number };
}

interface SelectorQueryFilter {
  content?: string;
  organizationId?: string;
  systemId?: string;
  modifiedOn?: { [key: string]: number };
  alerts?: AlertsQueryFilter;
}

interface SelectorUpdateFilter {
  $set: { [key: string]: any };
  $push: { [key: string]: any };
}

const collectionName = 'selectors';

export default class SelectorRepositoryImpl implements ISelectorRepository {
  public findOne = async (id: string): Promise<Selector | null> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: any = await db
        .collection(collectionName)
        .findOne({ _id: new ObjectId(sanitize(id)) });

      close(client);

      if (!result) return null;

      return this.#toEntity(this.#buildProperties(result));
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public findBy = async (
    selectorQueryDto: SelectorQueryDto
  ): Promise<Selector[]> => {
    try {
      if (!Object.keys(selectorQueryDto).length) return await this.all();

      const client = createClient();

      const db = await connect(client);
      const result: FindCursor = await db
        .collection(collectionName)
        .find(this.#buildFilter(sanitize(selectorQueryDto)));
      const results = await result.toArray();

      close(client);

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #buildFilter = (selectorQueryDto: SelectorQueryDto): SelectorQueryFilter => {
    const filter: { [key: string]: any } = {};

    if (selectorQueryDto.content) filter.content = selectorQueryDto.content;
    if (selectorQueryDto.organizationId)
      filter.organizationId = selectorQueryDto.organizationId;
    if (selectorQueryDto.systemId) filter.systemId = selectorQueryDto.systemId;

    const modifiedOnFilter: { [key: string]: number } = {};
    if (selectorQueryDto.modifiedOnStart)
      modifiedOnFilter.$gte = selectorQueryDto.modifiedOnStart;
    if (selectorQueryDto.modifiedOnEnd)
      modifiedOnFilter.$lte = selectorQueryDto.modifiedOnEnd;
    if (Object.keys(modifiedOnFilter).length)
      filter.modifiedOn = modifiedOnFilter;

    if (!selectorQueryDto.alert || !Object.keys(selectorQueryDto.alert).length)
      return filter;

    const alertCreatedOnFilter: { [key: string]: number } = {};
    if (selectorQueryDto.alert.createdOnStart)
      alertCreatedOnFilter.$gte = selectorQueryDto.alert.createdOnStart;
    if (selectorQueryDto.alert.createdOnEnd)
      alertCreatedOnFilter.$lte = selectorQueryDto.alert.createdOnEnd;
    if (Object.keys(alertCreatedOnFilter).length)
      filter['alerts.createdOn'] = alertCreatedOnFilter;

    return filter;
  };

  public all = async (): Promise<Selector[]> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: FindCursor = await db.collection(collectionName).find();
      const results = await result.toArray();

      close(client);

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public insertOne = async (selector: Selector): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(sanitize(selector)));

      if (!result.acknowledged)
        throw new Error('Selector creation failed. Insert not acknowledged');

      close(client);

      return result.insertedId.toHexString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public updateOne = async (
    id: string,
    updateDto: SelectorUpdateDto
  ): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);

      const result: Document | UpdateResult = await db
        .collection(collectionName)
        .updateOne(
          { _id: new ObjectId(sanitize(id)) },
          this.#buildUpdateFilter(sanitize(updateDto))
        );

      if (!result.acknowledged)
        throw new Error('Selector update failed. Update not acknowledged');

      close(client);

      return result.upsertedId;
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #buildUpdateFilter = (
    selectorUpdateDto: SelectorUpdateDto
  ): SelectorUpdateFilter => {
    const setFilter: { [key: string]: any } = {};
    const pushFilter: { [key: string]: any } = {};

    if (selectorUpdateDto.content)
      setFilter.content = selectorUpdateDto.content;
    if (selectorUpdateDto.organizationId)
      setFilter.organizationId = selectorUpdateDto.organizationId;
    if (selectorUpdateDto.systemId)
      setFilter.systemId = selectorUpdateDto.systemId;
    if (selectorUpdateDto.modifiedOn)
      setFilter.modifiedOn = selectorUpdateDto.modifiedOn;

    if (selectorUpdateDto.alert)
      pushFilter.alerts = this.#alertToPersistence(selectorUpdateDto.alert);

    return { $set: setFilter, $push: pushFilter };
  };

  public deleteOne = async (id: string): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: DeleteResult = await db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(sanitize(id)) });

      if (!result.acknowledged)
        throw new Error('Selector delete failed. Delete not acknowledged');

      close(client);

      return result.deletedCount.toString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #toEntity = (selectorProperties: SelectorProperties): Selector =>
    Selector.create(selectorProperties);

  #buildProperties = (selector: SelectorPersistence): SelectorProperties => ({
    // eslint-disable-next-line no-underscore-dangle
    id: selector._id,
    content: selector.content,
    organizationId: selector.organizationId,
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts.map((alert) =>
      Alert.create({ createdOn: alert.createdOn })
    ),
  });

  #toPersistence = (selector: Selector): Document => ({
    _id: ObjectId.createFromHexString(selector.id),
    content: selector.content,
    organizationId: selector.organizationId,
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts.map(
      (alert): AlertPersistence => this.#alertToPersistence(alert)
    ),
  });

  #alertToPersistence = (alert: Alert): AlertPersistence => ({
    createdOn: alert.createdOn,
  });
}
