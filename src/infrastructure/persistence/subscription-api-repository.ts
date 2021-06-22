import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { ISubscriptionApiRepository } from '../../domain/subscription-api/delete-targets';
import Result from '../../domain/value-types/transient-types';

const apiRoot = 'http://localhost:8080/api/v1';

export default class SubscriptionApiRepositoryImpl implements ISubscriptionApiRepository {
  public deleteTargets = async (selectorId: string): Promise<Result<null>> => {
    try {
      const params = new URLSearchParams();
      params.append('selectorId', selectorId);

      await fetch(`${apiRoot}/subscriptions/targets`, {
        method: 'DELETE',
        body: params,
      });
      // if (response.ok) {
      //   const jsonResponse = await response.json();
      //   return jsonResponse;
      // }
      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  };
}
