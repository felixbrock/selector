// TODO Should those really be use cases?
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import SystemDto from './system-dto';
import ISystemApiRepository from './i-system-api-repository';

export interface GetSystemRequestDto {
  id: string;
}

export type GetSystemResponseDto = Result<SystemDto | null>;

export class GetSystem
  implements IUseCase<GetSystemRequestDto, GetSystemResponseDto>
{
  #systemApiRepository: ISystemApiRepository;

  public constructor(systemApiRepository: ISystemApiRepository) {
    this.#systemApiRepository = systemApiRepository;
  }

  public async execute(
    request: GetSystemRequestDto
  ): Promise<GetSystemResponseDto> {
    try {
      const getSystemResult: SystemDto | null =
        await this.#systemApiRepository.getOne(request.id);

      if (!getSystemResult)
        throw new Error(
          `No system found for id ${request.id}`
        );

      return Result.ok<SystemDto>(getSystemResult);
    } catch (error) {
      return Result.fail<SystemDto>(error.message);
    }
  }
}
