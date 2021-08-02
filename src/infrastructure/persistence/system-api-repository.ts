import axios from 'axios';
import ISystemApiRepository from '../../domain/system-api/i-system-api-repository';
import SystemDto from '../../domain/system-api/system-dto';
import WarningDto from '../../domain/system-api/warning-dto';

const apiRoot = 'http://localhost:3002/api/v1';

export default class SystemApiRepositoryImpl implements ISystemApiRepository {
  
  public getOne = async (
    systemId: string
  ): Promise<SystemDto | null> => {
    try {
      const response = await axios.get(`${apiRoot}/system/${systemId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };

  public postWarning = async (systemId: string, selectorId: string): Promise<WarningDto | null> => {
    try {
      const response = await axios.post(`${apiRoot}/system/${systemId}/warning`, {selectorId});
      const jsonResponse = response.data;
      if (response.status === 201) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
