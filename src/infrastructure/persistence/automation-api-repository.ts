import axios from 'axios';
import { URLSearchParams } from 'url';
import { nodeEnv, port, serviceDiscoveryNamespace } from '../../config';
import { IAutomationApiRepository } from '../../domain/automation-api/delete-subscriptions';
import Result from '../../domain/value-types/transient-types/result';
import discoverIp from '../shared/service-discovery';

export default class AutomationApiRepositoryImpl implements IAutomationApiRepository {
  #getRoot = async (): Promise<string> => {
    const path = 'api/v1';

    if (nodeEnv !== 'production') return `http://localhost:8080/${path}`;

    try {
      const ip = await discoverIp(serviceDiscoveryNamespace, 'automation-service');

      return `http://${ip}:${port}/${path}`;
    } catch (error: any) {
      return Promise.reject(typeof error === 'string' ? error : error.message);
    }
  };

  public deleteSubscriptions = async (params: URLSearchParams): Promise<Result<null>> => {
    try {
      const apiRoot = await this.#getRoot();

      const response = await axios.delete(`${apiRoot}/automations/subscriptions`, {params});
      const jsonResponse = response.data;
      if (response.status === 200) return Result.ok<null>();
      throw new Error(jsonResponse);
    } catch (error: any) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);;
    }
  };
}
