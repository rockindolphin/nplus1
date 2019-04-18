import 'core-js';
import ResizeSensor from 'resize-sensor';
import Vue from 'vue';
import ScrollMagic from 'scrollmagic';
import nplus1Components from './components/icons.js';

//set path for webpack chunks
var src = document.querySelector('[src*="app.js"]').getAttribute("src");
__webpack_public_path__ = src.substr(0, src.lastIndexOf("/") + 1);

document.addEventListener("DOMContentLoaded", function(event) {

	let app = new Vue({
		el: '.page__body',
		data: {	
			menuOpen: false,
			searchOpen: false,
			pageScrollLocked: false
		},
		methods: {
			lockPageScroll: function(){
				this.pageScrollLocked = true;
				document.querySelector('.page').classList.add('page--noscroll');
			},
			unlockPageScroll: function(){
				this.pageScrollLocked = false;
				document.querySelector('.page').classList.remove('page--noscroll');
			},
			openMenu: function(){
				this.menuOpen = true;
				this.lockPageScroll();
			},
			closeMenu: function(){
				this.menuOpen = false;
				this.unlockPageScroll();
			},
			toggleMenu: function(){
				this.menuOpen ? this.closeMenu() : this.openMenu();
			},
			openSearch: function(){
				this.searchOpen = true;
			},
			closeSearch: function(){
				this.searchOpen = false;
			},
			toggleSearch: function(evt){
				this.searchOpen ? this.closeSearch() : this.openSearch();
				this.focusSearchInput();
			},
			focusSearchInput: function(){
				let inputs = [...document.querySelectorAll('.header__wrapper--search input')];
				inputs.map(input => {
					input.focus();
				});
			}
		},
		components: nplus1Components			
	});
	window.app = app;

	function getScrollbarWidth(){
		//ширина скроллбара
		let scrollMeasure = document.createElement('div');
		scrollMeasure.classList.add('scroll__measure');
		document.body.appendChild(scrollMeasure);
		var scrollbarWidth = scrollMeasure.offsetWidth - scrollMeasure.clientWidth;
		document.querySelector(':root').style.setProperty('--scrollbar-width', scrollbarWidth+'px');
	}
	getScrollbarWidth();

	//фоновые картинки
	function initBackgroundImages(){

		let getCurrentSrc = function(element, cb){
			var getSrc;
			if(!window.HTMLPictureElement){
				if(window.respimage){
					respimage({elements: [element]});
				} else if(window.picturefill){
					picturefill({elements: [element]});
				}
				cb(element, element.src);
				return;
			}

			getSrc = function(){
				element.removeEventListener('load', getSrc);
				element.removeEventListener('error', getSrc);
				cb(element, element.currentSrc);
			};

			element.addEventListener('load', getSrc);
			element.addEventListener('error', getSrc);
			if(element.complete){
				getSrc();
			}
		}	

		let bg_images = [...document.querySelectorAll('img[data-bg=true]')];
		bg_images.map((image)=>{
			let src = image.getAttribute('src');
			let parent = image.parentNode;
			if( parent.nodeName.toUpperCase() === 'PICTURE' ){
				getCurrentSrc(parent.querySelector('img'), (elem, src)=>{
					parent.parentNode.style.backgroundImage = `url(${src})`;
				})
			}else{
				parent.style.backgroundImage = `url(${src})`;
			}
			image.style.display = 'none';
		});
	}
	initBackgroundImages();	

	function initPageBackground(){
		let controller = new ScrollMagic.Controller(),
			background = document.querySelector('.page__bg--background'),
			foreground = document.querySelector('.page__bg--foreground');
		let scene = new ScrollMagic.Scene({
						duration: document.body.offsetHeight - window.innerHeight 
					})
					.on('progress', function(evt){
						foreground.style.opacity = evt.progress;
						document.querySelector(':root').style.setProperty('--page-progress', evt.progress);
					})
					.addTo(controller);	
	}
	initPageBackground();

	function searchButtonWidth(){
		let nav = document.querySelector('.header__nav--top'),
			btn = document.querySelector('.header__wrapper--nav .header__toggle--search .btn');
		
		function setBtnMinWidth(){
			let supportCustomProprties = window.CSS && CSS.supports('padding', 'var(--page-gap)');
			if (supportCustomProprties){
				document.querySelector(':root').style.setProperty('--nav-top-height', `${nav.offsetHeight}px`);
			}else{
				btn.style.width = `${nav.offsetHeight}px`;
			}
		}

		if( btn && nav ){
			setBtnMinWidth();
			new ResizeSensor(nav, setBtnMinWidth);
		}
	}
	searchButtonWidth();


});
