$(function() {

  // Generate Markdown
	var markdown_content = $('#content').html();
	var html = marked(markdown_content);
	$('#content').html(html);
  
  // Stick the menu
	$("#main-menu").sticky({ topSpacing: 0 });

  // Working with URI to activate various needed stuff. We have 3 zones to append code into: header, sidebar and footer. Existing examples in code below will show you how to use it.
	var fullurl = document.URL+'/index.php';
	var url = new miuri(fullurl);
	var trailing_slash_url = url.pathinfo().dirname+'/';
	
  // Check if we have real page, not 404 - then check that page for particular part and append some code to existing divs or work with existing elements (reveal/hide)
	if (typeof git_origin !== 'undefined') {
		// Example of how to show videocontainer if we are in 'video' section (which refers to 'video' dir on GitHub), so we count it as a different TPL basically (with slightly different functionality) :)
		if (trailing_slash_url.indexOf("/video/") >=0) {
			$('<div class="video_section"></div>').appendTo('#header_logo_hooks');
			$('#video_top_container').show();
		}
	}
	
  // Building menu from current locale
	var menu_links = venus_db['content'][current_locale]['menu_items'];
	var length = menu_links.length;
	var i = 0;
	menu_links.forEach(function(e) {
		i++;
		// Checking for first and last link to remove padding
		if (i == 1) { var class_type = ' first'; } else if (i == length) { var class_type = ' last'} else { var class_type = ''; }
		
		// Checking for active link, referring to URL
		if (trailing_slash_url.indexOf("/"+e['link']+"/") >=0) {
			var active_link = ' active';
		} else {
			var active_link = '';
		}
		$('<li class="link'+class_type+active_link+'"><a href="/'+current_locale+'/'+e['link']+'">'+e['name']+'</a></li>').appendTo('#topmenu, ul.navigation');

	});
	
  // Burger menu for lowresolutions
	$("#nav-trigger").click(function() {
		$('ul.navigation').toggle();
		$('.logo').toggleClass('right');
	});
	
  // Language menu panel
	var avail_langs = available_branches.split(',');
		$('<div id="available_languages"></div>').appendTo('#header_logo_hooks');
		
		avail_langs.forEach(function(e) {
		var language_link = trailing_slash_url.replace('/'+current_locale+'/','');
		var language_link = language_link.replace('/'+e+'/','');

			// Checking for active link, referring to URL
			var lang_lower = e.toLowerCase();
			if (trailing_slash_url.indexOf("/"+lang_lower+"/") >=0) {
				var active_link = ' active';
			} else {
				var active_link = '';
			}

			if (language_link != '') {
				// Removing trailing slash
				var language_link = language_link.replace(/\/$/, "");
				$('<a href="/'+lang_lower+'/'+language_link+'" class="avail_'+lang_lower+active_link+'">'+e+'</a>').appendTo('#available_languages');
			} else {
				$('<a href="/'+lang_lower+'" class="avail_'+lang_lower+active_link+'">'+e+'</a>').appendTo('#available_languages');
			}
		});

  // Shortlinks menu panel
	$('<div id="shortlinks"></div>').appendTo('#header_logo_hooks');
	if (typeof(git_origin) !== 'undefined') {
		$('<a href="'+git_origin+'" class="github_icon" target="_blank"></a>').appendTo('#shortlinks');
	}
	
	if (trailing_slash_url.indexOf("/about") >=0) {
	
	} else {
		if (trailing_slash_url.indexOf("/readme") >=0) {
			var back_link = url.pathinfo().dirname.replace('/readme','');
			$('<a href="'+back_link+'" class="about_icon grey">X</a>').appendTo('#shortlinks');
		} else {
			$('<a href="'+trailing_slash_url+'readme" class="about_icon">?</a>').appendTo('#shortlinks');
		}
	}
	
  // After all the stuff, fade out the loader
	$('.doc-loader').fadeOut('slow');


});