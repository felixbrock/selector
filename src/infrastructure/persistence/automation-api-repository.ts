import axios from 'axios';
import { URLSearchParams } from 'url';
import { IAutomationApiRepository } from '../../domain/automation-api/delete-subscriptions';
import Result from '../../domain/value-types/transient-types/result';

const apiRoot = 'http://localhost:8080/api/v1';

export default class AutomationApiRepositoryImpl implements IAutomationApiRepository {
  public deleteSubscriptions = async (params: URLSearchParams): Promise<Result<null>> => {
    try {
      const response = await axios.delete(`${apiRoot}/automations/subscriptions`, {params});
      const jsonResponse = response.data;
      if (response.status === 200) return Result.ok<null>();
      throw new Error(jsonResponse);
    } catch (error) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);;
    }
  };
}
