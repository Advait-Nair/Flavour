import { createUser, signInUser, getUid, getFunnel, checkIfCodeIsValid, addToFunnel, translateFirebaseError } from './firebase.js';

const errpopPrevContent = document.querySelector('.error-pop').innerHTML;
const errCaptionPrevContent = document.querySelector('.err-caption').innerHTML;


function SigninInit(){
    const signinFormQS = '.sign-in-form'
    const form = {
        // firstNameInput: document.querySelector(`${signinFormQS} .fname`),
        // lastNameInput: document.querySelector(`${signinFormQS} .lname`),
        // nameDisplay: document.querySelector(`${signinFormQS} .name-display`),
        email: document.querySelector(`${signinFormQS} .email`),
        password: document.querySelector(`${signinFormQS} .password`),
    }


    //todo MAKE SURE TO MAKE ALL NAMES LOWERCASE WHEN PASSING INTO FIREBASE

    function getDetails () {
        return {
            // firstName: form.firstNameInput.value || '',
            // lastName: form.lastNameInput.value || '',
            email: form.email.value || '',
            password: form.password.value || '',
        };
    };

    // Signin
    document.querySelector(signinFormQS).addEventListener('submit', e => {
        e.preventDefault();
        const details = getDetails();
        
        if (details.email && details.password) {
            
            // Is existing user?
            signInUser(details.email, details.password, err => {
                msg(translateFirebaseError(err), 'error');
            }, () => {
                msg('Log in request successful!', 'success');
                localStorage.setItem('user', JSON.stringify(details))
                redir('page_dashboard')
                AutoInit();
            });
        } else {
            msg('All fields are to be filled', 'error')
        }
    })


}
function SignupInit() {
	const signUpFormQS = '.sign-up-form';
	const form = {
		firstNameInput: document.querySelector(`${signUpFormQS} .fname`),
		lastNameInput: document.querySelector(`${signUpFormQS} .lname`),
		nameDisplay: document.querySelector(`${signUpFormQS} .name-display`),
		email: document.querySelector(`${signUpFormQS} .email`),
		password: document.querySelector(`${signUpFormQS} .password`),
	};

	// Update Name Display
	function updateNameDisplay() {
		form.nameDisplay.textContent = `${form.firstNameInput.value} ${
			form.lastNameInput.value
		} ${form.email.textContent ? `(${form.email.textContent})` : ''}`;
	}

	form.firstNameInput.addEventListener('keyup', updateNameDisplay);
	form.lastNameInput.addEventListener('keyup', updateNameDisplay);

	//todo MAKE SURE TO MAKE ALL NAMES LOWERCASE WHEN PASSING INTO FIREBASE

	function getDetails() {
		return {
			firstName: form.firstNameInput.value || '',
			lastName: form.lastNameInput.value || '',
			email: form.email.value || '',
			password: form.password.value || '',
		};
	}

	// Signup
	document.querySelector(signUpFormQS).addEventListener('submit', e => {
		e.preventDefault();
		const details = getDetails();

		if (
			details.firstName &&
			details.lastName &&
			details.email &&
			details.password
		) {
			createUser(
				details.firstName,
				details.lastName,
				details.email,
				details.password,
				err => {
                    msg(translateFirebaseError(err), 'error');
				},
                () => {
                    msg('Account created!', 'success');
                    localStorage.setItem('user', JSON.stringify({email:details.email, password:details.password}));
                    redir('page_dashboard');
                    AutoInit();
                }
			);
            
		} else {
			msg('All fields are to be filled', 'error');
		}
	});


}



onSplash();
if (!sessionStorage.getItem('session')) {
    redir('page_splash');
    sessionStorage.setItem('session', 'TRUE');
} else {
    redir('page_loading');
}
document.addEventListener('DOMContentLoaded', e => {
    let loadtime = 4000;
    if (sessionStorage.getItem('session')){
        loadtime = 2000;
    }
    setTimeout(() => {

        finishSplash(() => {
            if (!localStorage.getItem('user')) {
                SignupInit();
                SigninInit();
                AutoInit();
                redir('page_start');
            }
        });
    }, loadtime);
})

// To export and use


export function msg(msg, kind){
    const errpop = document.querySelector('.error-pop');
    const errcap = document.querySelector('.err-caption');
    const errContainer = document.querySelector('.error-container');
    if (!errpop.classList.contains('flex-important')) errContainer.classList.add('flex-important');
    errpop.textContent = msg;
    errcap.textContent = 'INFORMATION';
    
    if(!errContainer.classList.contains(`${kind}-mode`)){
        errpop.classList.add(`${kind}-mode`);
    }
    setTimeout(() => {
        errcap.textContent = errCaptionPrevContent;
        errpop.innerHTML = errpopPrevContent;
        if (errContainer.classList.contains('flex-important'))
			errContainer.classList.remove('flex-important');
        if (errpop.classList.contains(`${kind}-mode`)) {
            errpop.classList.remove(`${kind}-mode`);
        }
    }, 3000);
};

