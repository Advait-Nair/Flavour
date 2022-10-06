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
import { signOutUser } from './firebase.js';
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
                console.log(data);
            }
        , true);
    };
}

export const closing = true
export const textIsContent = true
export function closeModal () {
    enableOverflow();
	document.querySelector('.modal-wrapper').remove();
}