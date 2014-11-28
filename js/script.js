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
			$('<div class="video_section"></div>').appendTo('#header_block_hooks');
			$('#video_top_container').show();
		}
	}
	
  // Building menu from current locale
	if (typeof current_locale === 'undefined') {
		var current_locale = client_locale;
	}
	var menu_links = venus_db['content'][current_locale]['menu_items'];
	var length = menu_links.length;
	var i = 0;
	menu_links.forEach(function(e) {
		i++;
		if (i == 1) { var class_type = ' first'; } else if (i == length) { var class_type = ' last'} else { var class_type = ''; }
		$('<li class="link'+class_type+'"><a href="/'+current_locale+'/'+e['link']+'">'+e['name']+'</a></li>').appendTo('#topmenu, ul.navigation');

	});
	
  // Burger menu for lowresolutions
	$("#nav-trigger").click(function() {
		$('ul.navigation').toggle();
		$('.logo').toggleClass('right');
	});
	
  // After all the stuff, fade out the loader
	$('.doc-loader').fadeOut('fast');
	
});
