// Below are examples of field-level hooks that are applied across an entire field
// These hooks are defined along with the field itself

// This compute hook takes any input and replaces it with 'Rock'
    lastName: TextField({
      compute: (value: any) => {
        return `Rock`
      },
    }),


// removes specific symbols from the string
    unitCode: TextField({
      compute: (value: any) => {
        return Str.replace(/[*;/{}\[\]"_#'^><|]/g, "")(value);
      }
    }),
    
//removes extra spaces from the string
    emailAddress: TextField({ 
      compute: (value: any) => {
        return Str.replace(/\s{2,}/g, " ")(value);
      }
    }),
    
// sets string to Uppercase
    teamName: TextField({ 
      compute: (value: any) => {
        return Str.toUpperCase(value);
      }
    }),
    
//replaces Language Characters
    jobName: TextField({ 
      return pipe(
        Str.split("")(value),
        RA.map((char) => {
          return Str.Eq.equals(Str.toLowerCase(char), "ç") ? "c" : char;
        }),
        (chars) => chars.join(""),
      );
    }),

//format dates according to a specified format - relies on datefns npm library
    const formatDate =
      (format: string) =>
      (value: string): string => {
        try {
          return datefns.format(new Date(value), format);
        } catch (err) {
          return value;
        }
      };

    joinDate: TextField({ 
      compute: formatDate("dd/MM/yyyy"), 
    }),

// trim leading and trailing spaces 
    account_number: FF.TextField({
      label: "Account Number",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    
// validate that a number is within a range - references utils.ts and validation functions at the end of this file
  import * as FF from "@flatfile/configure";
  import * as E from "fp-ts/Either";
  import { Lazy, pipe } from "fp-ts/function";
  import * as Str from "fp-ts/string";
  import { runValidations, ValidationResult } from "./utils";
    
  const validateRangeInclusive =
  (min: number, max: number) =>
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= min && value <= max
      ? E.right(value)
      : E.left([
          new FF.Message(
            `Value must be between ${min} and ${max}`,
            "error",
            "validate",
          ),
        ]);
  };

    mgmt_fee_minimum: FF.NumberField({
      label: "Mgmt Fee Minimum",
      validate: (value) => {
        const ensureBetween1and100 = validateRangeInclusive(1, 100)(value);

        return runValidations(ensureBetween1and100());
      },
    }),

//validate that a number is positive 
  import * as FF from "@flatfile/configure";
  import { FlatfileRecord } from "@flatfile/hooks";
  import * as Ap from "fp-ts/Apply";
  import * as E from "fp-ts/Either";
  import * as NEA from "fp-ts/NonEmptyArray";
  import * as O from "fp-ts/Option";
  import * as RR from "fp-ts/ReadonlyRecord";
  import { Lazy, pipe } from "fp-ts/function";
  import * as Str from "fp-ts/string";
  import * as t from "io-ts";
  import { runValidations, ValidationResult } from "./utils";
  
  import { fold, runValidations, ValidationResult } from "./utils"; 

const validatePositive =
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= 0
      ? E.right(value)
      : E.left([new FF.Message("Value must be positive", "error", "validate")]);
  };

