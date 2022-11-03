import {NumberField, TextField, LinkedField, BooleanField, DateField, Sheet, Message} from '@flatfile/configure'
// Below are examples of field-level hooks that are applied across an entire field
// These hooks are defined along with the field itself

// This compute hook takes any input and replaces it with 'Rock'
    lastName: TextField({
      compute: (value: any) => {
        return `Rock`
      },
    }),


// removes specific symbols from the string - uses fp-ts library
import * as Str from 'fp-ts/string'

    unitCode: TextField({
      compute: (value: any) => {
        return Str.replace(/[*;/{}\[\]"_#'^><|]/g, "")(value);
      }
    }),
    
//removes extra spaces from the string - uses fp-ts library
import * as Str from 'fp-ts/string'

    emailAddress: TextField({ 
      compute: (value: any) => {
        return Str.replace(/\s{2,}/g, " ")(value);
      }
    }),
    
// sets string to Uppercase - uses fp-ts library
import * as Str from 'fp-ts/string'

    teamName: TextField({ 
      compute: (value: any) => {
        return Str.toUpperCase(value);
      }
    }),
    
//replaces Language Characters - uses fp-ts library
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as Str from 'fp-ts/string'

  reference: TextField({  
    description: 'reference',
    compute: (value) => {
      return pipe(
        Str.split('')(value),
        RA.map((char) => {
          return Str.Eq.equals(Str.toLowerCase(char), 'ç') ? 'c' : char
        }),
        (chars) => chars.join('')
      )
    },
  }),

//format dates according to a specified format - relies on datefns librarynpm library
  import * as datefns from "date-fns";
    
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
    
    
//validate numbers in a range - relies on helper functions in utils.ts
import * as E from "fp-ts/Either";
import { Lazy } from "fp-ts/function";
import { runValidations, ValidationResult } from "../utils";

  const validateRangeInclusive =
    (min: number, max: number) =>
    (value: number): Lazy<ValidationResult<number>> =>
    () => {
      return value >= min && value <= max
        ? E.right(value)
        : E.left([
            new Message(
              `Value must be between ${min} and ${max}`,
              "error",
              "validate",
            ),
          ]);
    };

mgmt_fee_minimum: NumberField({
      label: "Mgmt Fee Minimum",
      validate: (value) => {
        const ensureBetween1and100 = validateRangeInclusive(1, 100)(value);

        return runValidations(ensureBetween1and100());
      },
    }),
    
//confirm number is positive - relies on helper functions in utils.ts
import * as E from "fp-ts/Either";
import { Lazy } from "fp-ts/function";
import { runValidations, ValidationResult } from "../utils";

const validatePositive =
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= 0
      ? E.right(value)
      : E.left([new Message("Value must be positive", "error", "validate")]);
  };

  mgmt_fee_flat: NumberField({
      label: "Mgmt Fee Flat",
      validate: (value) => {
        const ensureIsPositive = validatePositive(value);

        return runValidations(ensureIsPositive());
      },
  }),

//

// trim leading and trailing spaces - uses fp-ts library
import * as Str from 'fp-ts/string'

    account_number: TextField({
      label: "Account Number",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    
// validate that a number is within a range - references utils.ts and validation functions at the end of this file

  import * as E from "fp-ts/Either";
  import { Lazy } from "fp-ts/function";
  import { runValidations, ValidationResult } from "./utils";
    
  const validateRangeInclusive =
  (min: number, max: number) =>
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= min && value <= max
      ? E.right(value)
      : E.left([
          new Message(
            `Value must be between ${min} and ${max}`,
            "error",
            "validate",
          ),
        ]);
  };

    mgmt_fee_minimum: NumberField({
      label: "Mgmt Fee Minimum",
      validate: (value) => {
        const ensureBetween1and100 = validateRangeInclusive(1, 100)(value);

        return runValidations(ensureBetween1and100());
      },
    }),

//validate that a number is positive 
  import * as E from "fp-ts/Either";
  import { Lazy } from "fp-ts/function";
  import { runValidations, ValidationResult } from "./utils";

const validatePositive =
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= 0
      ? E.right(value)
      : E.left([new Message("Value must be positive", "error", "validate")]);
  };

mgmt_fee: NumberField({
      label: "Mgmt Fee Flat",
      validate: (value) => {
        const ensureIsPositive = validatePositive(value);

        return runValidations(ensureIsPositive());
      },
    }),
    
// validate max length - relies on help functions in utils.ts
import { runValidations, ValidationResult } from "../utils";
import * as E from "fp-ts/Either";

const validateMaxLength =
  (len: number) =>
  (value: string): Lazy<E.Either<NEA.NonEmptyArray<Message>, string>> =>
  () => {
    return value.length <= len
      ? E.right(value)
      : E.left([
          new Message(
            `Cannot be more than ${len} characters.`,
            "warn",
            "validate",
          ),
        ]);
  };

 first_name: TextField({
      label: "First Name",
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(20)(value);

        return runValidations(ensureMaxLength());
      },
 });
 
 //Validate phone number
    function formatPhoneNumber(phoneNumberString: string) {
      var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
      var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
      if (match) {
        var intlCode = match[1] ? '+1 ' : ''
        return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
      }
      return 'Invalid phone number'
    }

    phoneNumber: TextField({
      label: 'Phone Number',
      validate: (phoneNumber: string) => {
        if (phoneNumber) {
          let validPhone = formatPhoneNumber(phoneNumber)
          if (validPhone === 'Invalid phone number') {
            return [
              new Message(
                'This does not appear to be a valid phone number',
                'error',
                'validate'
              ),
            ]
          }
        }
      },
    }),
    
//check for Country code format / use Regex in validate hook
    country: TextField({
      label: 'Country',
      validate: (country: string) => {
        const regex = /^[A-Z]{2}$/
        if (!regex.test(country)) {
          return [new Message('must be a valid country code', 'error', 'validate')]
        }
      },
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

