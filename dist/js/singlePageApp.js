// Configure your SPA options here
const base = {
    page_prefix: 'page_',
    // Also hides pop out navbuttons when hidden
    hideTopbarWhenScrollEnabled: false,
    // Homepage doesn't need 'page_' or the prefix. It's already added here.
    // (That doesn't mean you don't have to put page_ or the prefix on the page element's id!)
    homepage: 'dashboard'
}



/* How it works
 * This is a simple SPA implementation that you can use for your website. 
 * It works by calling the function redir(). When a page needs to be changed.
 * Pages can be made using divs or any semantically equivalent element that has an id attribute.
 * The page's id attribute has to start with a prefix: By default it is 'page_'.
 * 
 * PAGES HAVE TO HAVE THE 'page' CLASS!
 * 
 * It is recommended that you build a 404 error page as this is the default page that users get routed to,
 * when they can't access a page as it can't be found.
 * 
 * You can use toLightMode and toDarkMode to change colour modes. For this you need a css file with a dark and light css file in it. Your html file must also include a stylesheet with a class called 'main_stylesheet'. DO THIS OR COLOUR MODES WON'T WORK!
 * 
 * Summary:
 * Redirect users to pages using redir(pageName);
 * use toDarkMode and toLightMode to change colour modes.
 * Build a 404 error page as this is the default page that users get routed to
 * Make pages using elements such as divs or sections with and id that starts with the prefix: By default it is 'page_'.
 * 
 * 
 */


// Enums
class Enums {
	constructor(value) {
		if (value !== Enums) {
			this.value = value;
		} else {
			this.value = value.value;
		}
	}
	static toEnum(store, key, value) {
		store[key] = new Enums(value);
	}
}
const enumKey = {
	lightMode: new Enums('light'),
	darkMode: new Enums('dark'),
};


// Init vars
const topbar = document.querySelector('.topbar');
const navbuttons = document.querySelector('.topbar .navbuttons');
const topbarRedirect = document.querySelectorAll('.topbar .redirect');

// set default page (if currently no hash)
const hash = document.location.hash;
redir(hash.replace('#', '') || `${base.page_prefix}${base.homepage}`);
showTopbar();



document.addEventListener('DOMContentLoaded', e => {
	if (
		hash == '#page_dashboard' ||
		hash == '#page_start' ||
		hash == '#page_loading' ||
		hash == '#page_splash'
	) {
		document.querySelector('.back-btn').classList.add('side-hidden');
	} else {
		document.querySelector('.back-btn').classList.remove('side-hidden');
	}
})
window.onhashchange = () => {
	const hash = document.location.hash;
	redir(hash.replace('#', '') || `${base.page_prefix}${base.homepage}`);
	showTopbar();
	console.log(location.hash)
	if (hash == '#page_dashboard' || hash == '#page_start') {
		document.querySelector('.back-btn').classList.add('side-hidden');
	} else {
		document.querySelector('.back-btn').classList.remove('side-hidden');
	}
}

listenForScroll();
function to(id) {
	const targetid = id.parentElement.parentElement.id;
	hideTopbar();
	document.location.hash = targetid;
}
// Take hash/id in & return parent page hash/id
function ifUnrecognisedReturnPage(hashRaw) {
	let hash = hashRaw.replace('#', '');
	hash = `#${hash}`;

	function getParentOfHash() {
		if (document.querySelector(hash))
			return document.querySelector(hash).parentElement.id;
		else return `${base.page_prefix}404`;
	}

	function isPageHash() {
		return hash.includes(base.page_prefix);
	}

	while (!isPageHash(hash)) {
		hash = getParentOfHash();
		console.log(hash);
	}

	return hash;
}

// Topbar hiding and navbutton popouts

// Check if hiding topbar is enabled
function isEnabled() {
    return base.hideTopbarWhenScrollEnabled;
}

function hideTopbar() {
    if(!isEnabled()) return;
	if (!topbar.classList.contains('hide-topbar')) {
		topbar.classList.add('hide-topbar');
	}
	showNavbuttons();
}
function showTopbar() {
    if(!isEnabled()) return;
	if (topbar.classList.contains('hide-topbar')) {
		topbar.classList.remove('hide-topbar');
	}
	setTimeout(() => {
		hideNavbuttons();
	}, 300);
}
function showNavbuttons() {
    if(!isEnabled()) return;
	if (!navbuttons.classList.contains('stick-navbuttons-out')) {
		navbuttons.classList.add('stick-navbuttons-out');
	}
}
function hideNavbuttons() {
    if(!isEnabled()) return;
	if (navbuttons.classList.contains('stick-navbuttons-out')) {
		navbuttons.classList.remove('stick-navbuttons-out');
	}
}



function jump(id) {
	document.location.hash = id;
	setTimeout(() => {
		hideTopbar();
	}, 5000);
}

function listenForScroll() {
	// solution to https://stackoverflow.com/questions/31223341/detecting-scroll-direction/31223774
	var lastScrollTop = 0;

	// element should be replaced with the actual target element on which you have applied scroll, use window in case of no target element.
	window.addEventListener(
		'scroll',
		function () {
			// or window.addEventListener("scroll"....
			var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
			if (st > lastScrollTop) {
				// downscroll code
				// setTimeout(() => {
				hideTopbar();
				// }, 1000)
			} else {
				// upscroll code
				showTopbar();
			}
			lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
		},
		false
	);
}

function goThroughAllPages(cb) {
	const pages = document.querySelectorAll('.page');
	pages.forEach(page => {
		cb(page);
	});
}
function redir(pageidRaw) {
	let pageid;
	let jumpto;
	// let isIdPartOfPage = false;
	if (!pageidRaw.includes(base.page_prefix)) {
		pageid = ifUnrecognisedReturnPage(pageidRaw);
		jumpto = pageidRaw;
	} else {
		pageid = pageidRaw;
	}

	const target = document.querySelector('#' + pageid);
	if(!target) {
		redir('page_404')
		return;
	}
	goThroughAllPages(page => {
		page.classList.add('hidden');
	});
	target.classList.remove('hidden');
	if (!jumpto) {
		jump(pageid);
	} else {
		jump(jumpto);
	}

	topbarRedirect.forEach(element => {
		element.classList.remove('active');
		if (element.classList.contains(`to_${pageid}`)) {
			element.classList.add('active');
		}
	});
}

function setTheme(enumKey, override) {
	let ls_theme = localStorage.getItem('theme');
	if (!ls_theme) {
		localStorage.setItem('theme', enumKey.value);
	} else if (override) {
		localStorage.setItem('theme', enumKey.value);
	}

	if (!override && !ls_theme) return false;
	else if (!override && ls_theme) return true;
}

function getTheme() {
	let ls_theme = localStorage.getItem('theme');
	return new Enums(ls_theme);
}

function toLightMode() {
	document.querySelector('.main_stylesheet').href = 'css/light.css';

	document.querySelectorAll('.dark').forEach(element => {
		element.classList.remove('dark');
		element.classList.add('light');
	});
	setTheme(enumKey.lightMode, true);
}
function toDarkMode() {
	document.querySelector('.main_stylesheet').href = 'css/dark.css';

	document.querySelectorAll('.light').forEach(element => {
		element.classList.remove('light');
		element.classList.add('dark');
	});
	setTheme(enumKey.darkMode, true);
}
document.addEventListener('DOMContentLoaded', e => {
	if (getTheme().value === enumKey.lightMode.value) {
		toLightMode();
	}
	if (getTheme().value === enumKey.darkMode.value) {
		toDarkMode();
	}
});

