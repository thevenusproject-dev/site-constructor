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

  // Check if we have real page, not 404 - then check that page for particular part and append some code to existing divs or work with existing elements (reveal/hide)
	if (typeof git_origin !== 'undefined') {
		
		// ------------------------------------------------ VIDEO ------------------------------------------------
		// Example of how to show videocontainer if we are in 'video' section (which refers to 'video' dir on GitHub), so we count it as a different TPL basically (with slightly different functionality) :)
		if (url_full.indexOf("/video/") >=0 && url_full.indexOf("/video/readme") <=0) {
			j('<div class="video_section"></div>').appendTo('#header_logo_hooks');
			j('#video_top_container').show();
		}
		
		// ------------------------------------------------ FAQ ------------------------------------------------
		// Working with FAQ section
		if (uri.pathinfo().basename == 'faq') {
			
			// Changing links on buttons, according to current language locale
			j('#q_v1').attr('href',url_for_backlink.pathinfo().dirname+'?view=simple');
			j('#q_v2').attr('href',url_for_backlink.pathinfo().dirname+'?view=tree');
			
			// Handling view
			// ------------------------------------------------ FAQ - [TREE VIEW] ------------------------------------------------
		
		}
		
		// ------------------------------------------------ ACTIVISM ------------------------------------------------
		// Here goes all the necessary code for 'activism' part of site
		if (uri.pathinfo().basename == 'activism') {
			
			// Initial params
			var current_view = uri.query('view'); // Here we are working with URI query to get current view to interact with the 'thing' in activism (i.e. with translations)

		    // Building activities menu - there must be a container with activism_tasks id on the page
			if (typeof venus_db['content']['activism'] !== 'undefined') {
				if (venus_db['content']['activism']['structure'] !== 'undefined') {
					var activism_structure = venus_db['content']['activism']['structure'];
					activism_structure.forEach(function(e) {
						// Generating activism tasks links inside activism_tasks container (also counting elements in array to show how much things we have in array)
						// We won't show elements that are with structure, but without any related file to that structure
						var file = e['file'];
						if (typeof venus_db['content']['activism'][file] !== 'undefined') {
							var length = venus_db['content']['activism'][file].length;
							j('<a href="'+url_for_backlink.pathinfo().dirname+'?view='+file+'" class="btn-big-center">'+e['name']+' ('+length+')</a><br>').appendTo('#activism_tasks');
							// If we have active view, then setting a header and a container for our tasks view
							if (current_view == file) {
								length = venus_db['content']['activism'][current_view].length;
								j('#content').html('<h1>'+e['name']+' ('+length+')</h1><table id="'+current_view+'-list"><thead><th>name</th><th>about</th><th>rel_link</th><th>keywords</th></thead><tbody></tbody></table>');
							}
						}
					});
				}
				
				// Showing a page, depending on 'view' query
				if (typeof venus_db['content']['activism'][current_view] !== 'undefined' && current_view) {
					// Showing the table of all the materials, using some magic, if we have atleast one element in array
					if (typeof venus_db['content']['activism'][current_view][0]['name'] !== 'undefined') {
						
						// Setting current view data
						var records = venus_db['content']['activism'][current_view];
						
						// Working with table data representation / setting some functions for this
						function tdWriter(rowIndex, record, columns, cellWriter) {
						  var cssClass = "row", td;
						  var icon = '<i class="fa fa-question fa-lg fa-dyna-rowsize"></i> '; // Standard icon for unknown source
						  if (rowIndex % 2 === 0) { cssClass += ' odd'; }
						  
						  // Icons for various link sources - you can add more sources here lately. It could be done in a separate file, but oh well... It's a minor stuff, just for better design purpose
						  if (record.link.indexOf("docs.google.com/spreadsheets") >=0) { icon = '<img src="https://ssl.gstatic.com/docs/spreadsheets/favicon_jfk2.png" alt="Google Sheets" title="Google Sheets">'; }
						  if (record.link.indexOf("docs.google.com/document") >=0) { icon = '<img src="https://ssl.gstatic.com/docs/documents/images/kix-favicon6.ico" alt="Google Docs" title="Google Docs">'; }
						  if (record.link.indexOf("notabenoid.org") >=0) { icon = '<img src="http://notabenoid.org/i/favicon.ico" alt="Notabenoid" title="Notabenoid">'; }
						  if (record.link.indexOf("dotsub.com") >=0) { icon = '<img src="https://dotsub.com/styles/dotsub2/images/favicon.ico" alt="Dotsub" title="Dotsub">'; }
						  if (record.link.indexOf("translatedby.com") >=0) { icon = '<img src="http://translatedby.com/appmedia/images/favicon.ico" alt="Translatedby" title="Translatedby">'; }
						  
						  // Relative link icon
						  var rel_link = '';
						  if (record.rel_link) { rel_link = '<a href="'+record.rel_link+'" target="_blank"><i class="fa fa-external-link fa-lg"></i></a>'; }
						  
						  // Translations table view
						  td = '<tr class="' + cssClass + '"><td class="cell">'+icon+'<a href="'+record.link+'" target="_blank">' + record.name + ' / '+record.name_original+'</a></td><td>' + record.about + '</td><td>' + rel_link + '</td><td>' + record.keywords + '</td></tr>';
						  return td;
						}
						
						// Setting up our data with the Dynatable help
						// More info for coders here: http://www.dynatable.com/
						j('#'+current_view+'-list').bind('dynatable:init', function(e, dynatable) {
							j(".dynatable-search").prepend('<i class="fa fa-search fa-lg"></i>');
						  }).dynatable({
						  dataset: {
							records: records,
							perPageDefault: 50,
						  },
						  inputs: {
							paginationPrev: '«',
							paginationNext: '»',
							perPageText: '<i class="fa fa-eye fa-lg"></i> ',
							recordCountText: 'Showing ',
							processingText: 'Loading...'
						  },
						  features: {
							recordCount: false,
						  },
						  writers: {
							_rowWriter: tdWriter
						  }
						});
	
					} else {
						// If no data is found in the file
						j('#content').html('<h1>Structure file has no elements in array for "'+current_view+'" view!</h1>');
					}
				} else {
					// If we don't have needed view type in structure file, we will throw a message =)
					if (current_view) {
						j('#content').html('<h1>Structure file has no data for "'+current_view+'" view!</h1>');
					}
				}
			} else {
				// In case if we have our activism array empty
				vex.dialog.alert({
				  message: '<b>[JSON FILES NOT FOUND]</b><br /><br /> It seems that any of .json files were found in \''+current_locale+'/'+uri.pathinfo().basename+'\' folder. You need to define atleast <b>structure.json</b> file. It can also show that noone has contributed any actions to this section yet.<br /><br />'+error_message,
				  className: 'vex-theme-default'
				});
			}
		}
		
	}
	
	
  // Building menu from current locale (our active .js file)
	var menu_links = venus_db['content']['menu_items'];
	var length = menu_links.length;
	var active_link = '';
	var class_type = '';
	i = 0;
	menu_links.forEach(function(e) {
		i++;
		// Checking for first and last link to remove padding
		if (i == 1) {
			class_type = ' first';
		} else if (i == length) {
			class_type = ' last';
		} else {
			class_type = '';
		}
		// Checking for active link, referring to URL
		if (url_full.indexOf("/"+e['link']+"/") >=0 || uri.toString().indexOf("/"+e['link']) >=0) {
			active_link = ' active';
		} else {
			active_link = '';
		}
		j('<li class="link'+class_type+active_link+'"><a href="/'+current_locale+'/'+e['link']+'">'+e['name']+'</a></li>').appendTo('#topmenu, ul.navigation');

	});
	
  // Burger menu for lowresolutions
	j("#nav-trigger").click(function() {
		j('ul.navigation').toggle();
		j('.logo').toggleClass('right');
	});

  // -------------- Language menu panel -------------- 
	var avail_langs = available_branches.split(',');
		j('<div id="available_languages"></div>').appendTo('#header_logo_hooks');
		
		avail_langs.forEach(function(e) {
		var language_link = uri.path().replace('/'+current_locale+'/','');

			// Checking for active link, referring to URL
			var lang_lower = e.toLowerCase();
			if (url_full.indexOf("/"+lang_lower+"/") >=0) {
				active_link = ' active';
			} else {
				active_link = '';
			}

			if (language_link != '/'+current_locale) {
				// Removing trailing slash
				language_link = language_link.replace(/\/$/, "");
				
				// -------------- Working with QUERY param in the link -------------- 
				var view_query = '';
				if (uri.query('view')) {
					var view_query = '?view='+uri.query('view');
				}
				j('<a href="/'+lang_lower+'/'+language_link+view_query+'" class="avail_'+lang_lower+active_link+'">'+e+'</a>').appendTo('#available_languages');
			} else {
				j('<a href="/'+lang_lower+'" class="avail_'+lang_lower+active_link+'">'+e+'</a>').appendTo('#available_languages');
			}
		});

  // Shortlinks menu panel
	j('<div id="shortlinks"></div>').appendTo('#header_logo_hooks');
	if (typeof(git_origin) !== 'undefined') {
		j('<a href="'+git_origin+'" class="github_icon" target="_blank"></a>').appendTo('#shortlinks');
	}

	if (url_full.indexOf("/about") < 0) {
		if (url_full.indexOf("/readme") >=0) {
			var back_link = url_for_backlink.pathinfo().dirname.replace('/readme','');
			j('<a href="'+back_link+'" class="about_icon grey">X</a>').appendTo('#shortlinks');
		} else {
			j('<a href="'+uri.pathinfo().basename+'/readme" class="about_icon">?</a>').appendTo('#shortlinks');
		}
	}
	
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
