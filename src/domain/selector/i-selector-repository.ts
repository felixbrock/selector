import { Selector } from '../entities/selector';
import { Alert } from '../value-types/alert';

export interface SelectorQueryDto {
  systemId?: string;
  content?: string;
  organizationId?: string;
  alert?: AlertQueryDto;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

interface AlertQueryDto {
  createdOnStart?: number;
  createdOnEnd?: number;
}

export interface SelectorUpdateDto {
  systemId?: string;
  content?: string;
  organizationId?: string;
  alert?: Alert;
  modifiedOn?: number;
}

export interface ISelectorRepository {
  findOne(id: string): Promise<Selector | null>;
  findBy(selectorQueryDto: SelectorQueryDto): Promise<Selector[]>;
  all(): Promise<Selector[]>;
  updateOne(id: string, updateDto: SelectorUpdateDto): Promise<string>;
  insertOne(selector: Selector): Promise<string>;
  deleteOne(id: string): Promise<string>;
}
