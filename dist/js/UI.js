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
                    // redir('page_start')
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


export class UI {
    constructor() {
        this.initialiseTimePicker();
    }

    askForTime(handler) {
        this.forceInputs();
        document.querySelector('.time').classList.remove('from-bottom');
        document.querySelector('.getTime').addEventListener('click', e => {
            e.preventDefault();
            const numberHr1 = document.querySelector(
                '.time-picker-1 .number-hr'
            ).value;
            const numberMin1 = document.querySelector(
                '.time-picker-1 .number-min'
            ).value;

            const numberHr2 = document.querySelector(
                '.time-picker-2 .number-hr'
            ).value;
            const numberMin2 = document.querySelector(
                '.time-picker-2 .number-min'
            ).value;

            const parsed = {
                h1: parseInt(numberHr1.trim().replace('00', '0')),
                h2: parseInt(numberHr2.trim().replace('00', '0')),
                m1: parseInt(numberMin1.trim().replace('00', '0')),
                m2: parseInt(numberMin2.trim().replace('00', '0'))

            }

            if((!parsed.h1 || !parsed.h2 || !parsed.m1 || !parsed.m2) && parsed.h1 != 0 && parsed.h2 != 0 && parsed.m1 != 0 && parsed.m2 != 0) {
                msg('Invalid time', 'error');
            } else if (
				parsed.h1 > 24 ||
				parsed.h2 > 24 ||
				parsed.m1 > 60 ||
				parsed.m2 > 60
			) {
                console.log(parsed)
				msg('Invalid time', 'error');
			} else if (
				parsed.h1 == 24 ||
				parsed.h2 == 24
			) {
				
				msg('Please write 12am as 00:00, not 24:00', 'error');
			} else {
				handler({
					from: parsed.h1 + parsed.m1 / 60,
					to: parsed.h2 + parsed.m2 / 60,
				});
				document.querySelector('.time').classList.add('from-bottom');
			}
        });
    }

    // TODO make handler that returns decimal time & validify

    initialiseTimePicker() {
        const timePicker1 = document.querySelector('.time-picker-1');
        const timePicker2 = document.querySelector('.time-picker-2');

        const increaseHr1 = document.querySelector('.time-picker-1 .hr .increase');
        const decreaseHr1 = document.querySelector('.time-picker-1 .hr .decrease');

        const increaseMin1 = document.querySelector('.time-picker-1 .min .increase');
        const decreaseMin1 = document.querySelector('.time-picker-1 .min .decrease');

        const increaseHr2 = document.querySelector('.time-picker-2 .hr .increase');
        const decreaseHr2 = document.querySelector('.time-picker-2 .hr .decrease');

        const increaseMin2 = document.querySelector('.time-picker-2 .min .increase');
        const decreaseMin2 = document.querySelector('.time-picker-2 .min .decrease');


        const numberHr1 = document.querySelector('.time-picker-1 .number-hr');
        const numberMin1 = document.querySelector('.time-picker-1 .number-min');
        
        const numberHr2 = document.querySelector('.time-picker-2 .number-hr');
        const numberMin2 = document.querySelector('.time-picker-2 .number-min');

        // Functionalise the incrementors and decrementors
        increaseHr1.addEventListener('click', () => this.incrementInputValue(numberHr1));
        decreaseHr1.addEventListener('click', () => this.decrementInputValue(numberHr1));

        increaseMin1.addEventListener('click', () => this.incrementInputValue(numberMin1, true));
        decreaseMin1.addEventListener('click', () => this.decrementInputValue(numberMin1, true));

        increaseHr2.addEventListener('click', () => this.incrementInputValue(numberHr2));
        decreaseHr2.addEventListener('click', () => this.decrementInputValue(numberHr2));

        increaseMin2.addEventListener('click', () => this.incrementInputValue(numberMin2, true));
        decreaseMin2.addEventListener('click', () => this.decrementInputValue(numberMin2, true));

        // Create force focus inputs
        this.forceInputs = () => {
            numberHr1.focus();
            numberHr1.addEventListener('keyup', e => {
                this.moveToNextInput(numberHr1, numberMin1);
            })
            numberMin1.addEventListener('keyup', e => {
                this.moveToNextInput(numberMin1, numberHr2);
            })
            numberHr2.addEventListener('keyup', e => {
                this.moveToNextInput(numberHr2, numberMin2);
            })
            numberMin2.addEventListener('keyup', e => {
                this.moveToNextInput(numberMin2, null);
            })
        }
    }
    incrementInputValue (el, min) {
        let limit = min ? '60' : '23'
        if(!el.value) {
            el.value = '00'
        }
        if(el.value == limit){
            el.value = '00';
        } else
        el.value = this.format(parseInt(el.value) + 1)
    }
    decrementInputValue (el, min) {
        let limit = min ? '60' : '23'
        if(!el.value) {
            el.value = '00'
        }
        if(el.value == '00' || el.value == '0'){
            el.value = limit;
        } else
        el.value = this.format(parseInt(el.value) - 1);
    }
    format(number) {
        return number < 10 ? '0' + number : number;
    }
    moveToNextInput (currentInput, nextInput) {
        console.log(currentInput, nextInput)
        if(currentInput.value.length === 2 && nextInput)
        nextInput.focus()
    }
}



// Calendar

export class Calendar {
    constructor (element) {
        this.targetElement = element;
        this.events = [];
    }

