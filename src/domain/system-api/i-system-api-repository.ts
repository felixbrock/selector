import SystemDto from "./system-dto";
import WarningDto from "./warning-dto";

export default interface ISystemApiRepository {
  getSystemById(systemId: string): Promise<SystemDto | null>;
  postWarning(systemId: string): Promise<WarningDto | null>;
  // eslint-disable-next-line semi
}