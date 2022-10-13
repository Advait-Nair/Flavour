export function toggleOverflow() {
    document.querySelector('body').classList.toggle('no-overflow');
}
export function enableOverflow() {
    document.querySelector('body').classList.remove('no-overflow');
    // document.querySelector('.modal-wrapper').classList.add('auto-overflow');
}
export function disableOverflow() {
    document.querySelector('body').classList.add('no-overflow');
}

export function modal(title, fields, cb, cancellable, btns) {
	if (!fields) return;
    // disableOverflow();
	let fieldHTML = '';
	let iteration = 0;
	const output = {};
	fields.forEach(element => {
        console.log(
            element.tag, element.tag == 'input',
			element.tag == 'input' || element.tag == 'textarea'
				? 'modalSubmittableChildItem'
				: 'modalChildItem'
		);
		// output[element.text.replace(' ', '_').trim()] = {
		// 	id: `modalItem-${iteration}`,
		// 	name: '',
		// };
		fieldHTML += `<${element.tag} data-mid="modalItem-${iteration}" ${
			element.tag == 'input' ||  element.tag == 'textarea'
				? `placeholder="${element.text}"`
				: element.htmlData || ''
		} class="${element.styling || element.class || ''} ${
			element.tag == 'input' || element.tag == 'textarea'
				? 'modalSubmittableChildItem'
				: 'modalChildItem'
		} p-1 m-0 no-outline dark round-3 ${
			element.tag == 'input' ? element.tag == 'input-field' : ''
		}">${element.textIsContent ? element.text : ''}${
			element.closing ? `</${element.tag}>` : ''
		}`;
		iteration++;
	});

    let btnHTML = `<button type="submit" class="half-width round-4 p-1 m-1 block input-field modal-complete">Continue</button>
        ${
            cancellable
                ? `
        <button class="half-width round-4 p-1 m-1 recte block input-field modal-complete" onclick="document.querySelector('.modal-wrapper').remove();document.querySelector('body').classList.remove('no-overflow');">Cancel</button>
        `
                : ''
        }`;
    if(btns) {
        btnHTML = '';
        btns.forEach(btn => {
            btnHTML += `
            <button class="half-width round-4 p-1 m-1 ${btn.styling} block input-field modal-complete" onclick="${btn.onclick}">${btn.content}</button>
            `;
        })
        if(cancellable) {
            btnHTML += `
            <button class="half-width round-4 p-1 m-1 recte block input-field modal-complete" onclick="document.querySelector('.modal-wrapper').remove();document.querySelector('body').classList.remove('no-overflow');">Cancel</button>
            `;
        }
    }

	const boilerplate = `
    <div class="modal-wrapper flex flex-align-center flex-justify-center full-width max-full-viewport-height auto-overflow">

        <form class="modal p-1 font-inter flex-align-center flex flex-justify-center flex-column">

        <div class="flex-align-center flex flex-justify-center modal-content-box flex-column round-4 dark p-1 mt-1 auto-overflow">
        <h1 class="p-1 empty"></h1>
        <h1 class="p-1 modalTitle">${title}</h1>
        ${fieldHTML}
        </div>
        <div class="flex-align-center flex flex-justify-center bottom-tray round-4 dark mt-1 full-width">
        ${btnHTML}
        </div>

        </form>
    </div>
    `;
	const modal = document.createElement('div');
	let promise = Promise;
    if (document.querySelector('.modal-wrapper')) {
		document.querySelector('.modal-wrapper').remove();
	}
	document.body.appendChild(modal);
	modal.outerHTML = boilerplate;
	document.querySelector('.modal').addEventListener('submit', e => {
		e.preventDefault();
		document
			.querySelectorAll('.modalSubmittableChildItem')
			.forEach(element => {
				const elementId = element.dataset.mid;
                console.log(element, element.placeholder, element.value)
				output[element.placeholder.replaceAll(' ', '_').trim()] =
					element.value;
			});
		modal.remove();
		cb(output, () => {enableOverflow();document.querySelector('.modal-wrapper').remove();});
        enableOverflow();
	});
}



// Functions
import { signOutUser, updateFunnel } from './firebase.js';
import { msg } from './main.js';
export function executeFunctionInitiations() {
    const closing = true;
    const textIsContent = true;
    window.logOut = function () {
        localStorage.clear();
        signOutUser(
            err => {
                console.error(err);
            },
            () => {
                msg('Logged out successfully!', 'success');
                redir('page_signed_out');
                setTimeout(() => {
                    redir('page_start')
                }, 4000);
            }
        );
    };
    window.settings = () => {
        modal(
            'User Settings',
            [
                {
                    tag: 'h3',
                    text: 'Edit Name',
                    class: 'bold block card text-c no-border p-0 full-width',
                    closing,
                    textIsContent,
                },
                { tag: 'input', text: 'First Name', class: 'm-1' },
                { tag: 'input', text: 'Last Name', class: 'm-1' },
            ],
            data => {
                try {
                    if(data.First_Name.trim() !== '' && data.Last_Name.trim() !== '') {
                    updateFunnel(window.uid, {
                        firstName: data.First_Name,
                        lastName: data.Last_Name,
                    })
                    msg('Changes saved. Reloading to apply effects...');
                    setTimeout(() => {
                        location.reload()
                    }, 1000)
                    } else {
                        msg('You can\'t leave your name blank!','error')
                    }
                } catch {
                    console.error(err);
                    msg('Something has gone wrong.');
                }
            }
        , true, [
            {
                styling: 'go-btn',
                onclick: '',
                content: 'Save'
            }
        ]);
    };
}

