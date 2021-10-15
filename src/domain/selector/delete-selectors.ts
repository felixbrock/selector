import IUseCase from '../services/use-case';
import { SelectorDto } from './selector-dto';
import Result from '../value-types/transient-types/result';
import { ReadSelectors } from './read-selectors';
import { DeleteSelector } from './delete-selector';

export interface DeleteSelectorsRequestDto {
  systemId: string;
}

export interface DeleteSelectorsAuthDto {
  organizationId: string;
  jwt: string;
}

export type DeleteSelectorsResponseDto = Result<string>;

export class DeleteSelectors
  implements IUseCase<DeleteSelectorsRequestDto, DeleteSelectorsResponseDto, DeleteSelectorsAuthDto>
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
    request: DeleteSelectorsRequestDto,
    auth: DeleteSelectorsAuthDto
  ): Promise<DeleteSelectorsResponseDto> {
    try {
      // read Selectors
      const readSelectorsResult: Result<SelectorDto[]> =
        await this.#readSelectors.execute({ systemId: request.systemId }, {organizationId: auth.organizationId});

      if (readSelectorsResult.error) throw new Error(readSelectorsResult.error);
      if (!readSelectorsResult.value)
        throw new Error(`Couldn't read selectors`);

      const deletionResults = await Promise.all(
        readSelectorsResult.value.map(async (selectorDto) =>
        this.#deleteSelector.execute({ id: selectorDto.id }, {organizationId: auth.organizationId, jwt: auth.jwt})
        )
      );

      const failed = deletionResults.find((result) => result.error);
      if (failed)
        throw new Error(
          `Deletion of selectors referencing system ${request.systemId} failed. Please try again`
        );

      return Result.ok(`Number of selectors deleted: ${deletionResults.length}`);
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
