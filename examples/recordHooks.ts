import { FlatfileRecord } from '@flatfile/hooks';

// Below are examples of record level hooks that run at the individual record (row) level
// Each example assumes that the fields being referenced or manipulated exist in index.ts


// combine discrete first and last name into a full name
    recordCompute: (record) => {
      const fullName = `${record.get('firstName')} ${record.get('lastName')}`
      record.set('fullName', fullName)
      return record
    },

// checks imported value against a library of accepted values
    const validProducts = [
        "Red",
        "Green",
        "Blue",
        "Yellow",
        "Orange",
        "Indigo",
        "Violet"
    ];
    
    recordCompute: (record, session, logger) => {
      if (record.get('Registered_Product')) {
        let validProduct = validProducts.find(product => product.toLowerCase() == record.get('Registered_Product').toLowerCase())
        if (validProduct) {
          logger.info('Found Product')
          record.set('Registered_Product', validProduct)
        } else {
          record.addError('Registered_Product', 'This is not a valid Product')
        }
      }

      return record
    },

// check that one of two possible fields exists, multiple times
import * as G from "../typeGuards";
    const checkForOneOrTheOther =
        (
            field1: { key: string; label: string },
            field2: { key: string; label: string },
        ) =>
        (record: FlatfileRecord): FlatfileRecord => {
            const value1 = record.get(field1.key);
            const value2 = record.get(field2.key);

            if (G.isNil(value1) && G.isNil(value2)) {
            record.addError(
                [field1.key, field2.key],
                `Must provide one of: ${field1.label} or ${field2.label}.`,
            );
        }

        return record;
    };

    
    recordCompute: (record) => {
      return fold(
        checkForOneOrTheOther(
          { key: "unit_code", label: "Unit Code" },
          { key: "unit_name", label: "Unit Name" },
        ),
        checkForOneOrTheOther(
          { key: "function_code", label: "Function Code" },
          { key: "job_name", label: "Job Name" },
        ),
        checkForOneOrTheOther(
          { key: "department_code", label: "Department Code" },
          { key: "department_name", label: "Department Name" },
        ),
        checkForOneOrTheOther(
          { key: "employee_code", label: "Employee Code" },
          { key: "employee_name", label: "Employee Name" },
        ),
      )(record);
    },

// Splits value into first name & last name if full name is entered in first name field
const isNil = (val: any) => val === null || val === undefined || val === "";
const isNotNil = (val: any) => !isNil(val);

    recordCompute: (record) => {
        const firstName = record.get('firstName')
        const lastName = record.get('lastName')                
        if (isNotNil(firstName) && isNil(lastName)) {
            if (firstName.includes(" ")) {
                const parts = firstName.split(" ");
                record
                    .set("firstName", parts[0])
                    .addComment("firstName", "Full name was split")
                    .set("lastName", parts.slice(1, parts.length).join(" ").trim())
                    .addComment("lastName", "Full name was split");
            }
        }
    },
    
// pad US postal codes that are less than 5 characters
    recordCompute: (record) => {
        const postalCode = record.get('postalCode')

        if (
        record.get("country") === "US" &&
        isNotNil(postalCode) &&
        postalCode.length < 5
        ) {
        const padded = postalCode.padStart(5, "0");

        record
            .set("postalCode", padded)
            .addComment("postalCode", "Zipcode was padded with zeroes");
        }     
    },

// re-format date fields - requires datefns
import * as dfns from "date-fns";

    recordCompute: (record) => {
      const date = record.get('createDate')
        if (isNotNil(date)) {
            if (Date.parse(date)) {
                const thisDate = dfns.format(new Date(date), "yyyy-MM-dd");
                const realDate = dfns.parseISO(thisDate);
            if (dfns.isDate(realDate)) {
                record
                    .set('createDate', thisDate)
                    .addComment('createDate', 'Automatically formatted')
            } else {
                record.addError('createDate', 'Invalid Date')
            }
            }
        }
    },

// validation functions that can be run in record hooks 
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as RR from "fp-ts/ReadonlyRecord";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { fold} from "./utils";


const balancedOwnerPercentages = (record: FlatfileRecord): FlatfileRecord => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      owner1_percent: t.number.decode(record.get("owner1_percent")),
      owner2_percent: t.number.decode(record.get("owner2_percent")),
    }),
    E.match(
      () => record,
      ({ owner1_percent, owner2_percent }) => {
        if (owner1_percent + owner2_percent !== 100) {
          record.addWarning(
            ["owner1_percent", "owner2_percent"],
            "Owner percentages must total 100%.",
          );
        }

        return record;
      },
    ),
  );
};

const checkCorrespondingRTN = (record: FlatfileRecord): FlatfileRecord => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      bank_name: t.string.decode(record.get("bank_name")),
      rtn: t.string.decode(record.get("routing_transit_number")),
    }),
    E.match(
      () => record,
      ({ bank_name, rtn }) => {
        return pipe(
          RR.lookup(bank_name)(RTN),
          O.map((rtns) => {
            return rtns.includes(rtn)
              ? record
              : record.addError(
                  "routing_transit_number",
                  `Was expecting one of: ${rtns.join(", ")}`,
                );
          }),
          O.getOrElse(() => record),
        );
      },
    ),
  );
};

recordCompute: (record, _session, _logger) => {
      return fold(balancedOwnerPercentages)(record);
      return fold(checkCorrespondingRTN)(record);
    },
    
//Conditional required fields
import * as G from "../typeGuards";
import { match } from "ts-pattern";

type TransactionType = "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";

const requiredFields = (record: FlatfileRecord): FlatfileRecord => {
  const device_type = record.get("device_type");
  const carrier = record.get("losing_carrier");
  const transaction_type = record.get("transaction_type");

    // ignore possible `null` value when matching

  if (G.isNil(carrier)) {
    match(transaction_type as TransactionType)
      .with("FOUR", () => {
        record.addError("carrier", "Field is required.");
      })
      .otherwise(() => {});
  }

  if (G.isNil(device_type)) {
    match(transaction_type as TransactionType)
      .with("ONE", () => {
        record.addError("device_type", "Field is required.");
      })
      .with("TWO", () => {
        record.addError("device_type", "Field is required.");
      })
      .with("THREE", () => {
        record.addError("device_type", "Field is required.");
      })
      .otherwise(() => {});
  }
  
  recordCompute: (record, _logger) => {
      return fold(requiredFields)(record);
    },