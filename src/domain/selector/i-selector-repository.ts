import { Selector } from "../entities";
import Result from "../value-types/transient-types";

export default interface ISelectorRepository {
  findById(id: string): Promise<Selector | null>;
  findByContent(content: string): Promise<Selector | null>;
  update(selector: Selector): Promise<Result<null>>;
  save(selector: Selector): Promise<Result<null>>;
  // eslint-disable-next-line semi
}