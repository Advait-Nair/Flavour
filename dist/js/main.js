import {
	createUser,
	signInUser,
	getUid,
	getFunnel,
	getCodePublicisedData,
	addToFunnel,
	translateFirebaseError,
	isSignedUptoEvent,
} from './firebase.js';
import { executeFunctionInitiations, modal } from './UI.js';

const errpopPrevContent = document.querySelector('.error-pop').innerHTML;
const errCaptionPrevContent = document.querySelector('.err-caption').innerHTML;
const splashWaitTime = 2000;

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


// let requestedPage = location.hash;
// if (
// 	requestedPage == '' ||
// 	requestedPage == '#page_loading' ||
// 	requestedPage == '#page_splash' ||
// 	requestedPage == '#page_signed_out'
// ) {
//     console.log(requestedPage.replace);
// 	redir('page_dashboard');
// }
// console.log(requestedPage); 0 

onSplash();
let waitTime = splashWaitTime;
if (!sessionStorage.getItem('session')) {
    redir('page_splash');
    sessionStorage.setItem('session', 'TRUE');
} else {
    redir('page_loading');
}
if(sessionStorage.getItem('session')) {
    waitTime = 100;
}
// setTimeout(() => {
//     document.querySelector('.topbar').classList.remove('hidden');
//     document.querySelector('body').classList.remove('no-overflow');
// }, waitTime + 200)
document.addEventListener('DOMContentLoaded', e => {
    // if (sessionStorage.getItem('session')){
    //     loadtime = 100;
    // }
    // window.navigator.getBattery().then(d => console.log(d));
    // // todo battery?
    SignupInit();
    SigninInit();
    executeFunctionInitiations();
    if(!localStorage.getItem('consent')) {
        usageInfo();
        localStorage.setItem('consent', 'understands')
    }

    AutoInit(() => {
        setTimeout(() => {
            finishSplash(() => {
                redir('page_start');
            })
        }, splashWaitTime + 200)
        // if (!localStorage.getItem('user')) {
        // } else {
        //     redir('page_dashboard');
        // }
    });
    // if (sessionStorage.getItem('session')) {
	// 	finishSplash(() => {

    //     });
	// }

    // setTimeout(() => {
    //     finishSplash(() => {
    //     });
    // }, loadtime);
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

// /* 
//  * @Deprecated 
// */
// export function modal (title, fields, cb, fatal) {
//     if(!fields) return;
//     let fieldHTML = '';
//     let iteration = 0;
//     const output = {};
//     fields.forEach(element => {
//         output[element.replace(' ', '_').trim()] = {
// 			id: `modalItem-${iteration}`,
//             name: '',
// 		};
//         fieldHTML += `<${
// 			fatal ? 'div' : 'input'
// 		} data-mid="modalItem-${iteration}" placeholder="${element}" class="${
// 			fatal ? 'disabled ' : ''
// 		}modalChildItem p-1 m-1 no-outline dark round-3 input-field">`;
//         iteration++;
//     });

//     const boilerplate = `
//     <div class="modal-wrapper ${
// 		fatal ? 'fatal ' : ''
// 	} flex flex-align-center flex-justify-center full-width max-full-viewport-height">
//         <form class="modal card p-1 font-inter flex-align-center flex flex-justify-center flex-column">
//             <h1 class="p-1">${title}</h1>
//             ${fieldHTML}
//             <button type="submit" class="round-4 p-1 m-1 block input-field modal-complete">Continue</button>
//         </form>
//     </div>
//     `;
//     const modal = document.createElement('div');
//     modal.innerHTML = boilerplate;
//     let promise = Promise;
//     document.body.appendChild(modal);
//     document.querySelector('.modal').addEventListener('submit', e => {
//         e.preventDefault();
//         document.querySelectorAll('.modalChildItem').forEach(element => {
//             const elementId = element.dataset.mid;
//             output[element.placeholder.replace(' ', '_').trim()] = element.value;
//         });
//         modal.remove();
//         cb(output);
//     });
// }

function withCredentials (user)
{
    document
        .querySelector('#page_loading')
        .classList.add('opacity-zero');
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
		getCodePublicisedData(
			code.value,
			eventData => {
				addToFunnel(user.user.uid, 'event', [eventData.code]);
				msg('Access code added!', 'success');
				redir('page_dashboard');
				enableFeatures(user);
				addEventToApp(eventData.code, eventData.name);
			},
			() => msg('Not a valid Access Code!', 'error')
		);
	});

    enableFeatures(user);
}
function enableFeatures(user) {
    getFunnel(user.user.uid, data => {
        console.log(data.event.length);
        if (data.event.length > 0) {
            console.log(data.event);
            document.querySelector('.event-on').classList.remove('disabled');
        }
    })
}

