import fetch from 'node-fetch';
import ISystemApiRepository from '../../domain/system-api/i-system-api-repository';
import SystemDto from '../../domain/system-api/system-dto';
import WarningDto from '../../domain/system-api/warning-dto';

const apiRoot = 'http://localhost:3002/api/v1';

export default class SystemApiRepositoryImpl implements ISystemApiRepository {
  public getOne = async (systemId: string): Promise<SystemDto | null> => {
    try {
      const response = await fetch(`${apiRoot}/system/${systemId}`);
      if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  public postWarning = async (systemId: string): Promise<WarningDto | null> => {
    try {
      const response = await fetch(`${apiRoot}/system/${systemId}/warning`, {method: 'POST'});
      if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
}
