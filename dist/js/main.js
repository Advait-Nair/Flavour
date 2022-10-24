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
import { Calendar, executeFunctionInitiations, modal, sendNotification, sendUINotification, UI } from './UI.js';

const errpopPrevContent = document.querySelector('.error-pop').innerHTML;
// const errCaptionPrevContent = document.querySelector('.err-caption').innerHTML;
const splashWaitTime = 2000;


function SigninInit() {
	const signinFormQS = '.sign-in-form';
	const form = {
		// firstNameInput: document.querySelector(`${signinFormQS} .fname`),
		// lastNameInput: document.querySelector(`${signinFormQS} .lname`),
		// nameDisplay: document.querySelector(`${signinFormQS} .name-display`),
		email: document.querySelector(`${signinFormQS} .email`),
		password: document.querySelector(`${signinFormQS} .password`),
	};

	//todo MAKE SURE TO MAKE ALL NAMES LOWERCASE WHEN PASSING INTO FIREBASE

	function getDetails() {
		return {
			// firstName: form.firstNameInput.value || '',
			// lastName: form.lastNameInput.value || '',
			email: form.email.value || '',
			password: form.password.value || '',
		};
	}

	// Signin
	document.querySelector(signinFormQS).addEventListener('submit', e => {
		loading();
		e.preventDefault();
		const details = getDetails();

		if (details.email && details.password) {
			// Is existing user?
			signInUser(
				details.email,
				details.password,
				err => {
					msg(translateFirebaseError(err), 'error');
				},
				userCred => {
                    getFunnel(userCred.user.uid, data => {
                        console.log(data, data.userType)
                        if (
							data.userType == 'coordinator' ||
							data.userType == 'admin'
						) {
							msg('Log in request successful!', 'success');
							localStorage.setItem(
								'user',
								JSON.stringify(details)
							);
							redir('page_dashboard');
							AutoInit();
						} else {
							// msg('You are not a coordinator. You cannot access this application. Something wrong? Contact us.','error');
							sendUINotification(
								'You are not a coordinator. You cannot access this application.',
								'INFORMATION',
								'You have insufficient permissions to access this application.',
                                'What does this app do?',
                                'This is the Coordinator version of the Coordinata app. This app is used by event organisers to manage events. In order to use this application, you have to contact us and we will set up an event for you.'
							);
						}

                        if(data.userType == 'admin') {
                            console.enable('7422');
                        }
                    });
				}
			);
		} else {
			msg('All fields are to be filled', 'error');
		}
	});
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
		loading();
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
				userCred => {
					msg('Account created!', 'success');
					localStorage.setItem(
						'user',
						JSON.stringify({
							email: details.email,
							password: details.password,
						})
					);
					redir('page_dashboard');
					AutoInit();
					requiresUpdate(
						fetchRegisteredEventsAndUpdate,
						userCred.user.uid
					);
				}
			);
		} else {
			msg('All fields are to be filled', 'error');
		}
	});
}

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
    SignupInit();
    SigninInit();
    executeFunctionInitiations();

    AutoInit(() => {
        setTimeout(() => {
            finishSplash(() => {
                redir('page_start');
                    if (!localStorage.getItem('consent')) {
						usageInfo();
						localStorage.setItem('consent', 'understands');
					}
            })
        }, splashWaitTime + 200)
    });

    if (sessionStorage.getItem('reloadpageon')) {
        setTimeout(() => {
            redir(sessionStorage.getItem('reloadpageon'));
        }, 2000);
    }
})

// To export and use

export function msg (message, kind) {
    const durationTime = message.length * 150 * 0.9;
    const errpop = document.querySelector('.error-pop');
    const errContainer = document.querySelector('.error-container');
    if (!errContainer.classList.contains('hidden')) {
        setTimeout(() => {
            pmsg(message, kind);
        }, durationTime + 200);
    } else {
        pmsg(message, kind);
    }
}

