// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { Selector, SelectorProperties } from '../entities/selector';
import { SelectorDto, buildSelectorDto } from './selector-dto';
import { ISelectorRepository } from './i-selector-repository';
import {
  GetOrganization,
  GetOrganizationDto,
} from '../account-api/get-organization';

export interface CreateSelectorRequestDto {
  content: string;
  organizationId: string;
  systemId: string;
}

export type CreateSelectorResponseDto = Result<SelectorDto | null>;

export class CreateSelector
  implements IUseCase<CreateSelectorRequestDto, CreateSelectorResponseDto>
{
  #selectorRepository: ISelectorRepository;

  #getOrganization: GetOrganization;

  public constructor(
    selectorRepository: ISelectorRepository,
    getOrganization: GetOrganization
  ) {
    this.#selectorRepository = selectorRepository;
    this.#getOrganization = getOrganization;
  }

  public async execute(
    request: CreateSelectorRequestDto
  ): Promise<CreateSelectorResponseDto> {
    const selector: Result<Selector | null> = this.#createSelector(request);
    if (!selector.value) return selector;

    try {
      await this.#validateRequest(request);

      const readSelectorResult: SelectorDto[] =
        await this.#selectorRepository.findBy({
          content: selector.value.content,
        });
      if (readSelectorResult.length)
        throw new Error(
          `Selector ${readSelectorResult[0].content} is already registered under ${readSelectorResult[0].id}`
        );

      await this.#selectorRepository.insertOne(selector.value);

      return Result.ok<SelectorDto>(buildSelectorDto(selector.value));
    } catch (error: any) {
      return Result.fail<SelectorDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #validateRequest = async (
    request: CreateSelectorRequestDto
  ): Promise<undefined> => {
    try {
      if (request.organizationId) {
        const readOrganizationResult: Result<GetOrganizationDto | null> =
          await this.#getOrganization.execute({ id: request.organizationId });

        if (!readOrganizationResult.value)
          throw new Error(
            `System's organization ${request.organizationId} does not exist`
          );
      }
      return undefined;
    } catch (error: any) {
      return Promise.reject(typeof error === 'string' ? error : error.message);
    }
  };

  #createSelector = (
    request: CreateSelectorRequestDto
  ): Result<Selector | null> => {
    const selectorProperties: SelectorProperties = {
      id: new ObjectId().toHexString(),
      content: request.content,
      systemId: request.systemId,
      organizationId: request.organizationId,
    };

    return Selector.create(selectorProperties);
  };
}