function usageInfo () {
    modal('We use analytics technologies.', [
		{
			tag: 'p',
			text: 'We use this to better understand how to improve our product. Your data will remain private at no cost.',
			class: 'bold block card text-c no-border p-0 full-width',
			closing: true,
			textIsContent: true,
		},
		{
			tag: 'p',
            styling: 'mt-1',
			text: 'If you have any concerns, please <a href="#page_contact">contact us</a> and we will respond to your problem.',
			closing: true,
			textIsContent: true,
		},
	],() => {}, false, [
        {
            styling: 'p-1 round-4',
            onclick: "document.querySelector('.modal-wrapper').remove();",
            content: 'I understand & consent'
        }
    ])
    // `
    //     <div class="analytics-tech-usage-info z100 p-2 m-1 topleft-abs round-4 card">
    //         <h2>We use analytics technologies.</h2>
    //         <p>We use this to better understand how to improve our product. Your data will remain private at no cost.</p>
    //         <p>If you have any concerns, please <a href="#page_contact">contact us</a> and we will respond to your problem.</p>
    //         <br>
    //         <button class="p-1 round-4 full-width">I understand</button>
    //     </div>
    // `;
}
function AutoInit(elseCB) {
    // Auto signin user
	const userInfo = JSON.parse(localStorage.getItem('user'));
	if (userInfo) {
		signInUser(
			userInfo.email,
			userInfo.password,
			err => {
				msg('Auto Sign-in failed.', 'error');
				console.error(err);
                finishSplash(() => {
                    redir('page_signin');
                    if (sessionStorage.getItem('reloadpageon')) {
                        setTimeout(() => {
                            redir(sessionStorage.getItem('reloadpageon'));
                        }, 2000);
                    }
                })
			},
			userCredentials => {
                msg('Auto Sign-in successful!', 'success');
                finishSplash(() => {
                    // console.log(requestedPage);
                    redir('page_dashboard')
                    if (sessionStorage.getItem('reloadpageon')) {
                        setTimeout(() => {
                            redir(sessionStorage.getItem('reloadpageon').replace('#', ''));
                        }, 2000);
                    }
                    // if (
					// 	requestedPage != '' ||
					// 	requestedPage != '#page_loading' ||
					// 	requestedPage != '#page_splash' ||
					// 	requestedPage != '#page_signed_out'
					// ) {
                    //     redir(requestedPage.replace('#', ''));
                    //     console.log('sd')
                    // }
                    // else {
                    //     console.log('sd')
                    // }
						// redir(requestedPage);
                    withCredentials(userCredentials);
                })
                // closeLoading();
			}
		);
	} else {
        elseCB();
    }

}

function onSplash() {
	document.querySelector('.topbar').classList.add('hidden');
	document.querySelector('body').classList.add('no-overflow');
}
function finishSplash(after) {
    let sessionWait = splashWaitTime;
    if(sessionStorage.getItem('session')) {
        sessionWait = 1;
    }
    setTimeout(() => {
		document.querySelector('.splash-icon').classList.add('up-out');
		document.querySelector('.adva-alt-splash').classList.add('down-out');
		document.querySelector('#page_splash').classList.add('opacity-zero');
		document.querySelector('#page_loading').classList.add('opacity-zero');
		setTimeout(() => {
			document.querySelector('.topbar').classList.remove('hidden');
			document.querySelector('body').classList.remove('no-overflow');
			after();
		}, 200);
	}, sessionWait);
}

function lerpColor() {

}

export function addEventToApp(code) {
    localStorage.setItem('eventTarget', code);
    
    document.querySelector('.signed-up-events').innerHTML += `
    <button class="event-item dark card no-border current round-5 mb-1 p-1 block full-width">
        <h5 class="event-code slightly-grey text-l fetching">${code}</h5>
        <span class="event-name fetching">${eventName}</span>
    </button>
    `;
}