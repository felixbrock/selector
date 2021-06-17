import WarningDto from "./warning-dto";

export default interface SystemDto {
  id: string;
  name: string;
  warnings: WarningDto[];
  modifiedOn: number;
  // eslint-disable-next-line semi
}