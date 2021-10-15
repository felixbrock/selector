import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';
import { IAutomationApiRepository } from '../../domain/automation-api/delete-subscriptions';
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
  ): Promise<string> => {
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
      if (response.status === 200) return jsonResponse.response.data.message;
      throw new Error(jsonResponse.message);
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };
}