export function modal (title, fields, cb, fatal) {
    if(!fields) return;
    let fieldHTML = '';
    let iteration = 0;
    const output = {};
    fields.forEach(element => {
        output[element.replace(' ', '_').trim()] = {
			id: `modalItem-${iteration}`,
            name: '',
		};
        fieldHTML += `<${
			fatal ? 'div' : 'input'
		} data-mid="modalItem-${iteration}" placeholder="${element}" class="${
			fatal ? 'disabled ' : ''
		}modalChildItem p-1 m-1 no-outline dark round-3 input-field">`;
        iteration++;
    });

    const boilerplate = `
    <div class="modal-wrapper ${
		fatal ? 'fatal ' : ''
	} flex flex-align-center flex-justify-center full-width max-full-viewport-height">
        <form class="modal card p-1 font-inter flex-align-center flex flex-justify-center flex-column">
            <h1 class="p-1">${title}</h1>
            ${fieldHTML}
            <button type="submit" class="round-4 p-1 m-1 block input-field modal-complete">Continue</button>
        </form>
    </div>
    `;
    const modal = document.createElement('div');
    modal.innerHTML = boilerplate;
    let promise = Promise;
    document.body.appendChild(modal);
    document.querySelector('.modal').addEventListener('submit', e => {
        e.preventDefault();
        document.querySelectorAll('.modalChildItem').forEach(element => {
            const elementId = element.dataset.mid;
            output[element.placeholder.replace(' ', '_').trim()] = element.value;
        });
        modal.remove();
        cb(output);
    });
}
export function advancedModal(title, fields, cb) {
	if (!fields) return;
	let fieldHTML = '';
	let iteration = 0;
	const output = {};
	fields.forEach(element => {
		output[element.text.replace(' ', '_').trim()] = {
			id: `modalItem-${iteration}`,
			name: '',
		};
		fieldHTML += `<${element.tag} data-mid="modalItem-${iteration}" ${
			element.tag == 'input'
				? `placeholder="${element.text}"`
				: element.htmlData || ''
		} class="${element.class || ''} ${
			element.tag == 'input' || 'textarea' ? '.modalSubmittableChildItem' : 'modalChildItem'
		} p-1 m-0 no-outline dark round-3 ${
			element.tag == 'input' ? 'input-field' : ''
		}">${element.textIsContent ? element.text : ''}${
			element.closing ? `</${element.tag}>` : ''
		}`;
		iteration++;
	});

	const boilerplate = `
    <div class="modal-wrapper flex flex-align-center flex-justify-center full-width max-full-viewport-height">
        <form class="modal card p-1 font-inter flex-align-center flex flex-justify-center flex-column">
            <h1 class="p-1">${title}</h1>
            ${fieldHTML}
            <button type="submit" class="round-4 p-1 m-1 block input-field modal-complete">Continue</button>
        </form>
    </div>
    `;
	const modal = document.createElement('div');
	modal.innerHTML = boilerplate;
	let promise = Promise;
	document.body.appendChild(modal);
	document.querySelector('.modal').addEventListener('submit', e => {
		e.preventDefault();
		document.querySelectorAll('.modalSubmittableChildItem').forEach(element => {
			const elementId = element.dataset.mid;
			output[element.placeholder.replace(' ', '_').trim()] =
				element.value;
		});
		modal.remove();
		cb(output);
	});
}

function withCredentials (user)
{
    console.log(user);
    getFunnel(user.user.uid, data => {
            // Insert user name onto dashboard

            const fnameplaceholder = document.querySelector('.dash-fname');
			const lnameplaceholder = document.querySelector('.dash-lname');
			const emailplaceholder = document.querySelector('.dash-email');

            fnameplaceholder.textContent = data.firstName;
            lnameplaceholder.textContent = data.lastName;
            emailplaceholder.textContent = JSON.parse(localStorage.getItem('user')).email;
    });
    

    document.querySelector('.joinEvent').addEventListener('submit', e => {
        e.preventDefault();
		const code = document.querySelector('.seccode');
		if (!code.value) return;
		checkIfCodeIsValid(code.value, eventData => {
			addToFunnel(user.user.uid, 'event', [eventData.code]);
            msg('Access code added!', 'success');
            redir('page_dashboard');
		}, () => msg('Not a valid Access Code!', 'error'));
	});
}


function AutoInit() {
    // Auto signin user
	const userInfo = JSON.parse(localStorage.getItem('user'));
	if (userInfo) {
		signInUser(
			userInfo.email,
			userInfo.password,
			err => {
				msg('Auto Sign-in failed.', 'error');
				console.error(err);
				redir('page_signin');
			},
			userCredentials => {
				msg('Auto Sign-in successful!', 'success');
                redir('page_dashboard')
				withCredentials(userCredentials);
			}
		);
	}

}

function onSplash() {
	document.querySelector('.topbar').classList.add('hidden');
	document.querySelector('body').classList.add('no-overflow');
}
function finishSplash(after) {
    document.querySelector('.splash-icon').classList.add('up-out');
    document.querySelector('.adva-alt-splash').classList.add('down-out');
    document.querySelector('#page_splash').classList.add('opacity-zero');
    document.querySelector('#page_loading').classList.add('opacity-zero');
    setTimeout(() => {
        document.querySelector('.topbar').classList.remove('hidden');
        document.querySelector('body').classList.remove('no-overflow');
        after();
    },200);
}

function lerpColor() {

}