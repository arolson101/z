///<reference path="../project.d.ts"/>

import * as reactMixin from "react-mixin";
import { mutate } from "updraft";


export function ReForm(options: ReForm.Options) {
  return reactMixin.decorate(ReForm.mixin(options));
}

export namespace ReForm {
  export interface Options {
    defaultValues: Values;
    validate?: Validator | string;
  }

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

  export interface State {
    submitFailed?: boolean;
    fields?: {
      [fieldName: string]: Field<any>;
    };
  }

  export type Validator = (values: Values) => Errors;
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
    validate?: Validator;
  }

  export function mixin(options: ReForm.Options) {
    const fieldNames = Object.keys(options.defaultValues);
    const valuesForState = (state: State) => {
      let v: Values = {};
      for (let fieldName of fieldNames) {
        v[fieldName] = state.fields[fieldName].value;
      }
      return v;
    };

    const runValidate = (validate: Validator, values: ReForm.Values, nextState: ReForm.State) => {
      if (typeof validate === "function") {
        const errors = validate(values);
        for (let fieldName of fieldNames) {
          const error = errors[fieldName] as string || "";
          if (error !== nextState.fields[fieldName].error) {
            nextState.fields[fieldName].error = error;
          }
        }
      }
    };

    const getValidator = (self: any): Validator => {
      if (typeof options.validate === "function") {
        return options.validate as Validator;
      }
      let validateProp = "validate";
      if (typeof options.validate === "string") {
        validateProp = options.validate as string;
      }
      if (typeof self[validateProp] === "function") {
        return self[validateProp].bind(self) as Validator;
      }
      return null;
    };

    return ({
      getInitialState: function() {
        let state: State = {
          submitFailed: false,
          fields: {}
        };
        for (let fieldName of fieldNames) {
          const defaultValue = options.defaultValues[fieldName];
          state.fields[fieldName] = {
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
                fields: {
                  [fieldName]: {
                    value: { $set: value },
                    checked: { $set: !!value }
                  }
                }
              };
              const nextState = mutate(this.state, stateChange);
              if (nextState !== this.state) {
                const nextValues = valuesForState(nextState);
                const validate = getValidator(this);
                runValidate(validate, nextValues, nextState);
                this.setState(nextState);
              }
            },
            onUpdate: (e: Event | string) => {
              this.onChange(e);
            }
          };
        }

        const validate = getValidator(this);
        runValidate(validate, options.defaultValues, state);

        return state;
      },

      componentWillMount: function() {
        this.reForm = {
          values: () => valuesForState(this.state),
          setValues: (values: Values) => {
            let stateChange = {
              submitFailed: { $set: false },
              fields: {} as any
            };
            for (let fieldName of fieldNames) {
              if ((values as Object).hasOwnProperty(fieldName)) {
                stateChange.fields[fieldName] = {
                  value: { $set: values[fieldName] },
                  error: { $set: "" }
                };
              }
            }
            const nextState = mutate(this.state, stateChange);
            if (nextState !== this.state) {
              const nextValues = valuesForState(nextState);
              const validate = getValidator(this);
              runValidate(validate, nextValues, nextState);
              this.setState(nextState);
            }
          },
          reset: () => {
            this.reForm.setValues(options.defaultValues);
          },
          isValid: (): boolean => {
            for (let fieldName of fieldNames) {
              if (this.state.fields[fieldName].error) {
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
