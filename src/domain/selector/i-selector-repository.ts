import { Selector } from "../entities/selector";
import Result from "../value-types/transient-types/result";

export interface SelectorQueryDto {
  systemId?: string;
  content?: string;
  alert?: AlertQueryDto;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface AlertQueryDto {
  createdOnStart?: number;
  createdOnEnd?: number;
}


export interface ISelectorRepository {
  findOne(id: string): Promise<Selector | null>;
  findBy(
    selectorQueryDto: SelectorQueryDto
  ): Promise<Selector[]>;
  all(): Promise<Selector[]>;
  update(selector: Selector): Promise<Result<null>>;
  save(selector: Selector): Promise<Result<null>>;
  delete(selectorId: string): Promise<Result<null>>;
  // eslint-disable-next-line semi
}