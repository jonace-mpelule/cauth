import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';

export const phoneWithLibSchema = z
	.string()
	.trim()
	.refine(
		(val) => {
			const pn = parsePhoneNumberFromString(val);
			return !!pn && pn.isValid();
		},
		{ message: 'Invalid phone number' },
	)
	.transform((val) => {
		const pn = parsePhoneNumberFromString(val);
		// SAFETY: PN SHOULD BE NON-NULL BECAUSE REFINE PASSED
		return pn?.format('E.164') ?? val;
	});

// USAGE
// CONST R = PHONEWITHLIBSCHEMA.SAFEPARSE(' (415) 555-2671 ');
// IF (!R.SUCCESS) CONSOLE.ERROR(R.ERROR);
// ELSE CONSOLE.LOG('NORMALIZED E.164:', R.DATA); // +14155552671