    newRow(time, cols) {
        const tr = document.createElement('tr')
        const th = document.createElement('th')
        const thTime = document.createElement('div')
        thTime.textContent = `${time < 10 ? '0' + time : time}:00`;
        th.classList.add('time-item');
        thTime.classList.add('time-item-text');
        th.appendChild(thTime);
        tr.appendChild(th);
        for (let i = 0; i < cols; i++) {
            const td = document.createElement('td');
            td.classList.add('col-'+i);
            tr.appendChild(td);
        }
        return tr;
    }

    newCalendar(timeRange) {
        const table = document.createElement('table');

        // Responsiveness
        let cols = 10;
        // 1200=14,1000=10,700=8,500=6
        console.log(window.innerWidth, 'sgsdgsdgsgdg')
        if(window.innerWidth >= 1200) {
            cols = 18;
        }
        if(window.innerWidth <= 1000) {
            cols = 10;
        }
        if(window.innerWidth <= 700) {
            cols = 8;
        }
        if(window.innerWidth <= 500) {
            cols = 6;
        }
        console.log('asdasdasfasfasf', cols)

        table.classList.add('vertical', 'full-width')
        for (let i = 0; i < timeRange; i++) {
            const tr = this.newRow(i, cols);
            tr.classList.add('row-'+i);
            table.appendChild(tr);
        }
        this.targetElement.appendChild(table);
    }
    newEvent(args) {
        // Destructure
        const { title, desc, start } = args;
        let { length, end } = args;
        const id = this.events.length || 0;

        if(!length && end) {
            length = end - start
        } else if (!length & !end) {
            console.error('Error creating new Event: no length or end argument provided.')
        }

        // Calculate positional values
        const height = 3.4 * length;
        const distFromTop = 3.4 * (start - Math.floor(start));

        // Find row to start from
        const row = document.querySelector(`.row-${Math.floor(start)}`);

        let chosenCol = 0;
        let colNotChosen = true;
        Array.from(row.children).forEach((ch, index) => {
            if(!ch.querySelector(`.col-${index-1} .event-bubble`) && colNotChosen && index !== 0 && index % 2 !== 0) {
                chosenCol = index - 1;
                colNotChosen = false;
            }
            console.log(index, Array.from(row.children).length);
            if (index + 1 == Array.from(row.children).length && colNotChosen) {
                msg('No more space!', 'error');
            }
        });
        const rowToStartFrom = document.querySelector(
			`.row-${Math.floor(start)} .col-${chosenCol}`
		);

        // Create the main event element
        const element = document.createElement('div');
        element.classList.add('event-bubble', 'transition-all', `event-bubble-${id}`);

        // Create the event title element and insert the title into it
        const elementTitle = document.createElement('event-title');
        elementTitle.textContent = title;
        // Append the event title to the main event element
        element.appendChild(elementTitle);
        

        // Create the event more element and insert extra content into it
        const elementMore = this.createElement('event-more');

        // Add time element
        console.log(start, start + length, length, '529')
        elementMore.appendChild(this.createElement('event-time', this.getTimeRange(start, start + length)));

        // Add desc element
        elementMore.appendChild(this.createElement('event-desc', desc));

        // Add more element
        elementMore.appendChild(this.createElement('button', 'View', 'button'));


        // Append the event element to the main event element
        element.appendChild(elementMore);


        // Append the event element to the row closest to the start position
        rowToStartFrom.appendChild(element);

        // Insert positional styling
        element.style = `top: ${distFromTop}rem; height: ${height}rem`;

        // Create the expanding content effect using event listeners
        element.addEventListener('click', e => {
            e.preventDefault();
            if (!e.target.classList.contains('button')) {
                element.querySelector('event-more').classList.toggle('largify');
                element.classList.toggle('expand-event-bubble');
            }
        })

        // Finally, append this event to the event object
        this.events.push (
            {
                start,
                length,
                title,
                desc,
                end: end || start + length,
                id: id
            }
        )
        this.updateEvents();
    }
    convertFromDecimalToTimeString(time) {
        let hr = Math.floor(time);
        let min = time - Math.floor(time);
        console.log(hr, min, time, '560');

        if(hr === 24) {
            hr = 0;
        }
        if(min === 60) {
            min = 0;
        }


        let formatted = `${this.addZeroToNonDouble(hr)}:${this.addZeroToNonDouble(Math.round(min*60))}`
        return formatted;
    }
    updateEvents () {
        localStorage.setItem('storedCalendarEvents', JSON.stringify(this.events));
    }
    loadEvents () {
        let storedEvents = localStorage.getItem('storedCalendarEvents')
        // Exists or not?
        if(!storedEvents) return;
        // Parse
        storedEvents = JSON.parse(storedEvents);
        // Loop
        storedEvents.forEach((event) => {
            this.newEvent({
                start: event.start,
                length: event.length,
                title: event.title,
                desc: event.desc,
            });
        });

    }
    deleteEvent (eventId) {
        if(!eventId) return;
        this.events.map((v, i) => {
            if(v.id !== eventId)
                return v;
        })
        const eventBubble = document.querySelector('.'+'event-bubble-'+eventId)
        if(eventBubble)
        eventBubble.remove();
    }
    addZeroToNonDouble(n) {
        return `${n < 10 ? '0'+ n : n}`;
    }
    createElement(tag, content, classes) {
        const el = document.createElement(tag);
        if(content)
        el.innerHTML = content;
        if(classes)
        el.className = classes || '';
        return el;
    }
    getTimeRange(start, end) {
        return `${this.convertFromDecimalToTimeString(start)}-${this.convertFromDecimalToTimeString(end)}`
    }
}

