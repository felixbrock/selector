import IUseCase from '../services/use-case';
import { SelectorDto } from './selector-dto';
import Result from '../value-types/transient-types/result';
import { ReadSelectors } from './read-selectors';
import { DeleteSelector } from './delete-selector';

export interface DeleteSelectorsRequestDto {
  systemId: string;
}

export type DeleteSelectorsResponseDto = Result<null>;

export class DeleteSelectors
  implements IUseCase<DeleteSelectorsRequestDto, DeleteSelectorsResponseDto>
{
  #deleteSelector: DeleteSelector;

  #readSelectors: ReadSelectors;

  public constructor(
    readSelectors: ReadSelectors,
    deleteSelector: DeleteSelector
  ) {
    this.#readSelectors = readSelectors;
    this.#deleteSelector = deleteSelector;
  }

  public async execute(
    request: DeleteSelectorsRequestDto
  ): Promise<DeleteSelectorsResponseDto> {
    try {
      // read Selectors
      const readSelectorsResult: Result<SelectorDto[] | null> =
        await this.#readSelectors.execute({ systemId: request.systemId });

      if (readSelectorsResult.error) throw new Error(readSelectorsResult.error);
      if (!readSelectorsResult.value)
        throw new Error(`Couldn't read selectors`);

      const deletionResults = await Promise.all(
        readSelectorsResult.value.map(async (selectorDto) =>
        this.#deleteSelector.execute({ id: selectorDto.id })
        )
      );

      const failed = deletionResults.find((result) => result.error);
      if (failed)
        throw new Error(
          `Deletion of selectors referencing system ${request.systemId} failed. Please try again`
        );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);
    }
  }
}
