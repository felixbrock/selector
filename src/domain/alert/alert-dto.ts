import Alert from "../value-types/alert";

export interface AlertDto {
  createdOn: number;
};

export const buildAlertDto = (alert: Alert): AlertDto => ({
  createdOn: alert.createdOn,
});