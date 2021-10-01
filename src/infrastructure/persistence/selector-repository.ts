import {
  DeleteResult,
  Document,
  FindCursor,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import { Selector, SelectorProperties } from '../../domain/entities/selector';
import {
  ISelectorRepository,
  SelectorQueryDto,
  SelectorUpdateDto,
} from '../../domain/selector/i-selector-repository';
import { Alert } from '../../domain/value-types/alert';
import Result from '../../domain/value-types/transient-types/result';
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

const collectionName = 'selectors';

// TODO - Should Result object should be returned or not?

export default class SelectorRepositoryImpl implements ISelectorRepository {
  public findOne = async (id: string): Promise<Selector | null> => {
    const client = createClient();
    const db = await connect(client);
    const result: any = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(id) });

    close(client);

    if (!result) return null;

    return this.#toEntity(this.#buildProperties(result));
  };

  public findBy = async (
    selectorQueryDto: SelectorQueryDto
  ): Promise<Selector[]> => {
    if (!Object.keys(selectorQueryDto).length) return this.all();

    const client = createClient();
    const db = await connect(client);
    const result: FindCursor = await db
      .collection(collectionName)
      .find(this.#buildFilter(selectorQueryDto));
    const results = await result.toArray();

    close(client);

    if (!results || !results.length) return [];

    return results.map((element: any) =>
      this.#toEntity(this.#buildProperties(element))
    );
  };

  #buildFilter = (selectorQueryDto: SelectorQueryDto): any => {
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
    const db = await connect(client);
    const result: FindCursor = await db.collection(collectionName).find();
    const results = await result.toArray();

    close(client);

    if (!results || !results.length) return [];

    return results.map((element: any) =>
      this.#toEntity(this.#buildProperties(element))
    );
  };

  public insertOne = async (selector: Selector): Promise<Result<null>> => {
    try {
      const client = createClient();
      const db = await connect(client);
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(selector));

      if (!result.acknowledged)
        throw new Error('Selector creation failed. Insert not acknowledged');

      close(client);

      return Result.ok<null>();
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  };

  public updateOne = async (
    id: string,
    updateDto: SelectorUpdateDto
  ): Promise<Result<null>> => {
    try {
      const client = createClient();
      const db = await connect(client);

      const result: Document | UpdateResult = await db
        .collection(collectionName)
        .updateOne(
          { _id: new ObjectId(id) },
          this.#buildUpdateFilter(updateDto)
        );

      if (!result.acknowledged)
        throw new Error('Selector update failed. Update not acknowledged');

      close(client);

      return Result.ok<null>();
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  };

  #buildUpdateFilter = (
    selectorUpdateDto: SelectorUpdateDto
  ): { [key: string]: any } => {
    const filter: { [key: string]: any } = {};
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

    if (Object.keys(setFilter).length) filter.$set = setFilter;
    if (Object.keys(pushFilter).length) filter.$push = pushFilter;

    return filter;
  };

  public deleteOne = async (id: string): Promise<Result<null>> => {
    try {
      const client = createClient();
      const db = await connect(client);
      const result: DeleteResult = await db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(id) });

      if (!result.acknowledged)
        throw new Error('Selector delete failed. Delete not acknowledged');

      close(client);

      return Result.ok<null>();
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  };

  #toEntity = (selectorProperties: SelectorProperties): Selector => {
    const createSelectorResult: Result<Selector> =
      Selector.create(selectorProperties);

    if (createSelectorResult.error) throw new Error(createSelectorResult.error);
    if (!createSelectorResult.value)
      throw new Error('Selector creation failed');

    return createSelectorResult.value;
  };

  #buildProperties = (selector: SelectorPersistence): SelectorProperties => ({
    // eslint-disable-next-line no-underscore-dangle
    id: selector._id,
    content: selector.content,
    organizationId: selector.organizationId,
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts.map((alert) => {
      const alertResult = Alert.create({ createdOn: alert.createdOn });
      if (alertResult.value) return alertResult.value;
      throw new Error(alertResult.error || `Creation of selector alert failed`);
    }),
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
