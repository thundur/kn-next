var headerHeight = 400;
var collapsedHeaderHeight = 70;
var headerFixedThreshold = headerHeight - collapsedHeaderHeight;

function getCsrftoken() {
	if ($.cookie('csrftoken')) {
		return $.cookie('csrftoken');
	} else {
		// http://stackoverflow.com/a/12502559/559350
		// generate 32 pseudo-random characters
		var csrftoken = '';
		for (var i=0; i<4; i++) {
			csrftoken += Math.random().toString(36).slice(2, 10);
		}
		// emulate default Django behavior
		// https://github.com/django/django/blob/master/django/middleware/csrf.py#L182
		$.cookie('csrftoken', csrftoken, {path: '/', expires: 7*52})
		return csrftoken;
	}
}

function isMobile() {
	return ($(window).width() < 800  && 'ontouchstart' in document.documentElement);
}

// Menubar half-fixed
if (! isMobile()) {
	$(window).scroll(function(e) {
		if($.cookie('collapseHeader') === 'y') {
			$('#header').css({
				position: 'fixed',
				top: -headerFixedThreshold
			});
		} else if($(window).scrollTop() > headerFixedThreshold) {
			$('#header').css({
				position: 'fixed',
				top: -headerFixedThreshold
			});
		} else {
			$('#header').css({
				position: 'absolute',
				top: 0
			});
		}
	});
}

$(document).ready(function() {
    // ScrollUp animation
	$("#scrollUp").click(function(event) {
		var sTop = 0;
		if(!isMobile && $.cookie('collapseHeader') != 'y') {
			sTop = headerFixedThreshold;
		}
		$('html, body').animate({scrollTop: sTop}, 300);
		event.preventDefault();
		return false;
	});

	// read menu state collapse state from cookie
	if($.cookie('collapseHeader') === 'y') {
        $('#header').css({
			position: 'fixed',
			top: -headerFixedThreshold
		});
		$('#content').css({
			top: collapsedHeaderHeight
		});
	}

	$('#csrfmiddlewaretoken').val(getCsrftoken());

	$(document.getElementById('loginButtonLink')).bind('click', function (event) {
		var loginButton = $('#loginButton');
		loginButton.toggleClass('open');
		event.preventDefault();
		event.stopPropagation();
	});

	$(document.body).bind('click', function (event) {
		$('#loginButton').removeClass('open');
	});

	$('#loginWindow').bind('click', function (event) {
		event.stopPropagation();
	});
});

function collapseHeader(img) {
	if($.cookie('collapseHeader') === 'y') {
		$.cookie('collapseHeader', 'n');
		img.src = 'img/up.png';

		$('#content').css({
			top: headerHeight
		});

		$('#header').css({
			height: headerHeight
		});

		if($(window).scrollTop() > headerFixedThreshold) {
			$('#header').css({
				position: 'fixed',
				top: -headerFixedThreshold
			});
		} else {
			$('#header').css({
				position: 'absolute',
				top: 0
			});
		}
	} else {
		$.cookie('collapseHeader', 'y');
		img.src = 'img/down.png';
        $('#header').css({
			position: 'fixed',
			top: -headerFixedThreshold
		});
		$('#content').css({
			top: collapsedHeaderHeight
		});
	}
}

// Implement rot13 for email obscurification
function rot13 (s)
{
	return jQuery.map(s.split(''), function(_)
	{
		if (!_.match(/[A-Za-z]/)) return _;
		c = _.charCodeAt(0)>=96;
		k = (_.toLowerCase().charCodeAt(0) - 96 + 12) % 26 + 1;
		return String.fromCharCode(k + (c ? 96 : 64));
	}
	).join('');
}

function unobfuscateEmail() {
	var emails = document.querySelectorAll('.email.obfuscated');
	for (var i=0; i<emails.length; i++) {
		var email = emails[i];
		var email_link = document.createElement('a');
		if (email.textContent) {
			email_link.textContent = rot13(email.textContent);
		} else { /* IE8 */
			email_link.innerText = rot13(email.innerText);
		}
		email_link.href = 'mailto:' + (email_link.textContent || email_link.innerText);
		email_link.setAttribute('class', 'email');
		email.parentNode.insertBefore(email_link, email);
		email.parentNode.removeChild(email);
	}
}
if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', unobfuscateEmail);
} else { /* IE8 */
	window.attachEvent('onload', unobfuscateEmail);
}
