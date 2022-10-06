// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-analytics.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-auth.js';
import {modal, closing, textIsContent} from './UI.js';
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

import {
    getFirestore,
	collection,
	addDoc,
    doc,
	getDocs,
    getDoc,
    setDoc,
} from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-firestore.js';
import { msg } from './main.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
auth = getAuth();

const db = getFirestore(app);

export async function createUserDataFunnel(userCredential, fname, lname) {
    // await setDoc(doc(db, 'users', userCredential.uid), {
    //     userId: userCredential.uid,
    //     fname, lname
    // })
    const docRef = await setDoc(doc(db, 'users', userCredential.uid), {
		firstName: fname,
		lastName: lname,
		userId: userCredential.uid,
        userType: 'player',
        event: []
	});
    location.reload();
}

export async function DoesUserAlreadyHaveFunnel (uid, doIfNotExists) {
    let exists = false;
    const queryUserSnapshot = await getDocs(collection(db, 'users'));
    queryUserSnapshot.forEach(doc => {
        const userid = doc.data().userId;
        if (
            userid === uid
        ) {
            exists = true;
        }
    });
    if (!exists) doIfNotExists();
}



export function createUser(fname, lname, email, password, errorFunc, successFunc){
    createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
            sendEmailVerification(userCredential.user);
            
            createUserDataFunnel(userCredential.user, fname, lname).catch(
				err => {
					msg(translateFirebaseError(err));
				}
			);
            successFunc() || undefined;
        })
        .catch(err => {console.error(err.code, err.message); errorFunc(err);});
}
export function signInUser(email, password, errorFunc, successFunc) {
    signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
        successFunc(userCredential) || undefined;
        DoesUserAlreadyHaveFunnel(userCredential.user.uid, () => {
			// modal('What is your name?', ['First Name', 'Last Name'], data => {
			// });
			modal(
				'What is your name?',
				[
					{
						tag: 'p',
						text: 'We need this as you currently do not have a name associated with your account.',
						class: 'bold block card text-c no-border p-0 full-width',
						closing,
						textIsContent,
					},
					{ tag: 'input', text: 'First Name', class: 'm-1' },
					{ tag: 'input', text: 'Last Name', class: 'm-1' },
				],
				data => {
					// console.log(data);
                    msg('Please wait...', 'success');
                    createUserDataFunnel(userCredential.user, data.First_Name, data.Last_Name).catch(err => {
                        msg(translateFirebaseError(err));
                    });
				},
				false
			);
		})
    })
    .catch(err => {
        console.error(err.code, err.message);
        errorFunc(err);
    });
}
export function signOutUser(errorFunc, successFunc) {
	signOut(auth)
		.then(() => {
            successFunc() || undefined;
			redir('page_signed_out');
			setTimeout(() => {
				redir('page_start');
			}, 4000);
		})
		.catch(err => {
			console.error(err.code, err.message);
			errorFunc(err);
		});
}



export function doOnlyIfAuthExists(cb) {
    if(!auth) {
        setTimeout(()=>{doOnlyIfAuthExists();});
    } else {
        cb();
        return;
    }
}

export function getUid() {
    let uid = undefined;
    onAuthStateChanged(auth, user => {
        if(!user) return;

        uid = user.uid;
    })
    return uid;
}

export async function getFunnel (uid, cb) {
    const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach(doc => {
            if(doc.id === uid)
            cb(doc.data());
        }
    );
};
export async function addToFunnel (uid, itemKey, itemObject) {
    const docRef = await setDoc(doc(db, 'users', uid), {
		[itemKey]:itemObject
	}, {merge: true});
};

// export async function checkIfCodeIsValid (code, handle, error) {
//     let exists = false;
//     const querySnapshot = await getDocs(collection(db, 'codes'));
//         querySnapshot.forEach(doc => {
//             if(doc.id === code) {
//                 exists = true;
//                 handle(doc.data());
//             }
//         }
//     );
//     if (!exists) {
//         error()
//     }
// }
export async function getCodePublicisedData (code, handle, error) {
    let exists = false;
    const querySnapshot = await getDocs(collection(db, 'codes'));
        querySnapshot.forEach(doc => {
            if(doc.id === code) {
                exists = true;
                handle(doc.data());
            }
        }
    );
    if (!exists) {
        error()
    }
}

export async function isSignedUptoEvent(user, codesCb) {
	const querySnapshot = await getDocs(collection(db, 'users'));
	querySnapshot.forEach(doc => {
		if (doc.id === user.user.uid) {
            codesCb(doc);
		}
	});
	if (!exists) {
		error();
	}
}





