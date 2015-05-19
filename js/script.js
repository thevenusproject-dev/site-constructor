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
			if (uri.query('view') == 'tree') {
				
				// Making our container width 100%, cleaning it from other content, initiating the class we will be working with
				j('#content').css({'width':'100%'}).html('').addClass('faq_container').removeClass('m-top-50');
				
				// ------- [d3.js] to generate treeview -------
				
				// Preparing questions, pulling them all out from faq array
				var q = [];
				
				for(var index in venus_db['content']['faq']) { 
					q[index] = JSON.stringify(venus_db['content']['faq'][index]);
				}

				// Here some magic happens o_O This needs to be handled in order if some questions are not available in other languages, so users could see the message and work with missing questions
				function t(str) {
					if (!str) {
						str = '{"name":"QUESTION_NOT_EXIST","desc":"If you see this message, that means this question is not available in your language! You can help with translation, using GitHub.<br /><br /> Read how to do this <a href=\\"/'+current_locale+'/faq/readme\\">here</a>."}';
					}
					str.trim();
					str = str.slice(0, -1);
					str = str.slice(1);
					return str;
				}

				// This is where we define our view and info for nodes (treeview FAQ)
				var json = '\
					{"name":"TVP_FAQ_TREE_VIEW_TEMPLATE",\
						"children":[{\
						'+t(q['question_1'])+',\
							"children":[{\
								'+t(q['question_2'])+',\
									"children":[{\
										'+t(q['question_4'])+'\
									},\
									{\
										'+t(q['question_4'])+'\
									}\
									]\
								},\
								{\
								'+t(q['question_2'])+',\
									"children":[{\
										'+t(q['question_1'])+'\
										}\
									]\
							}]\
						}]\
					}';
				
				// --- D3 RELATED START --- 
				treeData = JSON.parse(json);
				
					// Calculate total nodes, max label length
					var totalNodes = 0;
					var maxLabelLength = 0;
					// variables for drag/drop
					var selectedNode = null;
					var draggingNode = null;
					// panning variables
					var panSpeed = 400;
					var panBoundary = 20;
					// Misc. variables
					var i = 0;
					var duration = 500;
					var root;

					// size of the diagram
					var viewerWidth = j(document).width();
					var viewerHeight = j(document).height()-200;

					var tree = d3.layout.tree().size([viewerHeight, viewerWidth]);

					// define a d3 diagonal projection for use by the node paths later on.
					var diagonal = d3.svg.diagonal().projection(function(d) {
						return [d.y, d.x];
					});

					// A recursive helper function for performing some setup by walking through all nodes

					function visit(parent, visitFn, childrenFn) {
						if (!parent) {
							return;
						}

						visitFn(parent);

						var children = childrenFn(parent);
						if (children) {
							var count = children.length;
							for (var i = 0; i < count; i++) {
								visit(children[i], visitFn, childrenFn);
							}
						}
					}

					// Call visit function to establish maxLabelLength
					visit(treeData, function(d) {
						totalNodes++;
						maxLabelLength = Math.max(d.name.length, maxLabelLength);

					}, function(d) {
						return d.children && d.children.length > 0 ? d.children : null;
					});


					function pan(domNode, direction) {
						var speed = panSpeed;
						if (panTimer) {
							clearTimeout(panTimer);
							translateCoords = d3.transform(svgGroup.attr("transform"));
							if (direction == 'left' || direction == 'right') {
								translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
								translateY = translateCoords.translate[1];
							} else if (direction == 'up' || direction == 'down') {
								translateX = translateCoords.translate[0];
								translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
							}
							scaleX = translateCoords.scale[0];
							scaleY = translateCoords.scale[1];
							scale = zoomListener.scale();
							svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
							d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
							zoomListener.scale(zoomListener.scale());
							zoomListener.translate([translateX, translateY]);
							panTimer = setTimeout(function() {
								pan(domNode, speed, direction);
							}, 50);
						}
					}

					// Define the zoom function for the zoomable tree
					function zoom() {
						svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					}

					// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
					var zoomListener = d3.behavior.zoom().scaleExtent([0.6, 1]).on("zoom", zoom);


					// define the baseSvg, attaching a class for styling and the zoomListener
					var baseSvg = d3.select("#content").append("svg").attr("width", viewerWidth).attr("height", viewerHeight).attr("class", "overlay").call(zoomListener);

					
					// Helper functions for collapsing and expanding nodes.

					function collapse(d) {
						if (d.children) {
							d._children = d.children;
							d._children.forEach(collapse);
							d.children = null;
						}
					}
					

					function expand(d) {
						if (d._children) {
							d.children = d._children;
							d.children.forEach(expand);
							d._children = null;
						}
					}

					// Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

					function centerNode(source) {
						scale = zoomListener.scale();
						x = -source.y0;
						y = -source.x0;
						x = x * scale + viewerWidth / 2;
						y = y * scale + viewerHeight / 2;
						d3.select('g').transition().duration(duration).attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
						zoomListener.scale(scale);
						zoomListener.translate([x, y]);
					}

					// Toggle children function

					function toggleChildren(d) {
						if (d.children) {
							d._children = d.children;
							d.children = null;
						} else if (d._children) {
							d.children = d._children;
							d._children = null;
						}
						return d;
					}
					
					// Showing dialog window if clicking on node's text (not on the circle)

					function showVexDialog(d) {
						// If we have description (which is a needed parameter) - show the dialog
						if (d.desc) {
							vex.defaultOptions.className = 'vex-theme-wireframe';
							// If we also having an optional 'excerpt' parameter - showing it first
							if (d.excerpt) {
								// VEX docs [http://github.hubspot.com/vex/]
								vex.dialog.open({
									message: d.excerpt,
									buttons: [
										j.extend({}, vex.dialog.buttons.YES, { text: '»' })
									],
									afterOpen: function($vexContent) {
										brokenImagesHandle();
									},
									callback: function(value) {
										setTimeout(function(){
											vex.open({
												content: d.desc,
												afterOpen: function($vexContent) {
													brokenImagesHandle();
													
													if (d.links) {
															j('.vex-theme-wireframe .vex-content').append('<br /><br /><hr><br />');
														d.links.forEach(function(l) {
															j('.vex-theme-wireframe .vex-content').append('<a href="'+l.link+'" title="'+l.desc+'" target="_blank">'+l.desc+'</a><br />');
														});
													}
													
												}
											});
										}, 0);
									}
								});
							} else {
								// VEX docs [http://github.hubspot.com/vex/]
								vex.open({
									content: d.desc,
									afterOpen: function($vexContent) {
										brokenImagesHandle();
										
										if (d.links) {
												j('.vex-theme-wireframe .vex-content').append('<br /><br /><hr><br />');
											d.links.forEach(function(l) {
												j('.vex-theme-wireframe .vex-content').append('<a href="'+l.link+'" title="'+l.desc+'" target="_blank">'+l.desc+'</a><br />');
											});
										}
										
									}
								});
							}
						}
							
						click(d);
					}
					

					// Toggle children on click.
					function click(d) {
						if (d3.event.defaultPrevented) {
							return;
						}

						  if (d.children) {
							d._children = d.children;
							d.children = null;
						  } else {
							d.children = d._children;
							d._children = null;
						  }
						  // If the node has a parent, then collapse its child nodes
						  // except for this clicked node.
						  if (d.parent) {
							d.parent.children.forEach(function(element) {
							  if (d !== element) {
								collapse(element);
							  }
							});
						  }

							centerNode(d);
							update(d);
			
					}

					function update(source) {
					
						// Compute the new height, function counts total children of root node and sets tree height accordingly.
						// This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
						// This makes the layout more consistent.
						var levelWidth = [1];
						var childCount = function(level, n) {

							if (n.children && n.children.length > 0) {
								if (levelWidth.length <= level + 1) {
									levelWidth.push(0);
								}

								levelWidth[level + 1] += n.children.length;
								n.children.forEach(function(d) {
									childCount(level + 1, d);
								});
							}
						};
						childCount(0, root);
						var newHeight = d3.max(levelWidth) * 35; // 35 pixels per line  
						tree = tree.size([newHeight, viewerWidth]);

						
						// Compute the new tree layout.
						var nodes = tree.nodes(root).reverse(),
							links = tree.links(nodes);
							
							var nodeo = tree.nodes(root);
							
						// Set widths between levels based on maxLabelLength.
						nodes.forEach(function(d) {
							d.y = (d.depth * (maxLabelLength * 15)); //maxLabelLength * 10px
						});

						// Update the nodes…
						node = svgGroup.selectAll("g.node").data(nodes, function(d) {
							return d.id || (d.id = ++i);
						});

						// Enter any new nodes at the parent's previous position.
						var nodeEnter = node.enter().append("g").attr("class", function(d) {
							var node_id = "node node"+d.id;
							return node_id;
						}).attr("transform", function(d) {
							return "translate(" + source.y0 + "," + source.x0 + ")";
						});

						
						nodeEnter.append("circle").attr('class', 'nodeCircle').attr("r", 0).on('click', click);
						
						// Shadow
						nodeEnter.append("text").attr("x", function(d) {
								if(d.children || d._children) {
									return -10;
								} else {
									if (d.desc) {
										return 10;
									} else {
										return 0;
									}
								}
							}).attr("dy", ".3em").attr("class", "shadow").attr("text-anchor", function(d) {
								return d.children || d._children ? "end" : "start";
							}).text(function(d) {
								return d.name;
							}).style("fill-opacity", 0).style("stroke-width", 0);
							
						// Text
						nodeEnter.append("text").attr("x", function(d) {
								if(d.children || d._children) {
									return -10;
								} else {
									if (d.desc) {
										return 10;
									} else {
										return 0;
									}
								}
							}).attr("dy", ".3em").attr("fill", 'black').attr("class", "nodeText").attr("text-anchor", function(d) {
								return d.children || d._children ? "end" : "start";
							}).text(function(d) {
								return d.name;
							}).style("fill-opacity", 0).on('click', showVexDialog);


						// Update the text to reflect whether node has children or not.
						node.select('text').attr("x", function(d) {
								if(d.children || d._children) {
									return -10;
								} else {
									if (d.desc) {
										return 10;
									} else {
										return 0;
									}
								}
							}).attr("text-anchor", function(d) {
								return d.children || d._children ? "end" : "start";
							}).text(function(d) {
								return d.name;
							});

						// Change the circle fill depending on whether it has children and is collapsed
						node.select("circle.nodeCircle").attr("r", function(d) {
								if(d._children) {
									return 6;
								} else {
									if (d.desc) {
										return 6;
									} else {
										if (d.children || d._children) {
											return 6;
										} else {
											return 0;
										}
									}
								}
							}).style("fill", function(d) {
								if(d._children) {
									return "#4d90fe";
								} else {
									if (d.desc) {
										return "#f50";
									} else {
										if (d.children || d._children) {
											return "#f50";
										} else {
											return "none";
										}
									}
								}
							});
							
						// Change first node appearance
						svgGroup.selectAll("g.node1 text, g.node1 circle, g.node1 image").remove();
						
						svgGroup.select("g.node1").attr('width','100%').attr('height','100%').attr('viewBox', '0 0 150 150').on('click', click);

						// Appending TVP logo instead first node   
						svgGroup.select("g.node1").append("svg:image").attr('x',-75).attr('y',-90).attr('width', 150).attr('height', 150).attr("xlink:href","data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnDQogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iDQogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIg0KICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIg0KICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCINCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIg0KICAgd2lkdGg9IjE1MCINCiAgIGhlaWdodD0iMTUwIg0KICAgaWQ9InN2ZzMwMzMiDQogICB2ZXJzaW9uPSIxLjEiDQogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjQ4LjIgcjk4MTkiDQogICBzb2RpcG9kaTpkb2NuYW1lPSJ2ZW51cy5zdmciPg0KICA8ZGVmcw0KICAgICBpZD0iZGVmczMwMzUiPg0KICAgIDxjbGlwUGF0aA0KICAgICAgIGNsaXBQYXRoVW5pdHM9InVzZXJTcGFjZU9uVXNlIg0KICAgICAgIGlkPSJjbGlwUGF0aDI4NzQiPg0KICAgICAgPHBhdGgNCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiDQogICAgICAgICBkPSJNIDAsNjAwIDEwMDAsNjAwIDEwMDAsMCAwLDAgMCw2MDAgeiINCiAgICAgICAgIGlkPSJwYXRoMjg3NiIgLz4NCiAgICA8L2NsaXBQYXRoPg0KICAgIDxjbGlwUGF0aA0KICAgICAgIGNsaXBQYXRoVW5pdHM9InVzZXJTcGFjZU9uVXNlIg0KICAgICAgIGlkPSJjbGlwUGF0aDI4OTAiPg0KICAgICAgPHBhdGgNCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiDQogICAgICAgICBkPSJNIDAsNjAwIDEwMDAsNjAwIDEwMDAsMCAwLDAgMCw2MDAgeiINCiAgICAgICAgIGlkPSJwYXRoMjg5MiIgLz4NCiAgICA8L2NsaXBQYXRoPg0KICA8L2RlZnM+DQogIDxzb2RpcG9kaTpuYW1lZHZpZXcNCiAgICAgaWQ9ImJhc2UiDQogICAgIHBhZ2Vjb2xvcj0iIzAwMDAwMCINCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiDQogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCINCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAuMCINCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiINCiAgICAgaW5rc2NhcGU6em9vbT0iNS41Ig0KICAgICBpbmtzY2FwZTpjeD0iODIuNTk4ODkxIg0KICAgICBpbmtzY2FwZTpjeT0iOTguNzk5MzU0Ig0KICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiDQogICAgIHNob3dncmlkPSJ0cnVlIg0KICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0icHgiDQogICAgIGlua3NjYXBlOmdyaWQtYmJveD0idHJ1ZSINCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxOTIwIg0KICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMDIxIg0KICAgICBpbmtzY2FwZTp3aW5kb3cteD0iLTQiDQogICAgIGlua3NjYXBlOndpbmRvdy15PSItNCINCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIgLz4NCiAgPG1ldGFkYXRhDQogICAgIGlkPSJtZXRhZGF0YTMwMzgiPg0KICAgIDxyZGY6UkRGPg0KICAgICAgPGNjOldvcmsNCiAgICAgICAgIHJkZjphYm91dD0iIj4NCiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+DQogICAgICAgIDxkYzp0eXBlDQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+DQogICAgICAgIDxkYzp0aXRsZSAvPg0KICAgICAgPC9jYzpXb3JrPg0KICAgIDwvcmRmOlJERj4NCiAgPC9tZXRhZGF0YT4NCiAgPGcNCiAgICAgaWQ9ImxheWVyMSINCiAgICAgaW5rc2NhcGU6bGFiZWw9IkxheWVyIDEiDQogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiDQogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsODYpIj4NCiAgICA8Zw0KICAgICAgIGlkPSJnMjg2OCINCiAgICAgICBpbmtzY2FwZTpsYWJlbD0idHZwX2xvZ29hbmRpY29uX3ZlcnRpY2FsIg0KICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDY2MzI3MDUsMCwwLC0wLjQ2NjMyNzA1LC0xNTEuOTA1LDE0NC45Mjk2NCkiDQogICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMCI+DQogICAgICA8Zw0KICAgICAgICAgaWQ9ImcyODcwIg0KICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMCI+DQogICAgICAgIDxnDQogICAgICAgICAgIGlkPSJnMjg3MiINCiAgICAgICAgICAgY2xpcC1wYXRoPSJ1cmwoI2NsaXBQYXRoMjg3NCkiDQogICAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDAiPg0KICAgICAgICAgIDxnDQogICAgICAgICAgICAgaWQ9ImcyODc4Ig0KICAgICAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDc1NC4xNjAyLDEwOS40NTcpIg0KICAgICAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDAiIC8+DQogICAgICAgICAgPGcNCiAgICAgICAgICAgICBpZD0iZzI4ODIiDQogICAgICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzczLjI1NjgsNTAuNzIxNykiDQogICAgICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMCIgLz4NCiAgICAgICAgPC9nPg0KICAgICAgPC9nPg0KICAgICAgPGcNCiAgICAgICAgIGlkPSJnMjg4NiINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDAiPg0KICAgICAgICA8Zw0KICAgICAgICAgICBpZD0iZzI4ODgiDQogICAgICAgICAgIGNsaXAtcGF0aD0idXJsKCNjbGlwUGF0aDI4OTApIg0KICAgICAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwIj4NCiAgICAgICAgICA8Zw0KICAgICAgICAgICAgIGlkPSJnMjg5NCINCiAgICAgICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0ODUuODU2OSwzMDkuNTc2MikiDQogICAgICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMCI+DQogICAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgICAgZD0ibSAwLDAgYyAxMy45OTcsMjQuMzg1IDI3LjcyNyw0OS4wNjQgNDEuODExLDczLjM5IGwgMzEuOTcxLDAgQyA3My45MDMsNzIuNjIyIDczLjI1Niw3Mi4wNjIgNzIuOTI4LDcxLjUgNDguNTQyLDI5LjE1MyAyNC41MDgsLTE0LjIxOCAwLjEzMywtNTYuNjc1IC0yNC44NjMsLTEzLjUzNSAtNTAuMDA1LDMwLjIyNyAtNzQuNTEzLDczLjM5IGwgMzIuMTE3LDAgQyAtMzguNDk1LDY3LjUxMyAtMTAuNTcyLDE4LjMzNyAwLDAiDQogICAgICAgICAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIg0KICAgICAgICAgICAgICAgaWQ9InBhdGgyODk2Ig0KICAgICAgICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4NCiAgICAgICAgICA8L2c+DQogICAgICAgICAgPGcNCiAgICAgICAgICAgICBpZD0iZzI4OTgiDQogICAgICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzczLjMxMTUsMzk3LjcyMjcpIg0KICAgICAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDAiPg0KICAgICAgICAgICAgPHBhdGgNCiAgICAgICAgICAgICAgIGQ9Ik0gMCwwIEMgLTMyLjYyMiwtNTguMDMgLTE2LjAxNywtMTMwLjU3OSAzNi4yMjIsLTE2OS4xMTQgTCAyMS40MDYsLTE5NS40NyBjIC0zMC4yODcsMjEuMjIgLTUyLjEzOSw1MS45ODEgLTYyLjI0Nyw4OC4wNzIgLTExLjU3Nyw0MS4zMjUgLTYuMzY4LDg0LjY5MiAxNC42NjYsMTIyLjExMiAyMS4wMzQsMzcuNDE4IDU1LjM3Niw2NC40MSA5Ni42OTgsNzUuOTk5IDM2LjA4NywxMC4xMjIgNzMuNzI2LDcuNDQyIDEwNy41OTUsLTcuNDAyIEwgMTYzLjMwNCw1Ni45NTQgQyAxMDMuMjI5LDgxLjU1MyAzMi42MjEsNTguMDMyIDAsMCINCiAgICAgICAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiDQogICAgICAgICAgICAgICBpZD0icGF0aDI5MDAiDQogICAgICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPg0KICAgICAgICAgIDwvZz4NCiAgICAgICAgICA8Zw0KICAgICAgICAgICAgIGlkPSJnMjkwMiINCiAgICAgICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1OTkuMzIyMywyNzAuNjc0OCkiDQogICAgICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMCI+DQogICAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgICAgZD0ibSAwLDAgYyAzMi42MjEsNTguMDMgMTYuMDE2LDEzMC41NzggLTM2LjIyMywxNjkuMTE0IGwgMTQuODE1LDI2LjM1NiBDIDguODgxLDE3NC4yNSAzMC43MzIsMTQzLjQ4OSA0MC44NDIsMTA3LjM5OCA1Mi40MTgsNjYuMDcyIDQ3LjIwOSwyMi43MDYgMjYuMTc0LC0xNC43MTQgNS4xNDEsLTUyLjEzMSAtMjkuMjAxLC03OS4xMjIgLTcwLjUyNSwtOTAuNzEyIGMgLTM2LjA4NywtMTAuMTIzIC03My43MjUsLTcuNDQzIC0xMDcuNTk0LDcuNDAxIGwgMTQuODE1LDI2LjM1NyBDIC0xMDMuMjI5LC04MS41NTMgLTMyLjYyMSwtNTguMDMgMCwwIg0KICAgICAgICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSINCiAgICAgICAgICAgICAgIGlkPSJwYXRoMjkwNCINCiAgICAgICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+DQogICAgICAgICAgPC9nPg0KICAgICAgICA8L2c+DQogICAgICA8L2c+DQogICAgPC9nPg0KICA8L2c+DQo8L3N2Zz4NCg==");
					
						// Transition nodes to their new position.
						var nodeUpdate = node.transition()
							.duration(duration)
							.attr("transform", function(d) {
								return "translate(" + d.y + "," + d.x + ")";
							});

						// Fade the text and shadow in
						nodeUpdate.select(".nodeText")
							.style("fill-opacity", 1);
							
						nodeUpdate.select(".shadow")
							.style("stroke", "#FFF")
							.style("stroke-width", 3)
							.style("fill-opacity", 1);
							
						// Transition exiting nodes to the parent's new position.
						var nodeExit = node.exit().transition()
							.duration(duration)
							.attr("transform", function(d) {
								return "translate(" + source.y + "," + source.x + ")";
							})
							.remove();

						nodeExit.select("circle")
							.attr("r", 0);

						nodeExit.select(".nodeText")
							.style("fill-opacity", 0);
						
						nodeExit.select(".shadow")
							.style("stroke-width", 0)
							.style("fill-opacity", 0);

						// Update the links…
						var link = svgGroup.selectAll("path.link")
							.data(links, function(d) {
								return d.target.id;
							});

						// Enter any new links at the parent's previous position.
						link.enter().insert("path", "g")
							.attr("class", "link")
							.attr("d", function(d) {
								var o = {
									x: source.x0,
									y: source.y0
								};
								return diagonal({
									source: o,
									target: o
								});
							});

						// Transition links to their new position.
						link.transition()
							.duration(duration)
							.attr("d", diagonal);

						// Transition exiting nodes to the parent's new position.
						link.exit().transition()
							.duration(duration)
							.attr("d", function(d) {
								var o = {
									x: source.x,
									y: source.y
								};
								return diagonal({
									source: o,
									target: o
								});
							})
							.remove();

						// Stash the old positions for transition.
						nodes.forEach(function(d) {
							d.x0 = d.x;
							d.y0 = d.y;

						});
						
					}

					// Append a group which holds all nodes and which the zoom Listener can act upon.
					var svgGroup = baseSvg.append("g");

					// Define the root
					root = treeData;
					root.x0 = viewerHeight / 2;
					root.y0 = 0;

					// Layout the tree initially and center on the root node.
					tree.nodes(root).forEach(function(n) {collapse(n);});
					update(root);
					centerNode(root);
				
				// --- D3 RELATED END --- 
			}
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
