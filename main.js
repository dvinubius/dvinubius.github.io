const frame = document.getElementById('single-sketch');
const star = document.querySelector('.star-img-p5');
const d3Logo = document.querySelector('.star-img-d3');
let docStyle;
let sideBarSmall;
let sideBarTotal;

// sidebar minimized?
let isSidebarSmallP5;
let isSidebarSmallD3;

window.onload = function() {
	const docEl = document.documentElement;
	docStyle = docEl.style;
	sideBarSmall = +window.getComputedStyle(docEl).getPropertyValue('--sidebar-small');
	sideBarTotal = +window.getComputedStyle(docEl).getPropertyValue('--sidebar-total');

	isSidebarSmallP5 = false;
	isSidebarSmallD3 = false;
	toggleSidebarP5();
	toggleSidebarD3();
}

function toggleSidebarP5() {
	isSidebarSmallP5 = !isSidebarSmallP5;

	const minimizedVal = -1 * sideBarTotal + sideBarSmall;
	const translateVal = isSidebarSmallP5 ? minimizedVal : 0;

	docStyle.setProperty('--translate-sidebar-p5', translateVal);
	docStyle.setProperty('--z-index-p5', 10);
	docStyle.setProperty('--z-index-d3', 0);

	if (isSidebarSmallP5) {
		star.classList.remove('rotated');
	} else {
		star.classList.add('rotated');
	}
}

function toggleSidebarD3() {
	isSidebarSmallD3 = !isSidebarSmallD3;

	const minimizedVal = -1 * sideBarTotal + sideBarSmall;
	const translateVal = isSidebarSmallD3 ? minimizedVal : 0;

	docStyle.setProperty('--translate-sidebar-d3', translateVal);
	docStyle.setProperty('--z-index-d3', 10);
	docStyle.setProperty('--z-index-p5', 0);

	if (isSidebarSmallD3) {
		d3Logo.classList.remove('rotated');
	} else {
		d3Logo.classList.add('rotated');
	}
}


function navigateTo(id) {
	switch (id) {
		case '0-intro':
			frame.src = "./0-intro/index.html";
			break;
		case '1-cube-webGL':
		  frame.src = "./1-cube-webGL/index.html";
			break;
		case '2-fade-paint':
		  frame.src = "./2-fade-paint/index.html";
			break;
		case '3-noise-symmetry':
		  frame.src = "./3-noise-symmetry/index.html";
			break;
		case '4-map-color':
		  frame.src = "./4-map-color/index.html";
			break;
		case '5-tiles-1':
		  frame.src ="./5-tiles-1/index.html";
			break;
		case '6-tiles-2':
		  frame.src = "./6-tiles-2/index.html";
			break;
		case '7-tiles-3':
		  frame.src = "./7-tiles-3/index.html";
			break;
		case '8-tiles-4':
		  frame.src = "./8-tiles-4/index.html";
			break;
		case '9-times-table-circle':
			frame.src = "./9-times-table-circle/index.html";
			break;
		case '10-the-force-1':
			frame.src = "./10-the-force-1/index.html";
			break;
		case '11-particles-up':
			frame.src = "./11-particles-up/index.html";
			break;
		case '12-tiles-5':
			frame.src = "./12-tiles-5/index.html";
			break;
		case '13-tiles-6':
			frame.src = "./13-tiles-6/index.html";
			break;
		case '14-tiles-7':
			frame.src = "./14-tiles-7/index.html";
			break;
		case '15-tiles-8':
			frame.src = "./15-tiles-8/index.html";
			break;
		case '16-tiles-9':
			frame.src = "./16-tiles-9/index.html";
			break;
		case '17-tiles-10':
			frame.src = "./17-tiles-10/index.html";
			break;
		case '18-tiles-11':
			frame.src = "./18-tiles-11/index.html";
			break;
		case '19-tiles-12':
			frame.src = "./19-tiles-12/index.html";
			break;
		case '20-tile-interact-1':
			frame.src = "./20-tile-interact-1/index.html";
			break;
		case '21-rotations':
			frame.src = "./21-rotations/index.html";
			break;
		case '22-rotations':
			frame.src = "./22-rotations/index.html";
			break;
		case '23-rotations':
			frame.src = "./23-rotations/index.html";
			break;
		case '24-rotations':
			frame.src = "./24-rotations/index.html";
			break;
		case '25-roses':
			frame.src = "./25-roses/index.html";
			break;
		case '26-acrossing':
			frame.src = "./26-acrossing/index.html";
			break;
		case '27-acrossing-2':
			frame.src = "./27-acrossing-2/index.html";
			break;


		case 'd3-0-gdp-life-exp':
			frame.src = "./d3-0-gdp-life-exp/index.html";
			break;
		case 'd3-1-color-scheme-demo':
			frame.src = "./d3-1-color-scheme-demo/index.html";
			break;
		case 'd3-2-crypto-chart':
			frame.src = "./d3-2-crypto-chart/index.html";
			break;
		case 'd3-3-bivariate-area-chart':
			frame.src = "./d3-3-bivariate-area-chart/index.html";
			break;
		case 'd3-4-difference-chart':
			frame.src = "./d3-4-difference-chart/index.html";
			break;
	}

	if (!isSidebarSmallP5) {
		toggleSidebarP5();
	}
	if (!isSidebarSmallD3) {
		toggleSidebarD3();
	}

}