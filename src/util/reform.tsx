///<reference path="../project.d.ts"/>

import * as reactMixin from "react-mixin";
import { update } from "updraft";


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
    name: string;
    checked: boolean;
    error: string;
    value: type;
    onChange(e: React.SyntheticEvent | type): any;
    onUpdate(e: React.SyntheticEvent | type): any;
  }

  export interface FieldObject {
    [fieldName: string]: Field<any>;
  }

  export interface State {
    submitFailed?: boolean;
    fields?: FieldObject;
  }

  export type Validator = (values: Values) => Errors;
  export type Submitter = (values?: Values) => any;

  export interface Interface {
    values(): Values;
    setValues(values: Values): void;
    reset(): void;
    runValidate(): void;
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

    const runValidate = (validate: Validator, values: ReForm.Values, nextState: ReForm.State): State => {
      const errorState = { fields: {} as any };
      if (typeof validate === "function") {
        const errors = validate(values);
        for (let fieldName of fieldNames) {
          const error = errors[fieldName] as string || "";
          errorState.fields[fieldName] = { error: { $set: error } };
        }
      }
      return errorState;
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
            name: fieldName,
            value: defaultValue,
            checked: defaultValue,
            error: "",
            onChange: (e: React.SyntheticEvent | string) => {
              let value: string | boolean = e as string;
              const target = e ? (e as React.SyntheticEvent).target as HTMLInputElement : null;
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
              const nextState = update(this.state, stateChange);
              if (nextState !== this.state) {
                const nextValues = valuesForState(nextState);
                const validate = getValidator(this);
                const errors = runValidate(validate, nextValues, nextState);
                const finalState = update(nextState, errors);
                this.setState(finalState);
              }
            },
            onUpdate: (e: React.SyntheticEvent | string) => {
              this.onChange(e);
            }
          };
        }

        const validate = getValidator(this);
        const errors = runValidate(validate, options.defaultValues, state);
        state = update(state, errors);

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
            const nextState = update(this.state, stateChange);
            if (nextState !== this.state) {
              const nextValues = valuesForState(nextState);
              const validate = getValidator(this);
              const errors = runValidate(validate, nextValues, nextState);
              const finalState = update(nextState, errors);
              this.setState(finalState);
            }
          },
          reset: () => {
            this.reForm.setValues(options.defaultValues);
          },
          runValidate: () => {
            const nextValues = valuesForState(this.state);
            const validate = getValidator(this);
            const errors = runValidate(validate, nextValues, this.state);
            const nextState = update(this.state, errors);
            this.setState(nextState);
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
            return (e: Event) => {
              if (typeof e.preventDefault === "function") {
                e.preventDefault();
              }
              let isValid = this.reForm.isValid();
              this.setState(
                {
                  submitFailed: !isValid
                },
                () => {
                  if (isValid) {
                    const values = this.reForm.values();
                    submit(values);
                  }
                }
              );
            };
          }
        } as Interface;
      },

      componentDidUpdate: function(prevProps: any, prevState: any) {
        if (this.props !== prevProps) {
          this.reForm.runValidate();
        }
      }
    });
  }
}
