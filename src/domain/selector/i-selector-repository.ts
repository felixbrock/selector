import { Selector } from "../entities";
import Result from "../value-types/transient-types";

export interface SelectorQueryDto {
  systemId?: string;
  content?: string;
  alert?: AlertQueryDto;
  modifiedOn?: number;
}

export interface AlertQueryDto {
  createdOn?: number;
}


export default interface ISelectorRepository {
  findOne(id: string): Promise<Selector | null>;
  findBy(
    subscriptionQueryDto: SelectorQueryDto
  ): Promise<Selector[]>;
  all(): Promise<Selector[]>;
  update(selector: Selector): Promise<Result<null>>;
  save(selector: Selector): Promise<Result<null>>;
  delete(selectorId: string): Promise<Result<null>>;
  // eslint-disable-next-line semi
}