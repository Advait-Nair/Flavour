export function modal(title, fields, cb, fatal) {
	if (!fields) return;
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
			output[element.placeholder.replace(' ', '_').trim()] =
				element.value;
		});
		modal.remove();
		cb(output);
	});
}


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
