import SystemDto from "./system-dto";
import WarningDto from "./warning-dto";

export default interface ISystemApiRepository {
  getOne(systemId: string, jwt: string): Promise<SystemDto>;
  postWarning(systemId: string, selectorId: string, jwt: string): Promise<WarningDto>;
  // eslint-disable-next-line semi
}