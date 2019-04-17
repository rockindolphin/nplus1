import Vue from 'vue';
import nplus1Components from './components/icons.js';
//set path for webpack chunks
var src = document.querySelector('[src*="app.js"]').getAttribute("src");
__webpack_public_path__ = src.substr(0, src.lastIndexOf("/") + 1);

document.addEventListener("DOMContentLoaded", function(event) {

	let app = new Vue({
		el: '.page__body',
		data: {	
				
		},
		components: nplus1Components			
	});
	window.app = app;

});
