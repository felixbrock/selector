import { DeleteResult, Document, FindCursor, InsertOneResult, ObjectId, UpdateResult } from 'mongodb';
import { Selector, SelectorProperties } from '../../domain/entities/selector';
import {
  ISelectorRepository,
  SelectorQueryDto,
} from '../../domain/selector/i-selector-repository';
import { Alert } from '../../domain/value-types/alert';
import Result from '../../domain/value-types/transient-types/result';
import { connect, close } from './db/mongo-db';

interface AlertPersistence {
  createdOn: number;
}

interface SelectorPersistence {
  _id: string;
  content: string;
  systemId: string;
  alerts: AlertPersistence[];
  modifiedOn: number;
  // eslint-disable-next-line semi
}

const collectionName = 'selectors';

// TODO - Should Result object should be returned or not?

export default class SelectorRepositoryImpl implements ISelectorRepository {
  public findOne = async (id: string): Promise<Selector | null> => {
    const db = await connect();
    const result: any = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(id) });

    close();

    if (!result) return null;

    return this.#toEntity(this.#buildProperties(result));
  }

  public findBy= async (selectorQueryDto: SelectorQueryDto): Promise<Selector[]> => {
    if (!Object.keys(selectorQueryDto).length) return this.all();

    const db = await connect();
    const result: FindCursor = await db
      .collection(collectionName)
      .find(this.#buildFilter(selectorQueryDto));
    const results = await result.toArray();

    close();

    if (!results || !results.length) return [];

    return results.map((element: any) =>
      this.#toEntity(this.#buildProperties(element))
    );
  }

  #buildFilter = (selectorQueryDto: SelectorQueryDto): any => {
    const filter: { [key: string]: any } = {};

    if (selectorQueryDto.content) filter.content = selectorQueryDto.content;
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
    const db = await connect();
    const result: FindCursor = await db
      .collection(collectionName)
      .find();
    const results = await result.toArray();

    close();

    if (!results || !results.length) return [];

    return results.map((element: any) =>
      this.#toEntity(this.#buildProperties(element))
    );
  }

  public save = async (selector: Selector): Promise<Result<null>> => {
    try {
      const db = await connect();
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(selector));
      
      if(!result.acknowledged) throw new Error('Selector creation failed. Insert not acknowledged');
  
      close();
      
      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  public update = async (selector: Selector): Promise<Result<null>> => {
    try {
      const db = await connect();
      const result: Document | UpdateResult = await db
        .collection(collectionName)
        .updateOne({ _id: new ObjectId(selector.id) }, this.#toPersistence(selector));

      if(!result.acknowledged) throw new Error('Selector update failed. Update not acknowledged');
  
      close();
      
      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  public delete = async (id: string): Promise<Result<null>> => {
    try {
      const db = await connect();
      const result: DeleteResult = await db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(id) });

      if(!result.acknowledged) throw new Error('Selector delete failed. Delete not acknowledged');
  
      close();
      
      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

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
    systemId: selector.systemId,
    modifiedOn: selector.modifiedOn,
    alerts: selector.alerts.map(
      (alert): AlertPersistence => ({
        createdOn: alert.createdOn,
      })
    ),
  });
}