export function pmsg(msg, kind){
    // Get elements
    let durationTime = (msg.length * 150) * .9
    const errpop = document.querySelector('.error-pop');
    const errContainer = document.querySelector('.error-container');
    // document.body.appendChild(errpop)
    // document.body.appendChild(errContainer)
    // Make them visible
    errContainer.classList.remove('hidden');
    if (!errpop.classList.contains('flex-important')) errContainer.classList.add('flex-important');


    // Add content to them after 2 seconds to get transition to phase in
    // errpop.classList.add('phase-in');
    errpop.classList.add('phaseable');
    errpop.textContent = '';
    errpop.style = 'width: ' +  + 'ch';
    errpop.style += 'height: ' + 1 + 'rem';
    let height = (msg.length / 50);
    height = Math.round(height);
    if (height < 1) {
        height = 1.7
    }
    errpop.style = `
    width: ${msg.length * 1.1}ch;
    height: ${height * 3}ch;
    `;
    
    
    setTimeout(() => {
        errpop.classList.remove('err-pop-empty');
        // errpop.classList.remove('phase-in');
        // errpop.textContent = msg;
    }, 200)
    setTimeout(() => {
        // errpop.classList.remove('err-pop-empty');
        // errpop.classList.remove('phase-in');
            errpop.style = `
            width: ${msg.length * 1.1}ch;
            `;
            // height: ${height * 3}ch;
        errpop.textContent = msg;
    }, 500)
    
    
    // Set the message type so styling can apply
    if (kind) {
        if(!errContainer.classList.contains(`${kind}-mode`)){
            errpop.classList.add(`${kind}-mode`);
        }
    }
    
    // Set the content to nothing for transition to phase out
    setTimeout(() => {
		errpop.innerHTML = '';
		errpop.classList.add('phaseable');
            errpop.style = `
            width: ${msg.length * 1.1}ch;
            height: ${height * 3}ch;
            `;
		errpop.classList.add('err-pop-empty');
	}, durationTime);
    
    // Close the message after 3.2 seconds
    setTimeout(() => {
		// errpop.classList.remove('phase-out')
		errContainer.classList.add('hidden');
		// errpop.innerHTML = errpopPrevContent;
		if (errContainer.classList.contains('flex-important'))
			errContainer.classList.remove('flex-important');

		if (kind) {
			if (errpop.classList.contains(`${kind}-mode`)) {
				errpop.classList.remove(`${kind}-mode`);
			}
		}
	}, durationTime + 200);
};
window.msg = msg;

function cancelEventCreationDialog() {
    const createEventButton = document.querySelector('.createEventTrigger');
    const dialog = document.querySelector('.createEventDialog');

    dialog.classList.add('from-bottom');
    createEventButton.classList.toggle('plus-wrapper');
    createEventButton.classList.toggle('cross-wrapper');
    createEventButton.classList.toggle('recte');
}

window.cancelEventCreationDialog = cancelEventCreationDialog;
function withCredentials (user)
{
	document.querySelector('#page_loading').classList.add('opacity-zero');
	
	window.uid = user.user.uid;

    const calendar = new Calendar(document.querySelector('#calendar'));
    calendar.newCalendar(24);
    calendar.loadEvents();

    const createEventButton = document.querySelector('.createEventTrigger')
    const createEventForm = document.querySelector('.createEventDialog');
    let dashlaneIsInUse = false;
    createEventForm.querySelectorAll('*').forEach(item => {
        if(item.dataset.dashlanecreated == 'true') {
            item.remove();
            dashlaneIsInUse = true;
        }
    });
    window.dashlaneIsInUse = dashlaneIsInUse;

    const dialog = document.querySelector('.createEventDialog');
    const submitBtn = document.querySelector('.submit-createEvent');

    const ui = new UI();
    const dateEl = document.querySelector(
        '.createEventDialog .getEvent'
    );
    let timings = null;
    dateEl.addEventListener('click', () => {
        ui.askForTime(time => {
            timings = time;
            const sample1 = document.querySelector(
                '.createEventDialog .sample-time-1'
            );
            const sample2 = document.querySelector(
                '.createEventDialog .sample-time-2'
            );
            sample1.textContent = calendar.convertFromDecimalToTimeString(time.from);
            sample2.textContent = calendar.convertFromDecimalToTimeString(
				time.to
			);
        });
    });

    submitBtn.addEventListener('click', e => {
        e.preventDefault();


        const titleEl = document.querySelector(
            '.createEventDialog .eventTitle'
        );
        const descEl = document.querySelector(
            '.createEventDialog .eventDesc'
        );
        
        const title = titleEl.value;
        const desc = descEl.value;

        if(title.trim() == '' || desc.trim() == '' || !timings) {
            msg('Fill all fields.', 'error');
            return
        };
        cancelEventCreationDialog();

        titleEl.value = ''
        descEl.value = ''
        calendar.newEvent({
            title,
            desc,
            start: timings.from,
            length: timings.to - timings.from,
        });
    })
    createEventButton.addEventListener('click', e => {
        createEventButton.classList.toggle('plus-wrapper');
        createEventButton.classList.toggle('cross-wrapper');
        createEventButton.classList.toggle('recte');
        dialog.classList.toggle('from-bottom');
    })
}

document.querySelector('.cancel-createEvent').addEventListener('click', cancelEventCreationDialog)


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
                    
                    if (sessionStorage.getItem('reloadpageon')) {
                        setTimeout(() => {
                            redir(sessionStorage.getItem('reloadpageon'));
                        }, 2000);
                    } else {
                        redir('page_signin');
                    }
                })
			},
			userCredentials => {
                msg('Auto Sign-in successful!', 'success');
                finishSplash(() => {
                    if (sessionStorage.getItem('reloadpageon')) {
                        setTimeout(() => {
                            redir(sessionStorage.getItem('reloadpageon').replace('#', ''));
                        }, 2000);
                    } else {
                        redir('page_dashboard')
                    }
                    withCredentials(userCredentials);
                })
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
            window.loadingComplete = true;
		}, 200);
	}, sessionWait);
}


export function loading () {
    msg('Please Wait...',)
}


export function getCurrentLocalEventName() {
    document.querySelectorAll('.event-name-fetch').forEach(element => {
        element.textContent = JSON.parse(localStorage.getItem('eventTarget')).eventName
    });
}
