import { modal, closing, textIsContent, closeModal } from "./UI.js";

// Debug System for more streamlined development
const Debug = {};

export const Boilerplates = {
    viewMore: (content) => {
        // <div class="log-${kind} card p-key">
        window.vconsole_items.push({
			content,
			id: window.vconsole_items.length + 1,
		});
        // document.querySelector('.vconsole-inserter').innerHTML = content;
        return `
        <button class="s-caption round-4 dark vc-inserter-${window.vconsole_items.length}" onclick="redir('page_vconsole');document.querySelector('.vconsole-inserter').innerHTML = window.vconsole_items[${window.vconsole_items.length-1}].content;">VIEW</button>
        `;
        // </div>
        // <p class="content p-key">${contentView(content)}</p>
        }
};

export function log (kind, type, content) {
    document.querySelector('.DEBUG .log').innerHTML += `
    <div class="log-${kind} card p-key">
        <div class="s-caption">${type}</div>
        <p class="content p-key">${contentView(content)}</p>
    </div>`;
}
export function rawLog (kind, type, content) {
    document.querySelector('.DEBUG .log').innerHTML += `
    <div class="log-${kind} card p-key">
        <div class="s-caption">${type}</div>
        <p class="content p-key">${content}</p>
    </div>`;
}
export function contentView(msg) {
    let exportItem = JSON.stringify(msg);
    // if(exportItem instanceof String || typeof exportItem == 'string') {
    //     console.log(exportItem);  
    // } 
    // try {
    //     exportItem = JSON.stringify(exportItem);
    // } catch {
    //     exportItem = toString(msg);

    // }
    // // }
    if(exportItem.length > 70) {
        // modal('View log', [
		// 	{
		// 		tag: 'p',
		// 		text: 'hig',
		// 		class: 'bold block card text-c no-border p-0 full-width wrap auto-overflow',
		// 		closing,
		// 		textIsContent,
		// 	},
		// ], () => {}, false, [
        //     {
        //         content:'Hello',
        //         onclick: "alert('Ok, ok!')",
        //         styling: 'frigus-purpura'
        //     },
        // ]);
        exportItem = Boilerplates.viewMore(JSON.stringify(msg));
    }
    return exportItem;
}

export function displayPages () {
    let pages = '';
    document.querySelectorAll('.page').forEach(page => {
        pages += `<button onclick="redir('${page.id}');document.querySelector('.currentpagedbg').textContent = location.hash;" class="round-3 p-1 inline bold dark">${page.id}</button>`;
        // {
        //     tag: 'span',
        //     class: '',
        //     text: page.id,
        //     closing,
        //     textIsContent
        // }
    })
    modal(
		'All Pages',
		[
			{
				tag: 'div',
				class: 'grid grid-2 m-1',
				text: pages,
				closing,
				textIsContent,
			},
			{
				tag: 'span',
				class: 'grid grid-2 m-1 currentpagedbg text-c block',
				text: location.hash,
				closing,
				textIsContent,
			},

		],
		() => {},
		false,
		[
			{
				styling: '',
				onclick:
					"sessionStorage.setItem('reloadpageon', location.hash);",
				content: 'Keep after reloading',
			},
			{
				styling: 'dark',
				onclick:
					"document.querySelector('.modal-wrapper').remove();document.querySelector('body').classList.remove('no-overflow');",
				content: 'Close',
			},
		]
	);
}

export function storageOps() {
    let lsItems = '';
    let ssItems = '';
    Object.keys(localStorage).forEach(lsItem => {
        lsItems += `<button onclick="localStorage.removeItem('${lsItem}');this.remove();" class="round-3 p-1 inline bold dark">${lsItem}: ${localStorage.getItem(lsItem).length < 50 ? localStorage.getItem(lsItem) : 'Contents too large to display'}</button>`;
        // {
        //     tag: 'span',
        //     class: '',
        //     text: page.id,
        //     closing,
        //     textIsContent
        // }
    });
    Object.keys(sessionStorage).forEach(ssItem => {
        ssItems += `<button onclick="sessionStorage.removeItem('${ssItem}');this.remove();" class="round-3 p-1 inline bold dark">${ssItem}: ${sessionStorage.getItem(ssItem).length < 50 ? sessionStorage.getItem(ssItem) : 'Contents too large to display'}</button>`;
        // {
        //     tag: 'span',
        //     class: '',
        //     text: page.id,
        //     closing,
        //     textIsContent
        // }
    });
    modal(
		'LocalStorage and SessionStorage Options',
		[
			{
				tag: 'span',
				class: 'm-1 round-4 dark bold',
				text: 'Click on an item to remove it.',
				closing,
				textIsContent,
			},
			{
				tag: 'h3',
				class: 'dark',
				text: 'LocalStorage Items',
				closing,
				textIsContent,
			},
			{
				tag: 'div',
				class: 'm-1',
				text: lsItems,
				closing,
				textIsContent,
			},
			{
				tag: 'h3',
				class: 'dark',
				text: 'SessionStorage Items',
				closing,
				textIsContent,
			},
			{
				tag: 'div',
				class: 'm-1',
				text: ssItems,
				closing,
				textIsContent,
			},
		],
		() => {},
		false,
		[
			{
				styling: 'recte',
				onclick:
					"sessionStorage.clear();localStorage.clear();",
				content: 'Clear All',
			},
			{
				styling: 'dark',
				onclick:
					"document.querySelector('.modal-wrapper').remove();document.querySelector('body').classList.remove('no-overflow');",
				content: 'Close',
			},
		]
	);
}

// todo handle overflow of log messages on mobile