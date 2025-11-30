// import { CAuth, isCAuthError } from '../dist/index.js';

// const s = CAuth({});

// const loginResult = await s.FN.RequestOTPCode({
// 	email: '',
// 	password: '',
// 	usePassword: true,
// 	otpPurpose: 'LOGIN',
// 	onCode: (code) => console.log(code),
// });

// if (!loginResult.success) {
// 	if (isCAuthError(loginResult.errors[0], 'CredentialMismatchError')) {
// 	}
// }

// type genO = {
// 	email: string;
// 	password: string;
// 	onCode: (code: string) => any;
// };

// function generateOTP({ ...args }: genO) {
// 	const newCode = '1234';
// 	// ops
// 	args.onCode(newCode);
// }

// const sendSMS = (phoneNumber: string, code: string) => {
// 	console.log(`sending sms: ${code} tp ${phoneNumber}`);
// };