export const closing = true
export const textIsContent = true
export function closeModal () {
    enableOverflow();
	document.querySelector('.modal-wrapper').remove();
}

export function requestForNotification (title, message) {
    Notification.requestPermission().then(result => {
        // if(!localStorage.getItem('notifications')) {
        //     sendNotification(title, msg);
        //     localStorage.setItem('notifications', JSON.stringify(result));
        // }
        if (result !== 'granted' && !localStorage.getItem('notificationsDeniedMoreThanOnce')) {
			setTimeout(() => {
                window.msg(
                    "Notifications permission seems to have been denied. Coordinata can't send you updates on your events!",
                    'error'
                );
                localStorage.setItem('notificationsDeniedMoreThanOnce', '+')
            }, 9000);
		} else if(result === 'granted') {
        }
    });
}
export function sendSystemNotification(title, type, msg, moreTitle, more) {
	const img = './coordinata.png';
	const notification = new Notification(title, {
		body: `${type || 'cd'} | ${msg || '1 New Notification'}. ${moreTitle || ''}${more || moreTitle ? ' - ' : ''}${more || ''}`,
		icon: img,
	});
}

export function sendNotification(title, type, msg, moreTitle, more) {
	if (document.hasFocus()) {
		sendUINotification(title, type ? type.toUpperCase() : 'MESSAGE', msg, moreTitle, more);
	} else {
        sendSystemNotification(title, type ? type.toUpperCase() : 'MESSAGE', msg, moreTitle, more);
        sendUINotification(title, type ? type.toUpperCase() : 'MESSAGE', msg, moreTitle, more);
    }
}

export function sendUINotification (title, type, msg, moreTitle, more) {
    const notificationBar = document.querySelector('.notification-bar');
    const notificationBarWrapper = document.querySelector('.notification-bar-wrapper');

    notificationBarWrapper.classList.remove('phase-notification-out');
    const notificationTitle = document.querySelector('.notification-title');
    const notificationContent = document.querySelector('.notification-msg');
    const notificationType = document.querySelector('.notification-type');
    const notificationMoreTitle = document.querySelector('.notification-moreTitle');
    const notificationMore = document.querySelector('.notification-more');
    notificationTitle.textContent = title || 'cd';
    notificationContent.textContent = msg || '1 New Notification';
    notificationType.textContent = type || 'MESSAGE';
    notificationMoreTitle.textContent = moreTitle || '';
    notificationMore.textContent = more || '';

    notificationBar.addEventListener('click', e => {
        // isFullView = true;
        if(e.target.classList.contains('cancel-wrapper')) return;
        notificationBar.classList.toggle('bring-notification-to-full-scale');
        document.querySelector('.notification-bar-wrapper').classList.toggle('full-imp');
        document.querySelector('.notification-bar .extra-content').classList.toggle('hidden');
        // tick = 0;
        // IsHolding = true;
        })
    // const el = document.createElement('div')
    // document.body.appendChild(el);
    // el.outerHTML = HTML;

}

requestForNotification('Hello! Notifications are now on.', 'Now you can keep up to date with your events!')

window.requestForNotification = requestForNotification;
window.sendSystemNotification = sendSystemNotification;
window.sendUINotification = sendUINotification;
window.sendNotification = sendNotification;





export class QR {
	constructor(apiKey) {
		this.key = apiKey;
	}

	createParameters(text, parameterArray) {
		// Get the necessary parameters and put into into basicParameters
		// Putting the API key and URL content into basicParameters
		let basicParameters = `?cht=qr&chl=${text}`;
		this.text = text;

		// Format any parameters that are passed in
		let parameterString = basicParameters;
		parameterArray.forEach(param => {
			// This will be used to format parameter values
			let parameterValue = param.value;

			// If a color gets passed in HEX form, replace it with URL encoding
			if (param.value.includes('#'))
				parameterValue = param.value.replace('#', '%23');

			// Assign the formatted parameter data to parameterString
			parameterString += `
			&${param.name}=${parameterValue}
			`;
		});

		// Return the formatted parameter string
		return parameterString;
	}

	createImage(parameterFunctionData) {
		// Create the URL
		// let url = `https://api.qr-code-generator.com/v1/create${parameterFunctionData}`;
		let url = `https://chart.googleapis.com/chart${parameterFunctionData}`;

		// Create the image
		let image = new Image();
        image.classList.add('qr-code');
		image.src = url;

		// Return the image
		return image;
	}
}