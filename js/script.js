// We need this to prevent conflicts between libraries
var j = jQuery.noConflict();

j(window).load(function() {

	// Setting standard messages, so users could interact with interface
	var error_message = 'If you not sure what to do, please, <a href="https://github.com/orgs/thevenusproject-dev/people" target="_blank">contact</a> anyone from dev team to handle this error or report this error to <a href="https://github.com/thevenusproject-dev/database/issues" target="_blank">issues</a> section!<br /><br />If you have VKontakte account, you can try to message <a href="https://vk.com/scsmash3r" target="_blank">this dude</a> directly to try to solve the issue =)';
	
  // Hide broken images and notice user about this error on site
  function brokenImagesHandle() {
	j("img").error(function(){
		
		j(this).hide();
		
		// Showing a dialog to user, notifying him that we have possible missing image from outter source.
		vex.dialog.alert({
		  message: '<b>[IMAGE NOT FOUND]</b><br /><br /> Source: '+j(this).attr('src')+'<br />Alt: '+j(this).attr('alt')+'<br /><br />'+error_message,
		  className: 'vex-theme-default'
		});
		
	});
  }

  // Generate Markdown
	var markdown_content = j('#content').html();
	var html = marked(markdown_content);
	j('#content').html(html);
  
  // Stick the menu
	j("#main-menu").sticky({ topSpacing: 0 });
	

  // Working with URI to activate various needed stuff. We have 3 zones to append code into: header, sidebar and footer. Existing examples in code below will show you how to use it.
	var url_for_backlink = new miuri(document.URL+'/index.php'); // Needed for backlinks generation
	var uri = new miuri(document.URL);
	var url_full = url_for_backlink.pathinfo().dirname+'/';

  // After all the stuff, fade out the loader
	setTimeout(function(){
		
		// Sorry to write this chunk of code, but since I don't have 90$ per month to pay, it goes like this =(
		var hide_muut = document.getElementById("moot-logo");
		if (typeof(hide_muut) != 'undefined' && hide_muut !== null)
		{
		  hide_muut.getElementsByTagName('a')[0].style.display = 'none';
		}

		j('.doc-loader').fadeOut('slow');
		j('#content').show();
	}, 600);

});
