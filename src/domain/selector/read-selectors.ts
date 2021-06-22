import { Selector } from '../entities';
import IUseCase from '../services/use-case';
import AlertDto from '../alert/alert-dto';
import Result from '../value-types/transient-types';
import ISelectorRepository from './i-selector-repository';
import SelectorDto from './selector-dto';
import { Alert } from '../value-types';

export type ReadSelectorsResponseDto = Result<SelectorDto[] | null>;

export class ReadSelectors
  implements IUseCase<undefined, ReadSelectorsResponseDto>
{
  #selectorRepository: ISelectorRepository;

  public constructor(selectorRepository: ISelectorRepository) {
    this.#selectorRepository = selectorRepository;
  }

  public async execute(): Promise<ReadSelectorsResponseDto> {
    try {
      const selectors: Selector[] | null = await this.#selectorRepository.all();
      if (!selectors) throw new Error(`Selectors do not exist`);

      return Result.ok<SelectorDto[]>(
        selectors.map((selector) => this.#buildSelectorDto(selector))
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #buildSelectorDto = (selector: Selector): SelectorDto => ({
    id: selector.id,
    alerts: selector.alerts.map(
      (alert): AlertDto => this.#buildAlertDto(alert)
    ),
    modifiedOn: selector.modifiedOn,
    content: selector.content,
    systemId: selector.systemId
  });

  #buildAlertDto = (alert: Alert): AlertDto => ({
    createdOn: alert.createdOn,
  });
}
