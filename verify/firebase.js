// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-analytics.js';
import { msg, modal, advancedModal } from './main.js';
import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	sendEmailVerification,
	verifyPasswordResetCode,
	confirmPasswordReset,
} from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-auth.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyCrum9tShfSEgaOYwUqDxkXORA9qk0wGvQ',
	authDomain: 'adva-coordinata.firebaseapp.com',
	projectId: 'adva-coordinata',
	storageBucket: 'adva-coordinata.appspot.com',
	messagingSenderId: '887381293602',
	appId: '1:887381293602:web:d09e34e9970c3b634ae87b',
	measurementId: 'G-XSSF0J6J13',
};

// import {
//     getFirestore,
// 	collection,
// 	addDoc,
//     doc,
// 	getDocs,
//     getDoc,
//     setDoc,
// } from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-firestore.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
auth = getAuth();

// const db = getFirestore(app);

// stolen kindly from https://firebase.google.com/docs/auth/custom-email-handler#web-version-9

function getParameterByName(parameter) {
    if(!parameter) return;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameter);
    
}
document.addEventListener(
	'DOMContentLoaded',
	() => {

		// Get the action to complete.
		const mode = getParameterByName('mode');
		// Get the one-time code from the query parameter.
		const actionCode = getParameterByName('oobCode');
		// (Optional) Get the continue URL from the query parameter if available.
		const continueUrl = getParameterByName('continueUrl');
		// (Optional) Get the language code if available.
		const lang = getParameterByName('lang') || 'en';
		// Handle the user management action.
		switch (mode) {
			case 'resetPassword':
				// Display reset password handler and UI.
				handleResetPassword(auth, actionCode, continueUrl, lang);
				break;
			case 'recoverEmail':
				// Display email recovery handler and UI.
				handleRecoverEmail(auth, actionCode, lang);
				break;
			case 'verifyEmail':
				// Display email verification handler and UI.
				handleVerifyEmail(auth, actionCode, continueUrl, lang);
				break;
			default:
			// Error: invalid mode.
		}
	},
	false
);
const textIsContent = true;
const closing = true;


function handleResetPassword(auth, actionCode, continueUrl, lang) {
	// Localize the UI to the selected language as determined by the lang
	// parameter.
    console.log(auth, actionCode, continueUrl, lang)
	// Verify the password reset code is valid.
	verifyPasswordResetCode(auth, actionCode)
		.then(email => {
			const accountEmail = email;


			// the new password.
            advancedModal(
				'Please enter your new password',
				[
					{
						tag: 'h3',
						text: accountEmail,
						class: 'bold block card text-l no-border p-0 full-width greyed-text',
						closing,
						textIsContent,
					},
					{ tag: 'input', text: 'New Password', class: 'm-1' },
				],
				data => {
                    const newPassword = data.New_Password;
					console.log(newPassword);
                    // Save the new password.
                    confirmPasswordReset(auth, actionCode, newPassword)
                        .then(resp => {
                            // Password reset has been confirmed and new password updated.
                            // TODO: Display a link back to the app, or sign-in the user directly
                            // if the page belongs to the same domain as the app:
                            location.href = 'https://coordinata.netlify.app';
                            // TODO: If a continue URL is available, display a button which on
                            // click redirects the user back to the app via continueUrl with
                            // additional state determined from that URL's parameters.
                        })
                        .catch(error => {
                            // Error occurred during confirmation. The code might have expired or the
                            // password is too weak.
                        });
				}
			);

		})
		.catch(error => {
			// Invalid or expired action code. Ask user to try to reset the password
			// again.
		});
}