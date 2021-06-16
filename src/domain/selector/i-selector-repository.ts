import { Selector } from "../entities";

export default interface ISelectorRepository {
  findById(id: string): Promise<Selector | null>;
  findByContent(content: string): Promise<Selector | null>;
  update(selector: Selector): Promise<void>;
  save(selector: Selector): Promise<void>;
  // eslint-disable-next-line semi
}