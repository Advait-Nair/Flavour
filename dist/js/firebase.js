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
import {modal} from './main.js';
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
            
            createUserDataFunnel(userCredential.user, fname, lname);
            successFunc() || undefined;
        })
        .catch(err => {console.error(err.code, err.message); errorFunc(err);});
}
export function signInUser(email, password, errorFunc, successFunc) {
    signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
        successFunc(userCredential) || undefined;
        DoesUserAlreadyHaveFunnel(userCredential.user.uid, () => {
            modal('What is your name?', ['First Name', 'Last Name'], data => {
                createUserDataFunnel(userCredential.user, data.First_Name, data.Last_Name);

            });
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

export async function checkIfCodeIsValid (code, handle, error) {
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