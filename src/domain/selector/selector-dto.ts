import { AlertDto, buildAlertDto } from '../alert/alert-dto';
import { Selector } from '../entities';

export interface SelectorDto {
  id: string;
  content: string;
  systemId: string;
  modifiedOn: number;
  alerts: AlertDto[];
}

export const buildSelectorDto = (selector: Selector): SelectorDto => ({
  id: selector.id,
  alerts: selector.alerts.map((alert): AlertDto => buildAlertDto(alert)),
  modifiedOn: selector.modifiedOn,
  content: selector.content,
  systemId: selector.systemId,
});
