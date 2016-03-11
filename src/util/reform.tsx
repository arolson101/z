///<reference path="../project.d.ts"/>

import * as reactMixin from "react-mixin";
import { mutate } from "updraft";


export function ReForm(defaultValues: ReForm.Values) {
  return reactMixin.decorate(ReForm.mixin(defaultValues));
}

export namespace ReForm {
  export interface Values {
    [fieldName: string]: any;
  }

  export interface Errors {
    [fieldName: string]: string;
  }

  export interface Field<type> {
    defaultValue: type;
    checked: boolean;
    error: string;
    value: type;
    onChange(e: Event | type): any;
    onUpdate(e: Event | type): any;
  }

  export type State = {
    submitFailed: boolean;
  } & {
    [fieldName: string]: Field<any>;
  };

  export type Submitter = (values?: Values) => any;

  export interface Interface {
    values(): Values;
    setValues(values: Values): void;
    reset(): void;
    isValid(): boolean;
    handleSubmit(submit: Submitter): Function;
  }

  export interface Component {
    reForm: Interface;
    validate?(values: Values): Errors;
  }

  export function mixin(defaultValues: ReForm.Values) {
    const fieldNames = Object.keys(defaultValues);
    const valuesForState = (state: State) => {
      let v: Values = {};
      for (let fieldName of fieldNames) {
        v[fieldName] = (state[fieldName] as Field<string>).value;
      }
      return v;
    };

    const runValidate = (validate: (values: Values) => Errors, values: ReForm.Values, nextState: ReForm.State) => {
      if (typeof validate === "function") {
        const errors = validate(values);
        for (let fieldName of fieldNames) {
          const error = errors[fieldName] as string;
          if (error !== nextState[fieldName].error) {
            nextState[fieldName].error = error;
          }
        }
      }
    };

    return ({
      getInitialState: function() {
        let state: State = { submitFailed: false };
        for (let fieldName of fieldNames) {
          const defaultValue = defaultValues[fieldName];
          state[fieldName] = {
            defaultValue,
            value: defaultValue,
            checked: defaultValue,
            error: "",
            onChange: (e: Event | string) => {
              let value: string | boolean = e as string;
              const target = (e as Event).target as HTMLInputElement;
              if (target) {
                value = (target.type == "checkbox") ? target.checked : target.value;
              }

              const stateChange = {
                [fieldName]: {
                  value: { $set: value },
                  checked: { $set: !!value }
                }
              };
              const nextState = mutate(this.state, stateChange);
              const nextValues = valuesForState(nextState);
              runValidate(this.validate, nextValues, nextState);
              this.setState(nextState);
            },
            onUpdate: (e: Event | string) => {
              this.onChange(e);
            }
          };
        }

        runValidate(this.validate, defaultValues, state);

        return state;
      },

      componentWillMount: function() {
        this.reForm = {
          values: () => valuesForState(this.state),
          setValues: (values: Values) => {
            let stateChange = {} as any;
            for (let fieldName of fieldNames) {
              if ((values as Object).hasOwnProperty(fieldName)) {
                stateChange[fieldName] = {
                  value: { $set: values[fieldName] },
                  error: { $set: "" }
                };
              }
            }
            if (Object.keys(stateChange).length != 0) {
              const nextState = mutate(this.state, stateChange);
              const nextValues = valuesForState(nextState);
              runValidate(this.validate, nextValues, nextState);
              this.setState(nextState);
            }
          },
          reset: () => {
            this.reForm.submitFailed = false;
            this.reForm.setValues(defaultValues);
          },
          isValid: (): boolean => {
            for (let fieldName of fieldNames) {
              if ((this.state[fieldName] as Field<any>).error) {
                return false;
              }
            }
            return true;
          },
          handleSubmit: (submit: Submitter) => {
            return () => {
              let isValid = this.reForm.isValid();
              this.setState({submitFailed: !isValid});
              if (isValid) {
                const values = this.reForm.values();
                submit(values);
              }
            };
          }
        } as Interface;
      }
    });
  }
}
