import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';
import { IAutomationApiRepository } from '../../domain/automation-api/delete-subscriptions';
import Result from '../../domain/value-types/transient-types/result';
import getRoot from '../shared/api-root-builder';

export default class AutomationApiRepositoryImpl
  implements IAutomationApiRepository
{
  #path = 'api/v1';

  #serviceName = 'automation';

  #port = '8080';

  public deleteSubscriptions = async (
    params: URLSearchParams,
    jwt: string
  ): Promise<Result<null>> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const config: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${jwt}` },
        params,
      };

      const response = await axios.delete(
        `${apiRoot}/automations/subscriptions`,
        config
      );
      const jsonResponse = response.data;
      if (response.status === 200) return Result.ok<null>();
      throw new Error(jsonResponse);
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  };
}
