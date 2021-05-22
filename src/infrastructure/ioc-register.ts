import { InjectionMode, asClass, createContainer } from "awilix";
import { AddSelector } from "../domain/add-selector";
import AddSelectorRepository from "./persistence/add-selector-repository";
import SelectorDomain from "../domain/selector-domain";

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  selectorDomain: asClass(SelectorDomain),

  addSelector: asClass(AddSelector),

  addSelectorRepository: asClass(AddSelectorRepository),
});

const selectorMain = iocRegister.resolve<SelectorDomain>("selectorDomain");

export default {
  selectorMain,
  container: iocRegister
};
