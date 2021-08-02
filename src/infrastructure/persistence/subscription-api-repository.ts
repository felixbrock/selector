import axios from 'axios';
import { URLSearchParams } from 'url';
import { ISubscriptionApiRepository } from '../../domain/subscription-api/delete-targets';
import Result from '../../domain/value-types/transient-types/result';

const apiRoot = 'http://localhost:8080/api/v1';

export default class SubscriptionApiRepositoryImpl implements ISubscriptionApiRepository {
  public deleteTargets = async (params: URLSearchParams): Promise<Result<null>> => {
    try {
      const response = await axios.delete(`${apiRoot}/subscriptions/targets`, {params});
      const jsonResponse = response.data;
      if (response.status === 200) return Result.ok<null>();
      throw new Error(jsonResponse);
    } catch (error) {
      return Result.fail<null>(error.message);;
    }
  };
}
