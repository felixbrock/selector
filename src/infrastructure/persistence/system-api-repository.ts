import axios from 'axios';
import { nodeEnv, serviceDiscoveryNamespace } from '../../config';
import ISystemApiRepository from '../../domain/system-api/i-system-api-repository';
import SystemDto from '../../domain/system-api/system-dto';
import WarningDto from '../../domain/system-api/warning-dto';
import { DiscoveredService, discoverService } from '../shared/service-discovery';

export default class SystemApiRepositoryImpl implements ISystemApiRepository {
  #getRoot = async (): Promise<string> => {
    const path = 'api/v1';

    if (nodeEnv !== 'production') return `http://localhost:3002/${path}`;

    try {
      const discoveredService : DiscoveredService = await discoverService(
        serviceDiscoveryNamespace,
        'system-service'
      );

      return `http://${discoveredService.ip}:${discoveredService.port}/${path}`;
    } catch (error: any) {
      return Promise.reject(typeof error === 'string' ? error : error.message);
    }
  };

  public getOne = async (systemId: string): Promise<SystemDto | null> => {
    try {
      const apiRoot = await this.#getRoot();

      const response = await axios.get(`${apiRoot}/system/${systemId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };

  public postWarning = async (
    systemId: string,
    selectorId: string
  ): Promise<WarningDto | null> => {
    try {
      const apiRoot = await this.#getRoot();

      const response = await axios.post(
        `${apiRoot}/system/${systemId}/warning`,
        { selectorId }
      );
      const jsonResponse = response.data;
      if (response.status === 201) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
