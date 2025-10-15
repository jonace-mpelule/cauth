import type { LooseAutocomplete } from './helpers.t.ts';

export type OtpPurpose = LooseAutocomplete<
	'LOGIN' | 'RESET_PASSWORD' | 'ACTION'
>;