export const firebaseErrors = {
	'auth/claims-too-large': 'Claims payload exceeds maximum of 1000 bytes.',
	'auth/email-already-exists': 'Email is already registered!',
	'auth/id-token-expired': 'Auth token has expired! Log in again!',
	'auth/id-token-revoked': 'Auth token has been revoked.',
	'auth/insufficient-permission':
		'You do not have permission to perform this action!',
	'auth/internal-error': 'An internal error has occurred. Please try again!',
	'auth/invalid-argument': 'An invalid item has been provided.',
	'auth/invalid-claims': 'Claim is invalid!',
    'auth/invalid-continue-uri':	'Invalid Continue URL. Please try again!',
    'auth/invalid-creation-time':	'Invalid creation time.',
    'auth/invalid-credential':	'Invalid credentials.',
    'auth/invalid-disabled-field':	'The provided value for the disabled user property is invalid. It must be a boolean.',
    'auth/invalid-display-name':	'Invalid display name.',
    'auth/invalid-dynamic-link-domain':	'The provided dynamic link domain is not configured or authorized.',
    'auth/invalid-email':	'Email address is invalid!',
    'auth/invalid-email-verified':	'The provided value for the emailVerified user property is invalid. It must be a boolean.',
    'auth/invalid-hash-algorithm':	'The hash algorithm must match one of the strings in the list of supported algorithms.',
    'auth/invalid-hash-block-size':	'The hash block size must be a valid number.',
    'auth/invalid-hash-derived-key-length':	'The hash derived key length must be a valid number.',
    'auth/invalid-hash-key':	'The hash key must a valid byte buffer.',
    'auth/invalid-hash-memory-cost':	'The hash memory cost must be a valid number.',
    'auth/invalid-hash-parallelization':	'The hash parallelization must be a valid number.',
    'auth/invalid-hash-rounds':	'The hash rounds must be a valid number.',
    'auth/invalid-hash-salt-separator':	'The hashing algorithm salt separator field must be a valid byte buffer.',
    'auth/invalid-id-token':	'The provided ID token is not a valid Firebase ID token.',
    'auth/invalid-last-sign-in-time':	'The last sign-in time must be a valid UTC date string.',
    'auth/invalid-page-token':	'The provided next page token in listUsers() is invalid. It must be a valid non-empty string.',
    'auth/invalid-password':	'Your password must be at least 6 characters long!',
    'auth/invalid-password-hash':	'The password hash must be a valid byte buffer.',
    'auth/invalid-password-salt':	'The password salt must be a valid byte buffer',
    'auth/invalid-phone-number':	'Invalid phone number.',
    'auth/invalid-photo-url':	'Invalid photo URL. Must be a URL String.',
    'auth/invalid-provider-data':	'The providerData must be a valid array of UserInfo objects.',
    'auth/invalid-provider-id':	'The providerId must be a valid supported provider identifier string.',
    'auth/invalid-oauth-responsetype':	'Only exactly one OAuth responseType should be set to true.',
    'auth/invalid-session-cookie-duration':	'The session cookie duration must be a valid number in milliseconds between 5 minutes and 2 weeks.',
    'auth/invalid-uid':	'Invalid UID, must be a 128 char string!',
    'auth/invalid-user-import':	'The user record to import is invalid.',
    'auth/maximum-user-count-exceeded':	'The maximum allowed number of users to import has been exceeded.',
    'auth/missing-android-pkg-name':	'An Android Package Name must be provided if the Android App is required to be installed.',
    'auth/missing-continue-uri':	'A valid continue URL must be provided.',
    'auth/missing-hash-algorithm':	'Importing users with password hashes requires that the hashing algorithm and its parameters be provided.',
    'auth/missing-ios-bundle-id':	'The request is missing a Bundle ID.',
    'auth/missing-uid':	'A uid identifier is required for an operation that is taking place.',
    'auth/missing-oauth-client-secret':	'The OAuth configuration client secret is required to enable OIDC code flow.',
    'auth/operation-not-allowed':	'The provided sign-in provider is disabled.',
    'auth/phone-number-already-exists':	'Phone number already registered!',
    'auth/project-not-found':	'Project not found. Contact us for support at main.adva@gmail.com.',
    'auth/reserved-claims':	'Reserved claims.',
    'auth/session-cookie-expired':	'The provided Firebase session cookie is expired.',
    'auth/session-cookie-revoked':	'The Firebase session cookie has been revoked.',
    'auth/uid-already-exists':	'Uid already exists!',
    'auth/unauthorized-continue-uri':	'The domain of the continue URL is not whitelisted.',
    'auth/user-not-found':	'User not found.',
    'auth/weak-password':	'Your password is too weak. Password must be at least 6 characters long.',
    'auth/wrong-password':	'Password is wrong.',
    'auth/email-already-in-use':	'This email is already registered!',
    'auth/too-many-requests':	'A lot of requests have been sent recently to this ID, and so access has been temporarily disabled. Please contact us for more info.',
};
export function translateFirebaseError (errMsg) {
    const errors = Object.keys(firebaseErrors);
    let exportedError = undefined
    errors.forEach(error => {
        if (errMsg.code == error) {
            exportedError = firebaseErrors[error];
        }
        // console.log(typeof errMsg.code, errMsg.code)
    })
    return exportedError || errMsg;
}

