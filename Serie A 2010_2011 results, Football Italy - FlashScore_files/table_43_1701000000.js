function tooltip(div_input_id, ident, disable)
{
	this.max_width = 400;
	this.is_init = false;
	this.div = null;
	this.div_content = null;
	this.span_parent = null;
	this.td_parent = null;
	this.tr_parent = null;
	this.span_parent_title = '';
	this.td_parent_title = '';
	this.tr_parent_title = '';
	this.isDisabled = disable || false;

	this.div_id = (typeof div_input_id == 'undefined') ? null:div_input_id;
	this.ident = (typeof ident == 'undefined') ? 1 : ident;
	this.container_id = 'tooltip-' + this.ident;
	this.defaultZIndex = '999';
	this.currentZIndex = this.defaultZIndex;
	this.hideCallback = function(){};

	this.init = function()
	{
		if (this.is_init || this.isDisabled)
		{
			return;
		}

		// create new or use existing tooltip element
		if (this.createTooltipElement())
		{
			this.is_init = true;
		}
	};

	this.show = function(elm, elm_event, opposite_direction, border_elm)
	{
		if (!this.is_init || this.isDisabled)
		{
			return;
		}

		var title = elm.title;
		if (!title)
		{
			title = elm.getAttribute("title"); // workaround svg title
		}
		if (!title)
		{
			return;
		}
		var title_length  = title.length;

		// formating
		title = title.replace(/\[bl\]([^]+)/gi, function(match, p1, offset, str) {
			var bookmakerId = $(elm).closest('[data-bookmaker-id]').data('bookmaker-id');
			if (bookmakerId)
			{
				p1 = p1.replace(/\[br\]/, '\n');
				var rowData = p1.split('\n');
				var odds = rowData[0];

				var secondLineText = '';
				if (rowData[1])
				{
	                secondLineText = '<span class="tooltip-second-row">' + rowData[1] + '</span>';
				}

				const showText = parseInt(cjs.dic.get('Helper_Bookmaker').showBookmakerLogoMatchSummary(cjs.geoIP), 10) === 1;
				const bookmakerLogo = cjs.dic.get('Helper_Bookmaker').getLogo(bookmakerId);
				var bookmaker = '<span class="tooltip-logo"><a><span class="tooltip-first-row"><span style="background: transparent url(' + bookmakerLogo['url'] + ') 0 -' + bookmakerLogo['offset'] + 'px no-repeat" class="detail-blogos"></span><span class="tooltip-first-row__text">' + odds + '</span></span>' + secondLineText + '</a></span>';
				if (showText)
				{
					const bookmakerName = cjs.dic.get('Helper_Bookmaker').getNameById(cjs.geoIP, bookmakerId);
					bookmaker = '<span class="tooltip-logo"><a><span class="tooltip-first-row"><span class="tooltip-first-row__text">' + bookmakerName + ' ' + odds + '</span></span>' + secondLineText + '</a></span>';
				}

				return bookmaker;
			}

			return '';
		});
		title = title.replace(/\[b\]/i, '<strong>');
		title = title.replace(/\[\/b\]/i, '</strong>');
		title = title.replace(/\[br\]/ig, '<br />');
		title = title.replace(/\[u\]/i, ' &raquo; ');
		title = title.replace(/\[d\]/i, ' &raquo; ');
        title = title.replace(/\n/g, "<br \/>");
        title = title.replace(/\\'/g, '\'');

		if (title_length > 0)
		{
			var x = parseInt(elm_event.clientX);

			this.div_content.innerHTML = title;
			elm.title = '';

			this.span_parent = elm.parentNode;
			this.span_parent_title = this.span_parent.title;
			this.span_parent.title = '';

			this.td_parent = this.span_parent.parentNode;
			this.td_parent_title = this.td_parent.title;
			this.td_parent.title = '';

			this.tr_parent = this.td_parent.parentNode;
			this.tr_parent_title = this.tr_parent.title;
			this.tr_parent.title = '';

			this.div.style.display = 'block';
			if (this.div.style.width = 'auto')
			{
				this.div.style.width = this.div.offsetWidth + 'px';
			}

			var div_width = this.div.offsetWidth;
			if (div_width > this.max_width)
			{
				div_width = this.max_width;
				this.div.style.width = this.max_width + 'px';
				this.div_content.style.whiteSpace = 'normal';
			}

			if (typeof opposite_direction != 'undefined' && opposite_direction == null && typeof border_elm != 'undefined')
			{
				var fence = $("div#"+border_elm);

				opposite_direction = true;
				if (x+div_width > fence.width())
				{
					opposite_direction = false;
				}
			} else {
                opposite_direction = (($(window).width()/2 - x) > 0);
			}

			if (opposite_direction == true)
			{
				$(this.div).addClass("revert");
			}

			// IE6 fixes
			document.getElementById(this.container_id + '-lt').style.height = this.div.offsetHeight + 'px';
			document.getElementById(this.container_id + '-rt').style.height = this.div.offsetHeight + 'px';
			document.getElementById(this.container_id + '-cb').style.width = this.div.offsetWidth + 'px';

			this.div.style.zIndex = this.getZIndex();

			// indent
			var tooltip_indent_r = (project_type_name === '_fs' || project_type_name === '_ss' ? 11 : 10); // right
			var tooltip_indent_l = (project_type_name === '_fs' || project_type_name === '_ss' ? 11 : 10); // left
			var tooltip_indent_t = 10; // top

			var $elm = $(elm);
			var elm_coords = $elm.offset();
			var elm_width = $elm.width();
			var elm_height = $elm.height();
			var pos_top = (elm_coords.top + tooltip_indent_t + elm_height);
			var elm_midpoint = (elm_coords.left ? Math.floor(elm_width / 2) : Math.ceil(elm_width / 2));
			var pos_left1 = (elm_coords.left + elm_midpoint - tooltip_indent_r);
			var pos_left2 = (elm_coords.left - div_width + Math.ceil(elm_width / 2) + tooltip_indent_l);
			var pos_left = opposite_direction ? pos_left1 : pos_left2;

			this.div.title = '';
			this.div.style.top = pos_top + 'px';
			this.div.style.left = pos_left + 'px';
		}
	};

	this.hide = function(elm)
	{
		if (!this.is_init || this.isDisabled)
		{
			return;
		}

		if (typeof this.hideCallback === "function")
		{
			this.hideCallback();
		}

		var title = this.div_content.innerHTML.replace(/<br( \/){0,1}>/gi, "\n");
		title = title.replace(/\<strong\>/i, '[b]');
		title = title.replace(/\<\/strong\>/i, '[/b]');

		if (title.length > 0)
		{
			if (typeof elm !== 'undefined' && elm.title === '')
			{
				elm.title = title;
			}

			this.div.style.display = 'none';
			this.div.style.width = 'auto';
			this.div_content.innerHTML = '';
			$(this.div).removeClass("revert");

			if (this.span_parent !== null && this.span_parent.title == '')
			{
				this.span_parent.title = this.span_parent_title;
			}
			if (this.td_parent !== null && this.td_parent.title == '')
			{
				this.td_parent.title = this.td_parent_title;
			}
			if (this.tr_parent !== null && this.tr_parent.title == '')
			{
				this.tr_parent.title = this.tr_parent_title;
			}
		}
	};

	this.hide_all = function()
	{
		if (!this.is_init || this.isDisabled)
		{
			return;
		}

		this.div.style.display = 'none';
		this.div.style.width = 'auto';
		$(this.div).removeClass("revert");
	};

	this.set_max_width = function(width)
	{
		this.max_width = width - 0;
	};

	/**
	 * Returns element as tooltip wrapper.
	 * @return {Object}
	 */
	this.getTooltipWrapper = function()
	{
		return this.div_id ? document.getElementById(this.div_id) : document.getElementsByTagName('body')[0];
	};

	/**
	 * Creates tooltip element. If wrapper element could not be created
	 * returns false otherwise true.
	 * @return {Boolean}
	 */
	this.createTooltipElement = function()
	{
		this.div = document.getElementById(this.container_id);

		// use existing tooltip element in DOM
		if (this.div !== null)
		{
			this.div_content = this.div.getElementsByTagName('span')[0];
			return true;
		}

		// tooltip wrapper
		var wrapper = this.getTooltipWrapper();
		if (!wrapper)
		{
			return false;
		}

		// create new tooltip element
		this.div = document.createElement('div');
		$(this.div).attr({
			'id': this.container_id,
			'class': 'tooltip'
		});

		this.div_content = document.createElement('span');
		this.div.appendChild(this.div_content);

		var div_lt = document.createElement('div');
		$(div_lt).attr({
			'id': this.container_id + '-lt',
			'class': 'tooltip-lt'
		});
		this.div.appendChild(div_lt);

		var div_rt = document.createElement('div');
		$(div_rt).attr({
			'id': this.container_id + '-rt',
			'class': 'tooltip-rt'
		});
		this.div.appendChild(div_rt);

		var div_lb = document.createElement('div');
		$(div_lb).attr({
			'id': this.container_id + '-lb',
			'class': 'tooltip-lb'
		});
		this.div.appendChild(div_lb);

		var div_cb = document.createElement('div');
		$(div_cb).attr({
			'id': this.container_id + '-cb',
			'class': 'tooltip-cb'
		});
		this.div.appendChild(div_cb);

		var div_rb = document.createElement('div');
		$(div_rb).attr({
			'id': this.container_id + '-rb',
			'class': 'tooltip-rb'
		});
		this.div.appendChild(div_rb);

		var div_rb = document.createElement('div');
		$(div_rb).attr({
			'id': this.container_id + '-ct',
			'class': 'tooltip-ct'
		});
		this.div.appendChild(div_rb);

		wrapper.appendChild(this.div);
		return true;
	};

	this.setZIndex = function(value)
	{
		this.currentZIndex = value;
	};

	this.getZIndex = function()
	{
		return this.currentZIndex;

	};

	this.getDefaultZIndex = function()
	{
		return this.defaultZIndex;
	};

	this.revertZIndex = function()
	{
		this.setZIndex(this.getDefaultZIndex());
	};

	this.setHideCallback = function(cb)
	{
		this.hideCallback = cb;
	};

	this.init();
};
if (typeof $jq == 'undefined')
{
	var $jq = jQuery;
	if (!$jq)
	{
		$jq = jQuer;
	}
}
function glib_show_hidden(surface_table_class, table_id, show_next_limit)
{
	if (surface_table_class)
	{
		surface_table_class = '#' + surface_table_class + ' ';
	}

	var tbody = $jq(surface_table_class + '.' + table_id + ' tbody');

	var visibleRows = tbody.data('visibleRows');
	var rows = tbody.find('tr.hidden:not(.filtered-out)');

	if (show_next_limit)
	{
		rows = rows.slice(0, show_next_limit);
	}

	rows.removeClass('hidden');

	if (visibleRows)
	{
		tbody.data('visibleRows', visibleRows + rows.length);
	}

	fix_row_parity(tbody);

	toggle_show_more(tbody);
};

function toggle_show_more(tbody)
{
	var numHidden = tbody.find('tr').not(':visible,.filtered-out').length;

	tbody.parent().find('tr.hid').toggleClass('hidden', numHidden === 0);
}

function fix_row_parity(tbody)
{

	$jq(tbody).find('tr:visible').removeClass('even').removeClass('odd');
	$jq(tbody).find('tr:visible:even').addClass('odd');
	$jq(tbody).find('tr:visible:odd').addClass('even');
};
if (typeof $jq == 'undefined')
{
	var $jq = jQuery;
	if (!$jq)
	{
		$jq = jQuer;
	}
}
var iframe_external = false;

function StatsDrawViewClass()
{
	this.public = {};

	this.options = {
		link_hide_class: 'scroll-text-inactive',
		height_fixes: {
			'default': 1,
			'mozilla': 2,
			'webkit': 4,
			'chrome': 4,
			'safari': 4,
			'msie-7': 0,
			'msie-8': 0
		}
	};

	this.limits = {
		"min_x": 0,
		"min_y": 0,
		"max_x": undefined,
		"max_y": undefined,
		"scroll_x": undefined
	};

	this.dimensions = {
		height: undefined,
		heightHeader: undefined,
		heightInternal: undefined,
		offsetBottom: 10,
		offsetTop: undefined
	};

	this.position = { "x": undefined, "y": undefined, "xp": 0 };
	this.keyCodes = { 33: 'page-up', 34: 'page-down', 35: 'end', 36: 'home', 37: 'left', 38: 'up', 39: 'right', 40: 'down'};
	this.scroll = { "horizontal": false, "vertical": false, "disabled": false };
	this.item = { "height": 0, "width": 0 };
	this.el = {};    // element jQuery object swap
	this.swap = {};
	this.ready = false;

	this.scrollEnv = null;
	this.scrollContent = null;
	this.scrollHeader = null;
	this.boxes = {};
	this.box_titles = {};

	this.browserScrollbarWidth = null;
	this.searchInScrollAreaHackEnabled = true;

	this.detailVersion = 1; // version of detail and detail url

	// HELPERS {
	// check on browser version
	this.getBrowser = function()
	{
		var browser = '';
		$jq.each($jq.browser, function(attr, value)
		{
			if (value == true)
			{
				browser = attr;
			}
		});

		return browser + (browser == 'msie' ? '-' + parseInt($jq.browser.version) : '');
	};

	this.mobile = function()
	{
		return $jq.browser.mobile || /android|ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
	};

	// show/hide scroll whole links box if necessary
	this.update_scrollbox = function()
	{
		((!this.scroll.disabled && !this.scroll.horizontal) || this.limits.min_x >= this.limits.max_x) ? this.scrollHeader.links.hide() : this.scrollHeader.links.show();
		this.dimensions.offsetTop = this.scrollEnv.offset().top + this.dimensions.heightHeader;
	};

	// show/hide scroll links on the top
	this.update_links = function()
	{
		this.position.x < this.limits.max_x ? this.show_links(this.el.lr) : this.hide_links(this.el.lr);
		this.position.x > this.limits.min_x ? this.show_links(this.el.ll) : this.hide_links(this.el.ll);
	};

	this.hide_links = function(context)
	{
		context.addClass(this.options.link_hide_class);
	};

	this.show_links = function(context)
	{
		context.removeClass(this.options.link_hide_class);
	};

	// shorten too long names
	this.shorten_result_names = function()
	{
		$jq(".match").each(function(index, match)
		{
			match = $jq(match);

			match.find(".participant").each(function(i, part)
			{
				part = $jq(part);
				var name = part.find(".name");
				var score = 0;
				score = part.find(".score");
				if (score.width() == null)
				{
					score = part.parent().find(".score-final");
				}
				name.width(part.width() - score.width() - (score.width() ? 5 : 0));

				//var nameParts = [];
				//nameParts = name.html().split('</span>');
				//var title = nameParts ? nameParts[nameParts.length - 1] : name.html();
				//name.attr({title: title});
			}.bind(this));
		}.bind(this));
	};
	// }

	// MOVEMENT {

	// Keyboard movement or move by one match
	this.touch = function(dir, e)
	{
		var m;
		var count = 1;

		e.preventDefault();
		(typeof dir == 'number') && (dir = this.keyCodes[parseInt(dir)]);
		if (typeof dir == 'undefined' || !dir)
		{
			return;
		}

		var newpos;
		if ((this.scroll.disabled || this.scroll.horizontal) && ((dir == 'left' && this.position.x > this.limits.min_x) || (dir == 'right' && this.position.x < this.limits.max_x)))
		{
			newpos = this.position.x + count * (dir == 'left' ? -1 : 1);
			if (typeof newpos != 'undefined' && newpos != '')
			{
				var pos = newpos == this.limits.max_x ? this.limits.scroll_x : Math.min(0, Math.max(this.limits.scroll_x, -(this.item.width) * (newpos - this.limits.min_x)));
				this.set_content_displacement('horizontal', pos, 100, true);
				this.position.x = newpos;
				this.update_links();
			}
		}
		else if (this.scroll.vertical && ((dir.indexOf('up') >= 0 && (m = 'up')) || (dir.indexOf('down') >= 0 && (m = 'down'))))
		{
			var d = (dir == 'down' || dir == 'page-down') ? 1 : -1;
			var q = dir.indexOf('page') === 0 ? this.limits.min_y : 1;

			// don't scroll if there is nowhere to go
			if ((m == 'down' && this.position.y < this.limits.max_y) || (m == 'up' && this.position.y > this.limits.min_y))
			{
				newpos = Math.max(this.limits.min_y, Math.min(this.limits.max_y, this.position.y + (count * d * q)));
				this.position.y = newpos;

				if (newpos == this.limits.max_y)
				{
					this.el.env.tinyscrollbar_update("bottom");
					return;
				}

				var limit = this.scrollContent.outerHeight() - (this.limits.min_y * this.item.height * 1.13);
				pos = newpos == this.limits.max_y ? limit : Math.max(0, Math.min(limit, this.item.height * (newpos - this.limits.min_y)));
				this.set_content_displacement('vertical', pos, 100, true);
			}
		}
		else if (this.scroll.vertical && dir == 'home')
		{
			this.el.env.tinyscrollbar_update("top");
			this.position.y = this.limits.min_y;
		}
		else if (this.scroll.vertical && dir == 'end')
		{
			this.el.env.tinyscrollbar_update("bottom");
			this.position.y = this.limits.max_y;
		}
	};

	// update position when scrolling (to preserve keyboard scroll position)
	this.update_vertical_position = function(p)
	{
		if (this.scroll.vertical)
		{
			this.position.y = this.limits.min_y + Math.floor(-p / this.item.height);
		}
	};

	// update horizontal position when scrolling (to preserve keyboard scroll position)
	this.update_horizontal_position = function(p)
	{
		if (this.scroll.horizontal)
		{
			this.position.x = p > this.limits.scroll_x ? this.limits.min_x + Math.floor(-p / this.item.width) : this.limits.max_x;
			this.update_links();
		}
	};

	// move content by to px posistion
	this.set_content_displacement = function(dir, p, duration)
	{
		typeof duration == 'undefined' && (duration = 0);

		if (dir == 'horizontal')
		{
			if (!this.scroll.disabled)
			{
				var scroll_pos = p == 0 ? 0 : Math.floor(p * (this.el.sx.width() - this.el.sx.find(".hthumb").width()) / this.limits.scroll_x);
				this.el.sx.find(".hthumb").animate({"left": scroll_pos}, 150);
			}

			this.scrollContent.animate({"left": Math.round(p) + 'px'}, duration, 'swing');
			this.scrollHeader.content.animate({"left": Math.round(p) + 'px'}, duration, 'swing');
		}

		dir == 'vertical' && this.el.env.tinyscrollbar_update(p);
	};

	// move scrollbar
	this.set_scrollbar_displacement = function(dir, p, duration)
	{
		typeof duration == 'undefined' && (duration = 0);

		var cont_pos;
		if (dir == 'horizontal')
		{
			cont_pos = -(p == 0 ? 0 : Math.floor((p * this.limits.scroll_x) / (this.el.sx.width() - this.el.sx.find(".hthumb").width())));

			this.scrollContent.animate({"left": Math.round(cont_pos) + 'px'}, duration, 'swing');
			this.scrollHeader.content.animate({"left": Math.round(cont_pos) + 'px'}, duration, 'swing');
			this.el.sx.find(".hthumb").animate({"left": -p}, duration);
		}
		else if (dir == 'vertical')
		{
			cont_pos = p == 0 ? 0 : Math.floor(-(p * this.limits.scroll_x) / (this.el.sx.width() - this.el.sx.find(".hthumb").width()));

			this.scrollContent.animate({"left": Math.round(cont_pos) + 'px'}, duration, 'swing');
			this.scrollHeader.content.animate({"left": Math.round(cont_pos) + 'px'}, duration, 'swing');
			this.el.sx.find(".hthumb").animate({"left": p}, duration);
		}
	};

	// }

	// SIZE CONTROL {

	/* Resize draw to match window
	 * @return void
	 */
	this.resize_viewport = function(dont_grab_size)
	{
		var dt = $jq('.detail-terminator');
		var dth = parseInt(dt.css('margin-top')) + parseInt(dt.css('margin-bottom'));
		var wh = $jq(window).height() - $jq("body").outerHeight() + $jq("body").height() - dth;
		this.scrollEnv.width(this.scrollEnv.closest('#playoff-env').width());
		this.update_scrollbox();

		this.dimensions.heightHeader = this.scrollHeader.height();
		this.dimensions.offsetTop = this.scrollEnv.offset().top;
		this.dimensions.offsetBottom = +$jq(".closer").outerHeight() - this.scrollEnv.outerHeight() + this.scrollEnv.height() + this.scrollHeader.height();

		this.scrollEnv.height(wh - this.dimensions.offsetTop - this.dimensions.offsetBottom);
		this.dimensions.height = this.scrollEnv.outerHeight() - this.dimensions.heightHeader;
		if (!dont_grab_size)
		{
			this.dimensions.heightInternal = this.scrollContent.children().height();
		}
	};

	/* Show or hide scrollbars
	 * @return void
	 */
	this.update_scrollbars = function()
	{
		// diff_x was reduced by 20 due to vertical scrollbars' width
		var denied = this.el.env.hasClass('default-scroll');
		var diff_x = this.scrollContent.outerWidth() - this.scrollEnv.width() - 20;
		var diff_y = this.scrollContent.outerHeight() - this.scrollEnv.height();

		if (this.scroll.horizontal = (!denied && diff_x > 0))
		{
			this.scrollHeader.links.addClass('scrolls-x');
			if (!((typeof tournament != 'undefined' && tournament) || (typeof tournamentPage != 'undefined' && tournamentPage) || this.detailVersion == 2))
			{
				this.el.sx.show();
			}
		}
		else
		{
			this.scrollHeader.links.removeClass('scrolls-x');
			this.el.sx.hide();
			this.scrollContent.css("left", 0);
			this.el.sx.find(".hthumb").css("left", 0);
			this.scrollHeader.content.css("left", 0);
		}

		if (this.scroll.vertical = (!denied && diff_y > 0))
		{
			this.scrollHeader.links.addClass('scrolls-y');
			if (!((typeof tournament != 'undefined' && tournament) || (typeof tournamentPage != 'undefined' && tournamentPage) || this.detailVersion == 2))
			{
				this.el.sy.show();
			}
		}
		else
		{
			this.scrollHeader.links.removeClass('scrolls-y');
			this.el.sy.hide();
			this.scrollContent.css("top", 0);
		}
		this.el.sx.width(this.el.env.width() - (this.scroll.horizontal && !this.scroll.vertical ? 0 : (this.el.sy.width() - 1)));
	};
	// }

	// INIT functions {
	// general resize
	this.update_size = function(dont_grab_size)
	{
		if (this.ready && this.scrollEnv.parent().is(":visible"))
		{
			this.searchInScrollAreaHackInit();

			dont_grab_size = typeof dont_grab_size == 'undefined' ? false : !!dont_grab_size;

			if (!this.scroll.disabled)
			{
				this.resize_viewport(dont_grab_size);
				this.update_scrollbars();
			}
			else
			{
				this.dimensions.heightInternal = this.scrollContent.children().height();
			}

			// calculate positions {
			var browser = this.getBrowser();
			var hfix = (typeof this.options.height_fixes[browser] != 'undefined') ? this.options.height_fixes[browser] : this.options.height_fixes['default'];
			var fr = this.scrollContent.find(".round").first();

			this.item.height = fr.find("div.relation").first().height() + fr.find("div.relation").next().height();
			this.item.width = this.scrollEnv.find(".round").first().width();
			this.limits.min_x = Math.round(this.scrollEnv.width() / this.item.width);
			this.limits.min_y = Math.round(this.scrollEnv.height() / this.item.height);
			this.limits.max_x = Math.ceil(this.scrollHeader.find("li").length);
			this.limits.max_y = Math.ceil(fr.find("div.match").length / 2);
			// }

			// reset current positions {
			this.position.x = Math.min(this.limits.max_x, Math.max(this.limits.min_x, Math.floor(-(parseInt(this.scrollContent.css('left')) - 5) / this.item.width) + this.limits.min_x));
			this.position.y = Math.min(this.limits.max_y, Math.max(this.limits.min_y, Math.floor(parseInt(this.scrollContent.css('top')) / this.item.height) + this.limits.min_y));
			// }

			if (!this.scroll.disabled)
			{
				// set up correct hscrollbar handle size {
				var tmp_w = this.el.env.children(".hcrollbar").width();
				this.el.sx.find(".hthumb").width(Math.floor(Math.min(tmp_w, tmp_w / (this.scrollContent.width() / tmp_w))));
				// }

				// save scrollbar sizes {
				this.dimensions.scrollbarSize = this.el.sy.children(".thumb").width();
				// }
			}

			this.limits.scroll_x = this.scrollEnv.width() - this.scrollContent.width() - (isNaN(this.dimensions.scrollbarSize) ? 0 : this.dimensions.scrollbarSize) - 1;

			// update scroll links on top {
			this.update_links();
			this.update_scrollbox();

			if (!this.scroll.disabled)
			{
				this.resize_viewport(dont_grab_size);
				this.el.env.tinyscrollbar_update();  // tinyscrollbars' internal
			}
			// }
			this.scrollEnv.width(this.scrollEnv.parent().width());

			this.searchInScrollAreaHack();
		}
	};

	this.getBrowserScrollbarWidth = function()
	{
		if (this.browserScrollbarWidth != null)
		{
			return this.browserScrollbarWidth;
		}

		var scrollTestElement = $jq("<div style='width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;'></div>");
		$jq('body').append(scrollTestElement);
		var scrollbarWidth = $jq(scrollTestElement).get(0).offsetWidth - $jq(scrollTestElement).get(0).clientWidth;

		$jq(scrollTestElement).remove();
		this.browserScrollbarWidth = scrollbarWidth;

		return scrollbarWidth;
	};

	this.searchInScrollAreaHackInit = function()
	{
		if ((!$jq.browser.mozilla || !this.searchInScrollAreaHackEnabled) && !this.mobile())
		{
			return;
		}
		$jq('#playoff-env').find('.viewport-wrap').css({'width': 'auto', 'height': 'auto'});
	};

	this.searchInScrollAreaHack = function()
	{
		if ((!$jq.browser.mozilla || !this.searchInScrollAreaHackEnabled) && !this.mobile())
		{
			return;
		}

		var scrollbarWidth = this.getBrowserScrollbarWidth();
		var viewport = $jq('#playoff-env').find('.viewport');
		var viewportWrap = $jq('#playoff-env').find('.viewport-wrap');

		$jq(viewportWrap).css({'width': $jq(viewport).outerWidth(true) + 'px', 'height': $jq(viewport).outerHeight(true) + 'px'});
		$jq(viewport).css({'width': ($jq(viewport).outerWidth(true) + scrollbarWidth), 'height': ($jq(viewport).outerHeight(true) + scrollbarWidth) + 'px'});
		$jq(viewportWrap).css('overflow', 'hidden');
		$jq(viewport).css('overflow', 'scroll');
	};

	this.participantWayHighlight = function()
	{
		var matches = $jq(this.scrollEnv).find('.match');
		var highlightClass = 'participant-way-highlight';

		$jq(matches).hover(function()
		{
			var participantsClasses = [];

			if ($jq(this).is(':not(.has-events)'))
			{
				$jq(this).addClass('participant-way-highlight');
			}

			$jq(this).find('.participant').each(function()
			{
				var participantClass = ($jq(this).attr('class').match(/\bglib\-participant\-([^\s]*)\b/));
				if (participantClass != null && typeof participantClass[0] != 'undefined')
				{
					participantsClasses.push(participantClass[0]);
				}

			});

			for (var i in participantsClasses)
			{
				$jq(matches).has('.participant.' + participantsClasses[i]).not(this).addClass(highlightClass);
			}

		}, function()
		{
			$jq(this).removeClass('participant-way-highlight');
			$jq(matches).removeClass(highlightClass);
		});
	};

	// init hscroll (run only once) (HC Roll Bar)
	this.create_horizontal_scrollbar = function()
	{
		this.el.sx.thumb.unbind(".hcb").bind("mousedown", {}, function(e)
		{
			e.preventDefault();
			e.stopPropagation();

			// prevent IE from selecting text
			try
			{
				this.options.original_onselectstart = document.onselectstart;
				document.onselectstart = function()
				{
					return false;
				}
			} catch (e)
			{
			}

			typeof this.public.i == 'undefined' && (this.public.i = 0);
			this.public.i++;

			var hmax = this.el.sx.width() - this.el.sx.thumb.width();
			$jq("body").bind("mousemove", { "start": e.pageX, "max": hmax, "h_quotient": hmax / this.limits.scroll_x }, function(e)
			{
				// set up limits && count position
				pos = Math.max(0, Math.min(e.data.max, parseInt(this.el.sx.thumb.css('left')) - (e.data.start - e.pageX)));
				e.data.start = e.pageX;                                                               // reset click position to last position save
				p = pos / e.data.h_quotient;                                                            // count content scroll

				this.scrollContent.css({"left": Math.round(p) + 'px'});
				this.scrollHeader.content.css({"left": Math.round(p) + 'px'});
				this.el.sx.thumb.css("left", pos + 'px');
				this.update_horizontal_position(p);
			}.bind(this));
		}.bind(this));

		this.el.sx.find(".htrack").mousedown(function(e)
		{
			var t = this.el.sx.find('.hthumb');
			var position = parseInt(t.css('left'));
			var width = parseInt(t.width());
			var yScrollbarWidth = (this.scroll.vertical ? parseInt(this.el.sy.width()) : 0);
			var maxClickWidth = $jq(window).width()-yScrollbarWidth;
			var click=(e.pageX >= maxClickWidth ? maxClickWidth : e.pageX);
			this.set_scrollbar_displacement('horizontal', -click + (click >= position + width ? width : 0), 100);
		}.bind(this));

		$jq(document).mouseup(function(e)
		{
			try
			{
				document.onselectstart = this.options.original_onselectstart;
			} catch (e)
			{
			}

			$jq("body").unbind('mousemove');
			hscroll = undefined;
		}.bind(this));
	};

	this.restart = function()
	{
		this.ready = false;
	};

	// secondary constructor, general init
	this.init = function(detailVersion)
	{
		if (typeof detailVersion != 'undefined')
		{
			this.detailVersion = detailVersion;
		}

		window.dw = this; // ??
		this.el.env = $jq("#playoff-env");

		// Don't do anything if you don't see draw
		if (this.el.env.length != 1)
		{
			return;
		}

		// Check all participants for long names
		(!$jq.browser.msie || ($jq.browser.msie && $jq.browser.version >= 7)) && this.shorten_result_names();

		this.scrollEnv = this.el.env.find(".viewport");
		this.scrollContent = this.el.env.find(".overview");
		this.scrollHeader = $jq("#playoff-header");
		this.scrollHeader.content = this.scrollHeader.find("ul").first();
		this.scrollHeader.links = $jq("#playoff-links, .playoff-scroll-buttons");

		if (detailVersion == 2 || (typeof tournament != 'undefined' && tournament) || (typeof tournamentPage != 'undefined' && tournamentPage))
		{
			this.searchInScrollAreaHackEnabled = false;
			var columnCount = parseInt($jq('#draw_column_count').text());
			var columnWidth = parseInt($jq('#detail .round').css('width'));
			this.scrollContent.css('width', columnWidth * columnCount);
			this.scrollEnv.css('height', this.scrollContent.outerHeight());
			$jq('#playoff-header ul').css('width', columnWidth * columnCount);
		}

		if (this.scroll.disabled != true && !(this.scroll.disabled = this.el.env.hasClass('default-scroll')))
		{
			this.scrollEnv.closest('#playoff-env').prepend('<div class="scrollbar"><div class="track"><div class="thumb scroll-box"><div class="end"></div></div></div></div>');
			this.scrollEnv.closest('#playoff-env').prepend('<div class="hcrollbar"><div class="htrack"><div class="hthumb scroll-box"><div class="hend"></div></div></div></div>');

			this.el.sx = this.el.env.children(".hcrollbar");
			this.el.sx.thumb = this.el.sx.find(".hthumb");
			this.el.sy = this.el.env.children(".scrollbar");
			this.el.env.tinyscrollbar(); // vertical scrollbar

			this.create_horizontal_scrollbar();
		}

		this.el.lr = this.scrollHeader.links.find(".scroll-right");
		this.el.ll = this.scrollHeader.links.find(".scroll-left");

		$jq(window).bind('resize', {"dw": this}, function(e)
		{
			e.data.dw.update_size();
		});
		$jq(document).keydown(function(e)
		{
			e.keyCode in this.keyCodes && this.touch(e.keyCode, e)
		}.bind(this));

		if (this.mobile())
		{
			var trackV = $jq('.track');
			var trackH = $jq('.htrack');
			var thumbV = $jq('.scrollbar .track .thumb');
			var thumbH = $jq('.hcrollbar .htrack .hthumb');
			var viewport = $jq('.viewport');
			var overview = $jq('.overview');

			$jq('.viewport').bind('scroll', function(e)
			{
				var d = (trackV.height() - thumbV.height()) / (overview.height() - viewport.height());
				var dx = (trackH.width() - thumbH.width()) / (overview.width() - viewport.width());
				thumbV.css('top', Math.floor(viewport.get(0).scrollTop * d));
				thumbH.css('left', Math.floor(viewport.get(0).scrollLeft * dx));
				this.position.x = Math.floor((viewport.width() + viewport.get(0).scrollLeft) / this.item.width);
				this.update_links();
			}.bind(this));
		}

		this.update_size();

		/* Fix CSS tables for madafaq IE
		 */
		if ($jq.browser.msie && $jq.browser.version <= 7)
		{
			$jq(".match.has-events ul").wrap('<table cellspacing="0" cellpadding="0" style="padding:0 !Important; width:100%;" />');
			$jq(".match.has-events").each(function(i, el)
			{
				var rows = $jq(el).find(".playoff-box-result-inner li span.row");

				rows.each(function(ri, row)
				{
					$jq(row).find("span").each(function(index, td)
					{
						var tds = $jq(td).hasClass('info') ? "<td colspan='3' />" : "<td />";
						$jq(td).wrap(tds);
					});

					$jq(row).wrapInner("<tr class='" + ($jq(row).parent().attr('class')) + "' />");

					var table = $jq(el).find('tr');
					table.unwrap().unwrap().unwrap();
					$jq(el).find('table tr td:first-child').css('border-left', 'none');
				});
			});
		}

		// Set up box actions
		$jq(".match.has-events").unbind('.draw').bind('click.draw', {'dw': this}, this.match_cell_callback);

		// setup scroll links
		this.el.ll.unbind('click').bind('click', {'dw': this}, function(e)
		{
			e.data.dw.touch('left', e);
		});
		this.el.lr.unbind('click').bind('click', {'dw': this}, function(e)
		{
			e.data.dw.touch('right', e);
		});
		$jq('a.scroll-box').unbind('.draw').bind('click.draw', {'dw': this}, function(e)
		{
			e.data.dw.touch(null, e);
		});

		this.participantWayHighlight();
		this.ready = true;
	};

	this.match_cell_callback = function(e)
	{
		var dw = e.data.dw;
		var box = $jq(this);
		var id = box.attr('id');
		var matches = box.find(".matches");
		typeof dw.swap.a == 'undefined' && (dw.swap.a = 1);

		if (matches.length)
		{
			if (box.hasClass('unpacked'))
			{
				box.removeClass('unpacked');
				var bb = box.find('.matches');
				var bbp = bb.prev();

				bb.remove();
				bb.insertAfter(bbp);
				typeof dw.box_titles[id] != 'undefined' && box.attr("title", dw.box_titles[id]);

				if (box.hasClass('shrink'))
				{
					box.removeClass('shrink');
				}
				delete dw.boxes[id];
			}
			else
			{
				dw.swap.a++;
				box.css('z-index', dw.swap.a).addClass('unpacked');
				matches.css('z-index', dw.swap.a);
				box.parent().css('z-index', dw.swap.a);
				dw.boxes[id] = matches.outerHeight() + box.outerHeight() + box.position().top + box.parent().position().top + 5;
				dw.box_titles[id] = box.attr("title");
				box.removeAttr("title");

				if (dw.boxes[id] > (dw.dimensions.heightInternal))
				{
					box.addClass('shrink');
					if (dw.boxes[id] > (dw.scrollContent.height()))
					{
						if (dw.scrollEnv.height() < dw.boxes[id])
						{
							dw.scrollEnv.height(dw.boxes[id] + 2);
						}

						dw.scrollContent.height(dw.boxes[id]);
						dw.update_size(true);
						!dw.scroll.disabled && dw.el.env.tinyscrollbar_update('bottom');
					}
				}

				if (typeof detail_open == 'function')
				{
					box.find("li").click(function(e)
					{
						e.stopPropagation();
					});
					box.find("a.match-detail-link").click(function(e)
					{
						var classes = $jq(this).attr("class").split(" ");
						var mid;

						for (i in classes)
						{
							if (classes[i].match(/match\-[a-z]_[0-9]+_[a-zA-Z0-9]+/))
							{
								mid = classes[i].substr(6);
								break;
							}
						}

						if (typeof mid != 'undefined' && mid)
						{
							if (dw.detailVersion == 2)
							{
								var re = / glib-partnames-([^ ]+) /;
								var partnames = re.exec(' ' + $jq(this).attr('class') + ' ');
								if (partnames && typeof partnames[1] != 'undefined')
								{
									partnames = partnames[1].split(';');
									detail_open(mid, null, partnames[0], typeof partnames[1] != 'undefined' ? partnames[1] : null, $jq('#season_url').text(), false);
								}
							}
							else
							{
								detail_open(mid, null, null, null, null, false);
							}

							e.stopPropagation();
							e.preventDefault();
							return false;
						}
					});
				}
				else
				{
					box.find("a.match-detail-link").click(function(e)
					{
						e.stopPropagation();
					});
				}
			}
		}
	};
};

var StatsDrawView = new StatsDrawViewClass();

// tinyscrollbar for jQuery, fixed for IE
// used in draw

(function(a)
{
	function b(b, c)
	{
		function scrollbar_jump(a)
		{
			if (!(g.ratio >= 1))
			{
				var offset = i.obj.offset();
				var click = k ? a.pageX : a.pageY - (k ? offset['left'] : offset['top']);
				var size = parseInt(j.obj.css(k ? 'width' : 'height'));
				var pos_increment = size + o.now < click ? size : 0;

				o.now = (click - pos_increment);
				n = o.now * h.ratio;
				g.obj.css(l, -n);
				j.obj.css(l, o.now);
				window.dw.update_vertical_position(-n);
			}
			return false
		}

		function w(a)
		{
			if (!(g.ratio >= 1))
			{
				o.now = Math.min(i[c.axis] - j[c.axis], Math.max(0, o.start + ((k ? a.pageX : a.pageY) - p.start)));
				n = o.now * h.ratio;
				g.obj.css(l, -n);
				j.obj.css(l, o.now);
				window.dw.update_vertical_position(-n)
			}
			return false
		}

		function v(b)
		{
			a(document).unbind(".scrollbar");
			a(document).unbind("mousemove", w);
			a(document).unbind("mouseup", v);
			j.obj.unbind("mouseup", v);
			document.ontouchmove = j.obj[0].ontouchend = document.ontouchend = null;
			return false;
		}

		function u(b)
		{
			if (!(g.ratio >= 1))
			{
				var b = b || window.event;
				var d = b.wheelDelta ? b.wheelDelta / 120 : -b.detail / 3;
				n -= d * c.wheel;
				n = Math.min(g[c.axis] - f[c.axis], Math.max(0, n));
				j.obj.css(l, n / h.ratio);
				g.obj.css(l, -n);
				b = a.event.fix(b);
				window.dw.update_vertical_position(-n);
				b.preventDefault()
			}
		}

		function t(b)
		{
			p.start = k ? b.pageX : b.pageY;
			var c = parseInt(j.obj.css(l));
			o.start = c == "auto" ? 0 : c;
			a(document).bind("mousemove", w);
			a(document).bind('mouseup.scrollbar', v);
			document.ontouchmove = function(b)
			{
				a(document).unbind("mousemove");
				w(b.touches[0])
			};
			a(document).bind("mouseup", v);
			j.obj.bind("mouseup", v);
			j.obj[0].ontouchend = document.ontouchend = function(b)
			{
				a(document).unbind("mouseup");
				j.obj.unbind("mouseup");
				v(b.touches[0])
			};

			return false
		}

		this.s = function()
		{
			j.obj.bind("mousedown", t);
			j.obj[0].ontouchstart = function(a)
			{
				a.preventDefault();
				a.stopPropagation();
				j.obj.unbind("mousedown");
				t(a.touches[0]);
				return false
			};
			i.obj.bind("mouseup",scrollbar_jump);
			if (c.scroll)
			{
				if ("onmousewheel" in e[0]) {
					e[0].onmousewheel = u;
				} else {
					e[0].addEventListener('DOMMouseScroll', u, false);
				}
			}
		};

		function r()
		{
			j.obj.css(l, n / h.ratio);
			g.obj.css(l, -n);
			p["start"] = j.obj.offset()[l];
			var a = m.toLowerCase();
			h.obj.css(a, Math.round(i[c.axis]));
			i.obj.css(a, Math.round(i[c.axis]));
			j.obj.css(a, Math.round(j[c.axis]));
		}

		this.q = function ()
		{
			d.update();
			this.s();
			return d
		};

		var d = this;
		var e = b;
		var f = {obj: a(".viewport", b)};
		var g = {obj: a(".overview", b)};
		var h = {obj: a(".scrollbar", b)};
		var i = {obj: a(".track", h.obj)};
		var j = {obj: a(".thumb", h.obj)};
		var k = c.axis == "x", l = k ? "left" : "top", m = k ? "Width" : "Height";
		var n, o = {start: 0, now: 0}, p = {};
		this.update = function(a)
		{
			g[c.axis] = m == 'Height' ? $jq(g.obj[0]).outerHeight() : $jq(g.obj[0]).outerWidth();
			f[c.axis] = f.obj[0]["offset" + m];
			g.ratio = f[c.axis] / g[c.axis];
			h.obj.toggleClass("disable", g.ratio >= 1);
			i[c.axis] = c.size == "auto" ? f[c.axis] : c.size;
			j[c.axis] = Math.min(i[c.axis], Math.max(0, c.sizethumb == "auto" ? i[c.axis] * g.ratio : c.sizethumb));
			h.ratio = c.sizethumb == "auto" ? g[c.axis] / i[c.axis] : (g[c.axis] - f[c.axis]) / (i[c.axis] - j[c.axis]);
			n = a == "relative" && g.ratio <= 1 ? Math.min(g[c.axis] - f[c.axis], Math.max(0, n)) : 0;
			n = a == "bottom" && g.ratio <= 1 ? g[c.axis] - f[c.axis] : isNaN(parseInt(a)) ? n : parseInt(a);

			if (a == "overview-y")
			{
				n = -1 * parseInt($jq('.overview').css('top'));
			}

			r()
		};

		return this.q()
	}

	a.tiny = a.tiny || {};
	a.tiny.scrollbar = {options: {axis: "y", wheel: 40, scroll: true, size: "auto", sizethumb: "auto"}};
	a.fn.tinyscrollbar = function(c)
	{
		var c = a.extend({}, a.tiny.scrollbar.options, c);
		this.each(function()
		{
			a(this).data("tsb", new b(a(this), c))
		});
		return this
	};
	a.fn.tinyscrollbar_update = function(b)
	{
		return a(this).data("tsb").update(b)
	};
})($jq);if (typeof $jq == 'undefined')
{
	var $jq = jQuery;
	if (!$jq)
	{
		$jq = jQuer;
	}
}
var TabFilter = (function($jq)
{
	var TabFilter = function(tab, selectedFilter, rowsVisibled)
	{
		this.uls = null;
		this.tbody = null;
		this.allRows = null;
		this.noResultsText = '';
		this.noResultsTFoot = null;
		this.selectedFilter = [];

		var filterRow = $jq('.glib-stats-filter', tab.box);
		this.uls = filterRow.find('ul[data-name]');
		this.tbody = $jq('table.stats-table tbody', tab.box);
		this.noResultsText = filterRow.attr('data-no-results-text');
		this.rowsVisibled = this.tbody.find('tr:not(:hidden)').length;

		if (this.uls.length > 0)
		{
			this.allRows = this.tbody.children();

			// record number of visible rows
			this.tbody.data('visibleRows', this.allRows.not('.hidden').length);
			var obj = this;

			this.uls.each(function() {
				if (obj.initList($jq(this)) === false)
				{
					$jq(this).parent().remove();
				}
			});
		}

		// all lists could have been removed
		if (filterRow.find('ul[data-name]').length)
		{
			this.adjustFilterRowCss(filterRow);

			// hide opened list on any click
			$jq(document).on('click', {obj: this}, this.tableClicked);
		}


		var filter = false;
		if (selectedFilter != null)
		{
			for (var i in selectedFilter)
			{
				var opt = selectedFilter[i];
				if (typeof this.uls[opt.ul] !== 'undefined')
				{
					var $ul = $jq(this.uls[opt.ul]);
					var $li = $ul.find('li:eq(' + opt.li + ')');
					this.setOption($ul, $li);
					filter = true;
				}
			}
		}
		if (rowsVisibled != null)
		{
			this.tbody.data('visibleRows', rowsVisibled);
			filter = true;
		}



		if (filter)
		{
			this.filterChanged();
		}

	};

	TabFilter.prototype.tableClicked = function(e)
	{
		var obj = e.data.obj;

		obj.uls.removeClass('open');
	};

	TabFilter.prototype.initList = function(ul)
	{

		var option = null;
		var values = [];
		var nationalities = [];
		var valuesOrderMap = {};
		var optionsFragment = null;
		var column = ul.attr('data-name');
		var isVirtual = !!ul.attr('data-is-virtual');
		var valueToRowsMap = ul.data('valueToRowsMap', {}).data('valueToRowsMap');

		var obj = this;
		if (isVirtual)
		{
			this.allRows.each(function() {
				var row = $jq(this);
				var value = row.attr('data-virtual-' + column);
				var order = row.attr('data-virtual-' + column + '-choice-order');
				var nationality_id = row.attr('data-nationality-id');

				if (!value)
				{
					// continue, row won't be chosen by any value
					return true;
				}
				value = obj.processValue(column, value);
				if (!valueToRowsMap[value])
				{
					valueToRowsMap[value] = $jq();
					if (order)
					{
						valuesOrderMap[value] = order;
					}
				}
				valueToRowsMap[value].push(this);

				nationalities[value] = nationality_id;
			});
		}
		else
		{
			var columnCell = this.tbody.find('tr:eq(0) td.' + column);

			// column is not present
			if (!columnCell.length)
			{
				return false;
			}
			var columnPosition = columnCell[0].cellIndex + 1;

			this.tbody.find('tr td:nth-child(' + columnPosition + ')').each(function() {
				var value = $jq(this).text();
				if (!value)
				{
					// continue, row won't be chosen by any value
					return true;
				}
				value = obj.processValue(column, value);
				if (!valueToRowsMap[value])
				{
					valueToRowsMap[value] = $jq();
				}
				valueToRowsMap[value].push(this.parentNode);
			});
		}

		// there are no values to filter by
		if ($jq.isEmptyObject(valueToRowsMap))
		{
			return false;
		}

		// collect values
		for (var value in valueToRowsMap)
		{
			values.push(value);
		}

		if ($jq.isEmptyObject(valuesOrderMap))
		{
			values.sort(this.alphaSort);
		}
		else
		{
			values.sort(function(a, b) {
				return valuesOrderMap[a] < valuesOrderMap[b] ? -1 : 1;
			});
		}

		// set currently selected item
		ul.data('selectedItem', ul.children());

		// append values as li's to ul
		// (using document fragment is faster than appending in $jq.each)
		optionsFragment = document.createDocumentFragment();
		for (var i in values)
		{
			option = document.createElement('li');

			// flags
			if (column == 'nationality')
			{
				var flag = document.createElement('span');
				flag.setAttribute('class', 'flag fl_' + nationalities[values[i]]);
				option.appendChild(flag);
			}

			option.appendChild(document.createTextNode(values[i]));
			optionsFragment.appendChild(option);
		}

		ul[0].appendChild(optionsFragment);

		// bind event to do actual filtering
		ul.on('click', {obj: this}, this.listClicked);
	};

	TabFilter.prototype.listClicked = function(e)
	{
		var obj = e.data.obj;

		var item = null;
		var list = $jq(this);

		// option was selected
		if (list.hasClass('open'))
		{
			item = $jq(e.target);
			obj.setOption(list, item);
			obj.filterChanged();
		}
		// show list
		else
		{
			obj.uls.removeClass('open');
			list.addClass('open');
		}

		return false;
	};

	TabFilter.prototype.setOption = function($list, $item)
	{
		$list.data('selectedItem').removeClass('selected');
		$item.addClass('selected');
		$list.data('selectedItem', $item);
		$list.removeClass('open');
	};

	TabFilter.prototype.filterChanged = function()
	{
		var value = null;
		var showAll = true;
		var valueToRowsMap = null;
		var $selectedRows = this.allRows;

		this.allRows.addClass('filtered-out');

		this.selectedFilter = [];

		this.uls.each(
			(function(that){
				return function(ulIndex) {
					var $ul = $jq(this);
					value = $ul.data('selectedItem').text();
					valueToRowsMap = $ul.data('valueToRowsMap');
					if (valueToRowsMap && value in valueToRowsMap)
					{
						$selectedRows = $selectedRows.filter(valueToRowsMap[value]);
						that.selectedFilter.push({ul: ulIndex, li: $ul.data('selectedItem').index()});
						showAll = false;
					}
				}
			})(this)
		);

		if (this.noResultsTFoot)
		{
			this.noResultsTFoot.hide();
		}

		if (showAll)
		{
			this.allRows.removeClass('hidden filtered-out');

			var rowsVisibled = this.tbody.data('visibleRows');
			if (rowsVisibled)
			{
				this.rowsVisibled = rowsVisibled;
			}

			this.allRows.filter((function(obj)
				{
					return function(i, e)
					{
						return i >= obj.rowsVisibled;
					}
				}(this)
			)).addClass('hidden');
		}
		else
		{
			$selectedRows.removeClass('hidden filtered-out');
			if (!$selectedRows.length)
			{
				this.showNoResultsTFoot();
			}
		}

		fix_row_parity(this.tbody);

		toggle_show_more(this.tbody);
	};

	TabFilter.prototype.adjustFilterRowCss = function(filterRow)
	{
		var menu = $jq('.stats-shared-menu .ifmenu');
		var spacer = $jq('.stats-shared-menu .color-spacer:visible').last();
		var menuMargin = null;

		if (spacer.length)
		{
			menuMargin = menu.css('marginLeft');
			if (parseInt(menuMargin) == 0)
			{
				menuMargin = '10px';
			}
			filterRow.css({
				backgroundColor: spacer.css('backgroundColor'),
				borderBottomWidth: spacer.css('borderBottomWidth'),
				borderBottomStyle: spacer.css('borderBottomStyle'),
				borderBottomColor: spacer.css('borderBottomColor'),
				marginTop: '-' + spacer.css('borderBottomWidth'),
				paddingTop: 1,
				paddingRight: 0,
				paddingBottom: parseInt(spacer.css('height'), 10) + 1,
				paddingLeft: menuMargin
			});
			filterRow.find('.list-wrapper').css({
				marginRight: menuMargin
			});
		}
	};

	TabFilter.prototype.showNoResultsTFoot = function()
	{
		// To maintain header cells padding, this complicated approach has to be taken.
		if (!this.noResultsTFoot)
		{
			this.noResultsTFoot = $jq('<tfoot class=no-results-found />');
			var colspan = this.tbody.find('tr:first-child > td').length;
			var tr = $jq('<tr/>').append(
				$jq('<td/>').append(
					$jq('<div/>').append(
						$jq('<span/>', { text: this.noResultsText })
					)
				)
			);
			for (var i = 1; i < colspan; i++)
			{
				tr.append('<td/>');
			}

			this.noResultsTFoot.append(tr).insertAfter(this.tbody);
		}

		this.noResultsTFoot.show();
	};

	TabFilter.prototype.processValue = function(columnName, value)
	{
		// remove former teams
		if (columnName === 'team_name')
		{
			var bracketPos = value.indexOf(' (');
			if (bracketPos !== -1)
			{
				return value.substring(0, bracketPos);
			}
		}

		return value;
	};

	TabFilter.prototype.getSelectedFilter = function()
	{
		return this.selectedFilter;
	};

	TabFilter.prototype.getRowsVisibled = function()
	{
		var rowsVisibled = this.tbody.data('visibleRows');
		return rowsVisibled || this.rowsVisibled;
	};

	TabFilter.prototype.alphaSort = function(a, b)
	{
		// localeCompare() is slow, might cause performance problems
		return a.localeCompare(b);
	};

	return TabFilter;

})($jq);
/** Konstruktor StatsTableWidthChecker
*
* @param object settings
*/
var StatsTableWidthChecker = function(settings){
	if(this.isWorking()){
	return;
	}

	this.tableElement = null;
	this.maxSize = null;
	this.minSize = null;
	this._isCSSTextOverflowAvaible = null;
	this._isCSSTextOverflowAvaible = this.isCSSTextOverflowAvaible();
	this.init(settings);
};

StatsTableWidthChecker.prototype.isWorking = function(){


	return typeof $jq(this.tableElement).data('truncate-working') == 'undefined' ? false : $jq(this.tableElement).data('truncate-working');
};

StatsTableWidthChecker.prototype.setIsWorking = function(status){

	$jq(this.tableElement).data('truncate-working',status);
};

StatsTableWidthChecker.isWorking = function(tableElement){

	return typeof $jq(tableElement).data('truncate-working') == 'undefined' ? false : $jq(tableElement).data('truncate-working');
};

StatsTableWidthChecker.prototype.isCSSTextOverflowAvaible = function(){
	if(this._isCSSTextOverflowAvaible!== null){
	return this._isCSSTextOverflowAvaible;
	}
	var d = document.createElement("span");
	try{
	if(typeof d.style.textOverflow == 'undefined'){

		return false;
	}else{
		d.style.textOverflow = 'ellipsis';

		if(d.style.textOverflow == 'ellipsis'){
		return true;
		}else{
		return false;
		}
	}
	}catch(e){
		return false;
	}

};

/** Inicializace dle nastaveni
*
* @param object settings
*/
StatsTableWidthChecker.prototype.init = function(settings){
	this.tableElement = settings.tableElement;
	this.minSize = settings.minSize;
	this.maxSize = settings.maxSize;
};

/**
* Vraci rozsah presezeni dane maxWidth
*/
StatsTableWidthChecker.prototype.getOverflowSize = function(){
	if(this.maxSize == 0){
	return 0;
	}

	var diff = $jq(this.tableElement).outerWidth() - this.maxSize;

	return diff >= 0 ? diff : 0;
};

/**
* Zkrati text v kazde bunce se jmenem participanta
*
*/
StatsTableWidthChecker.prototype.truncateParticipant = function(){
	if(this.isWorking()){
	return;
	}

	this.setIsWorking(true);

	var overflow = this.getOverflowSize();

	var participantsColumns = $jq(this.tableElement).find("tr td.participant_name");
	var iconSize = 0;
	var teamLogo = $jq(participantsColumns).find(".team-logo");
	if($jq(teamLogo).size()){
	iconSize = $jq(teamLogo).outerWidth(true);
	}

	var columnSize = $jq(participantsColumns).eq(0).width();
	var maxTextSize = columnSize-iconSize-overflow;

	if(maxTextSize < this.minSize){
	maxTextSize = this.minSize;
	}

	var context = this;
	$jq(participantsColumns).find(".team_name_span").each(function(){


	if (context.isCSSTextOverflowAvaible()) {
		if (!$(this).siblings('.dw-icon').length) {
			$jq(this).css("display", "inline-block");
		}
		if (maxTextSize <= 0) {
			$jq(this).css("width", "auto");
		} else {
			$jq(this).css("width", maxTextSize + "px");
		}
		return;
	}

	context.truncate(this,maxTextSize);


	});
	this.setIsWorking(false);

};
/**
* Zkrati text v kazde elementu a prida '...'
* @param object element - element s textem
* @param object width - max sirka textu
*/
StatsTableWidthChecker.prototype.truncate =function (element,width){

	var text = "";

	if($jq(element).data('origin-text') == null){
	text = $jq(element).text();
		$jq(element).data('origin-text',text);
	}else{
	text = $jq(element).data('origin-text');
		$jq(element).text(text);
	}

	if($jq(element).outerWidth(true)<=width){
		return;
	}

	text = text+"...";

	$jq(element).text(text);

	while($jq(element).outerWidth(true)>width){
	if(text == "..."){
		return;
	}

		$jq(element).text(text.substr(0,text.length-4)+"...");
	text = $jq(element).text();

	}
};

StatsTableWidthChecker_CheckItemWidth = function($box){

	var statsTable = $jq($box).find("table:nth-child(1)");
	var statsTableContainer = $jq($box).find(".stats-table-container:nth-child(1)");


	if($jq(statsTable).size() == 1 && $jq(statsTableContainer).size()){
	TableCheckerCallback = function(){
		if(StatsTableWidthChecker.isWorking(statsTable)){
		return;
		}

		var sizeChecker = new StatsTableWidthChecker({
		tableElement:$jq(statsTable),
		maxSize:$jq(statsTableContainer).innerWidth(true),
		minSize:65
		});
		sizeChecker.truncateParticipant();
	};

	TableCheckerCallback();
	var timeout = null;
		$jq(window).resize(function() {
		var windowWidth = $jq(window).innerWidth();

		clearTimeout(timeout);
		timeout = setTimeout(function(width) {
		return function(){
				if(width ==  $jq(window).innerWidth()){
				TableCheckerCallback();
				}
		}}(windowWidth),200);


	});
	}
};
(function() {
  var AllowedTab, Events, MainTabItem, MenuHtml, Request, Signs, Stats2, TabContent, TabItem, Table, Tabs,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  AllowedTab = (function() {
    function AllowedTab(_config, _table, _signs) {
      this._config = _config;
      this._table = _table;
      this._signs = _signs;
      this._prepare();
    }

    AllowedTab.prototype.isAllowed = function(tableTypeId, tableSubTypeId) {
      var j, len, ref, subItem;
      if (tableSubTypeId == null) {
        tableSubTypeId = null;
      }
      tableTypeId = tableTypeId * 1;
      if (this._allowedTabs[tableTypeId]) {
        if (tableSubTypeId != null) {
          ref = this.getSubTabItems(tableTypeId);
          for (j = 0, len = ref.length; j < len; j++) {
            subItem = ref[j];
            if (subItem.id * 1 === tableSubTypeId * 1) {
              return true;
            }
          }
          return false;
        } else {
          if ((this._subTabs[tableTypeId] != null) && (this._table.isFormTable(tableTypeId) || this._table.isOverUnderTable(tableTypeId)) && this._subTabs[tableTypeId].length === 0) {
            return false;
          }
        }
        return true;
      }
      return false;
    };

    AllowedTab.prototype.getSubTabItems = function(tableTypeId) {
      var ids, ref;
      tableTypeId = tableTypeId * 1;
      if (((ref = this._subTabs) != null ? ref[tableTypeId] : void 0) == null) {
        return [];
      }
      ids = this._subTabs[tableTypeId];
      if (this._table.isFormTable(tableTypeId)) {
        return this._getFormSubItems(ids);
      } else if (this._table.isOverUnderTable(tableTypeId)) {
        return this._getOverUnderSubItems(ids);
      }
      return [];
    };

    AllowedTab.prototype.setAllowed = function(tableTypeId, tableSubTypeId) {
      if (tableSubTypeId == null) {
        tableSubTypeId = null;
      }
      tableTypeId = tableTypeId * 1;
      this._allowedTabs[tableTypeId] = 1;
      if (this._subTabs[tableTypeId] == null) {
        this._subTabs[tableTypeId] = [];
      }
      if ((tableSubTypeId != null) && indexOf.call(this._subTabs[tableTypeId], tableSubTypeId) < 0) {
        return this._subTabs[tableTypeId].push(tableSubTypeId * 1);
      }
    };

    AllowedTab.prototype._prepare = function() {
      var allowedTab, allowedTabs, j, len, ref, results, tableSubTypeId, tableTypeId;
      this._allowedTabs = {};
      this._subTabs = {};
      allowedTabs = (this._signs.TB + "").split(',');
      results = [];
      for (j = 0, len = allowedTabs.length; j < len; j++) {
        allowedTab = allowedTabs[j];
        ref = (allowedTab + "").split(':'), tableTypeId = ref[0], tableSubTypeId = ref[1];
        results.push(this.setAllowed(tableTypeId, tableSubTypeId));
      }
      return results;
    };

    AllowedTab.prototype._getFormSubItems = function(ids) {
      var id, items, j, len;
      items = [];
      for (j = 0, len = ids.length; j < len; j++) {
        id = ids[j];
        items.push({
          name: (id + 1) * 5,
          url: (id + 1) * 5,
          sortKey: id,
          id: id
        });
      }
      return items;
    };

    AllowedTab.prototype._getOverUnderSubItems = function(ids) {
      var id, items, j, len;
      if (this._config.overUnderTypes == null) {
        return [];
      }
      items = [];
      for (j = 0, len = ids.length; j < len; j++) {
        id = ids[j];
        if (this._config.overUnderTypes[id] == null) {
          continue;
        }
        items.push({
          name: this._config.overUnderTypes[id].name,
          url: this._config.overUnderTypes[id].name,
          sortKey: this._config.overUnderTypes[id].sort,
          defaultTabOrder: this._config.overUnderTypes[id].default_tab_order,
          id: id
        });
      }
      return items;
    };

    return AllowedTab;

  })();

  Events = (function() {
    Events.SUPPORTED_EVENTS = {
      'init': 1,
      'beforeBoxDownload': 1,
      'beforeBoxReplace': 1,
      'afterBoxDownload': 1,
      'boxShow': 1,
      'boxHide': 1
    };

    function Events() {
      this._events = {};
    }

    Events.prototype.on = function(name, cb, obj, reset) {
      if (obj == null) {
        obj = null;
      }
      if (reset == null) {
        reset = false;
      }
      if (!Events.SUPPORTED_EVENTS[name]) {
        throw new Error("Event " + name + " not supported");
      }
      if ((this._events[name] == null) || reset) {
        this._events[name] = [];
      }
      return this._events[name].push({
        cb: cb,
        obj: obj
      });
    };

    Events.prototype.fire = function() {
      var event, j, len, name, params, ref, results;
      name = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (this._events[name] == null) {
        return;
      }
      ref = this._events[name];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        event = ref[j];
        results.push(event.cb.apply(event.obj, params));
      }
      return results;
    };

    return Events;

  })();

  MenuHtml = (function() {
    function MenuHtml(_tabsMenu) {
      this._tabsMenu = _tabsMenu;
    }

    MenuHtml.prototype.getMenuHtml = function() {
      var html, ref, submenu;
      if (((ref = this._tabsMenu) != null ? ref.hasChildren() : void 0) == null) {
        return '';
      }
      html = this._getMenuHtmlPart(this._tabsMenu.getChildren());
      submenu = this._getSubMenuHtmlPart(this._tabsMenu.getChildren());
      html += "<div class=\"submenu-container\">" + submenu + "</div>";
      return html += "<div class=\"color-spacer\" style=\"display: none;\"></div><span class=\"cleaner\"></span>";
    };

    MenuHtml.prototype._getMenuHtmlPart = function(items) {
      var i, id, item, j, len, li, liClass, title, total, ul;
      ul = '<ul class="ifmenu">';
      total = items.length;
      for (i = j = 0, len = items.length; j < len; i = ++j) {
        item = items[i];
        title = item.getTitle();
        id = item.getId();
        if (title) {
          title = " title=\"" + title + "\"";
        }
        liClass = ['li' + i];
        if (i === 0) {
          liClass.push('first');
        }
        if (total === i + 1) {
          liClass.push('last');
        }
        li = "<li id=\"tabitem-" + id + "\" class=\"" + (liClass.join(" ")) + "\">\n	<span><a" + title + " href=\"#" + (item.getUrl()) + "\">" + (item.getName()) + "</a></span>\n</li>";
        ul += li;
      }
      return ul += '</ul>';
    };

    MenuHtml.prototype._getSubMenuHtmlPart = function(items) {
      var item, j, len, ret;
      ret = '';
      for (j = 0, len = items.length; j < len; j++) {
        item = items[j];
        if (!item.hasChildren()) {
          continue;
        }
        ret += "<div id=\"glib-stats-submenu-" + (item.getId()) + "\" class=\"submenu\">\n	" + (this._getMenuHtmlPart(item.getChildren())) + "\n	<div class=\"color-spacer\"></div>\n</div>";
        ret += this._getSubMenuHtmlPart(item.getChildren());
      }
      return ret;
    };

    return MenuHtml;

  })();

  Request = (function() {
    Request.CONTEXT_TABLE_SIGNS = 'stats2_signs';

    Request.CONTEXT_TABLE_CONTENT = 'stats2_content';

    function Request(_config) {
      this._config = _config;
      this._activeRequests = {};
    }

    Request.prototype.getTableSigns = function(cb, errorCb) {
      var callback, tournament, tournamentStage, url;
      tournament = this._config.tournament;
      tournamentStage = this._config.tournamentStage;
      url = this._config.getFeedUrl(this._config.urlTableSigns).replace('%TOURNAMENT%', tournament).replace('%TOURNAMENT_STAGE%', tournamentStage);
      callback = (function(cb, that) {
        return function(status, headers, content, trigger, customHeaders) {
          return typeof cb === "function" ? cb(that._parse(content)) : void 0;
        };
      })(cb, this);
      return this._doRequest(Request.CONTEXT_TABLE_SIGNS, url, callback, errorCb);
    };

    Request.prototype.getTableContent = function(tableTypeUrlPart, cb) {
      var callback, source, tournament, tournamentStage, url;
      tournament = this._config.tournament;
      tournamentStage = this._config.tournamentStage;
      source = this._config.source;
      url = this._config.getFeedUrl(this._config.urlTableContent).replace('%TOURNAMENT%', tournament).replace('%TOURNAMENT_STAGE%', tournamentStage).replace('%TABLE_TYPE%', tableTypeUrlPart).replace('%SOURCE_ID%', source);
      callback = (function(cb) {
        return function(status, headers, content, trigger, customHeaders) {
          return typeof cb === "function" ? cb(content) : void 0;
        };
      })(cb);
      return this._doRequest(Request.CONTEXT_TABLE_CONTENT, url, callback);
    };

    Request.prototype._doRequest = function(context, url, cb, errorCb) {
      var base;
      if (errorCb == null) {
        errorCb = function() {};
      }
      this.abortActiveRequest(context);
      this._activeRequests[context] = this._config.createAjaxFeedObject(url, cb, context);
      this._activeRequests[context].async(true);
      if (typeof (base = this._activeRequests[context]).setErrorCallback === "function") {
        base.setErrorCallback(errorCb);
      }
      return this._activeRequests[context].update(null, null, {});
    };

    Request.prototype._parse = function(str) {
      var data, index, item, j, k, len, len1, parserConfig, ref, ref1, row, rows, value;
      data = {};
      parserConfig = this._config.getParserConfig();
      if (!(str === null || str === '0' || str.length < 4)) {
        rows = str.split(parserConfig.JS_ROW_END);
        for (j = 0, len = rows.length; j < len; j++) {
          row = rows[j];
          ref = row.split(parserConfig.JS_CELL_END);
          for (k = 0, len1 = ref.length; k < len1; k++) {
            item = ref[k];
            if (item !== '') {
              ref1 = item.split(parserConfig.JS_INDEX), index = ref1[0], value = ref1[1];
              if (!value) {
                value = null;
              }
              data[index] = value;
            }
          }
        }
      }
      return data;
    };

    Request.prototype.abortActiveRequest = function(context) {
      if (this._activeRequests[context] == null) {
        return;
      }
      if (this._activeRequests[context].updating != null) {
        this._activeRequests[context].abort();
      }
      return delete this._activeRequests[context];
    };

    Request.prototype.abortAllActiveRequests = function() {
      var context, results;
      results = [];
      for (context in this._activeRequests) {
        results.push(this.abortActiveRequest(context));
      }
      return results;
    };

    return Request;

  })();

  Signs = (function() {
    Signs.TTL = 60000;

    Signs.TTL_LIVE = 5000;

    function Signs(_config, _request, _table) {
      this._config = _config;
      this._request = _request;
      this._table = _table;
      this._enabled = true;
      this._onChangeCallbacks = [];
      this._onChangeFinalCallbacks = [];
    }

    Signs.prototype.getSigns = function(cb) {
      if (this._signs != null) {
        return typeof cb === "function" ? cb(this._signs) : void 0;
      }
      return this._request.getTableSigns((function(cb, that) {
        return function(signs) {
          that._signs = signs;
          that.updateAllowedTab();
          if (that.isEnabled()) {
            that.startUpdater();
          }
          return typeof cb === "function" ? cb(signs) : void 0;
        };
      })(cb, this));
    };

    Signs.prototype.startUpdater = function(updateSignsImmediately) {
      if (updateSignsImmediately == null) {
        updateSignsImmediately = false;
      }
      this._enabled = true;
      return this._startUpdateTimer(updateSignsImmediately);
    };

    Signs.prototype.stopUpdater = function() {
      this._enabled = false;
      return clearTimeout(this._timerId);
    };

    Signs.prototype.isEnabled = function() {
      return this.enabled;
    };

    Signs.prototype.getSignValue = function(sign) {
      return this._getSignValue(sign);
    };

    Signs.prototype.onChangeCallback = function(cb, callerObj, resetPrev) {
      if (callerObj == null) {
        callerObj = this;
      }
      if (resetPrev == null) {
        resetPrev = false;
      }
      if (resetPrev) {
        this._onChangeCallbacks = [];
      }
      return this._onChangeCallbacks.push({
        cb: cb,
        obj: callerObj
      });
    };

    Signs.prototype.onChangeFinalCallback = function(cb, callerObj, resetPrev) {
      if (callerObj == null) {
        callerObj = this;
      }
      if (resetPrev == null) {
        resetPrev = false;
      }
      if (resetPrev) {
        this._onChangeFinalCallbacks = [];
      }
      return this._onChangeFinalCallbacks.push({
        cb: cb,
        obj: callerObj
      });
    };

    Signs.prototype.validateSign = function(sign, value) {
      if (this._getSignValue(sign) === value) {
        return true;
      }
      this._signs[sign] = value;
      return false;
    };

    Signs.prototype.getAllowedTab = function() {
      return this._allowedTab;
    };

    Signs.prototype.updateAllowedTab = function() {
      return this._allowedTab = new AllowedTab(this._config, this._table, this._signs);
    };

    Signs.prototype._hasLiveTable = function() {
      var allowed;
      allowed = this.getAllowedTab();
      if (allowed) {
        return allowed.isAllowed(this._table.getTabId('LIVE_OVERALL'));
      }
      return false;
    };

    Signs.prototype._startUpdateTimer = function(updateSignsImmediately) {
      var base, ref, time, updateSignsCb;
      if (updateSignsImmediately == null) {
        updateSignsImmediately = false;
      }
      if (!this._enabled) {
        return;
      }
      time = this._hasLiveTable() ? Signs.TTL_LIVE * ((ref = typeof (base = this._config).ajaxMultiplierGetter === "function" ? base.ajaxMultiplierGetter() : void 0) != null ? ref : 1) : Signs.TTL;
      clearTimeout(this._timerId);
      updateSignsCb = (function(that) {
        return function() {
          return that._request.getTableSigns((function(that) {
            return function(signs) {
              that._updateSigns.call(that, signs);
              return that._startUpdateTimer.call(that);
            };
          })(that), (function(that) {
            return function() {
              return that._startUpdateTimer.call(that);
            };
          })(that));
        };
      })(this);
      if (updateSignsImmediately) {
        updateSignsCb();
      }
      return this._timerId = setTimeout(updateSignsCb, time);
    };

    Signs.prototype._getSignValue = function(sign) {
      var ref;
      if (((ref = this._signs) != null ? ref[sign] : void 0) == null) {
        return "";
      }
      return this._signs[sign];
    };

    Signs.prototype._updateSigns = function(newSigns) {
      var j, len, prevValue, ref, sign, signChange, signsChange, value, whatChanged;
      if ((newSigns != null ? newSigns.TB : void 0) == null) {
        return;
      }
      whatChanged = {};
      signsChange = [];
      for (sign in newSigns) {
        value = newSigns[sign];
        prevValue = this._getSignValue(sign);
        if (value !== prevValue) {
          signsChange.push([sign, value, prevValue]);
          whatChanged[sign] = 1;
        }
        delete this._signs[sign];
      }
      ref = this._signs;
      for (sign in ref) {
        prevValue = ref[sign];
        signsChange.push([sign, "", prevValue]);
        whatChanged[sign] = 1;
      }
      this._signs = newSigns;
      if (signsChange.length) {
        if (whatChanged['TB'] === 1) {
          this.updateAllowedTab();
        }
        for (j = 0, len = signsChange.length; j < len; j++) {
          signChange = signsChange[j];
          this._runOnChangeCallbacks(signChange[0], signChange[1], signChange[2]);
        }
        return this._runOnChangeFinalCallBacks(whatChanged);
      }
    };

    Signs.prototype._runOnChangeCallbacks = function(sign, newValue, oldValue) {
      var cb, j, len, ref, results;
      ref = this._onChangeCallbacks;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        cb = ref[j];
        results.push(cb.cb.call(cb.obj, sign, newValue, oldValue));
      }
      return results;
    };

    Signs.prototype._runOnChangeFinalCallBacks = function(whatChanged) {
      var cb, j, len, ref, results;
      ref = this._onChangeFinalCallbacks;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        cb = ref[j];
        results.push(cb.cb.call(cb.obj, whatChanged));
      }
      return results;
    };

    return Signs;

  })();

  Stats2 = (function() {
    function Stats2(_config) {
      this._config = _config;
      this._enabled = true;
      this._checkAndPrepareConfig();
      this._request = new Request(this._config);
      this._table = new Table();
      this._events = new Events();
      this._signs = new Signs(this._config, this._request, this._table);
      this._tabs = new Tabs(this);
    }

    Stats2.prototype.init = function() {
      if (this._initialized) {
        return;
      }
      this._initialized = true;
      this.updateHtml();
      return this._events.fire('init');
    };

    Stats2.prototype.updateHtml = function() {
      return this._tabs.updateMenuHtmlFromHash();
    };

    Stats2.prototype.disable = function() {
      this._enabled = false;
      this._signs.stopUpdater();
      this._request.abortAllActiveRequests();
      return this._tabs._tabContent.hidePreload();
    };

    Stats2.prototype.enable = function(selectCurrentItem, updateSignsImmediately) {
      if (selectCurrentItem == null) {
        selectCurrentItem = false;
      }
      if (updateSignsImmediately == null) {
        updateSignsImmediately = false;
      }
      this._enabled = true;
      if (!this._initialized) {
        return;
      }
      this._signs.startUpdater(updateSignsImmediately);
      if (selectCurrentItem) {
        return this._tabs.setCurrentItem();
      }
    };

    Stats2.prototype.isEnabled = function() {
      return this._enabled;
    };

    Stats2.prototype.eventOn = function(name, cb, obj, reset) {
      if (obj == null) {
        obj = this;
      }
      if (reset == null) {
        reset = false;
      }
      return this._events.on(name, cb, obj, reset);
    };

    Stats2.prototype._checkAndPrepareConfig = function() {
      var configKey, j, len, ref, requiredConfigKeys;
      requiredConfigKeys = ['tabsConfig', 'overUnderTypes', 'tournament', 'tournamentStage', 'source', 'getFeedUrl', 'createAjaxFeedObject', 'getParserConfig', 'jQuery', 'menuWrapperElement', 'contentWrapperElement', 'statsWrapperElement', 'urlTableSigns', 'urlTableContent', 'tabItemOnclickCallback'];
      for (j = 0, len = requiredConfigKeys.length; j < len; j++) {
        configKey = requiredConfigKeys[j];
        if (((ref = this._config) != null ? ref[configKey] : void 0) == null) {
          throw new Error("Config key " + configKey + " not found");
        }
      }
      if (this._config.getLocationHash == null) {
        this._config.getLocationHash = (function() {
          return location.hash.replace(/^#/, '');
        });
      }
      if (this._config.setLocationHash == null) {
        this._config.setLocationHash = (function(hash) {
          return location.hash = hash;
        });
      }
      if (!this._config.txtLoading) {
        return this._config.txtLoading = "Loading ..";
      }
    };

    return Stats2;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Stats2 = Stats2;
  } else {
    exports.Stats2 = Stats2;
  }

  TabContent = (function() {
    function TabContent(_config, _request, _signs, _table, _events) {
      this._config = _config;
      this._request = _request;
      this._signs = _signs;
      this._table = _table;
      this._events = _events;
      this._$contentWrapperElement = this._config.jQuery(this._config.contentWrapperElement);
      this._createPreloaderElement();
    }

    TabContent.prototype.updateHtml = function(tabItem, cb) {
      var cb1;
      if (this._isContentOk(tabItem)) {
        this._request.abortActiveRequest(Request.CONTEXT_TABLE_CONTENT);
        this._hidePreload();
        this._signs.startUpdater();
        this._showTab(tabItem);
        return typeof cb === "function" ? cb() : void 0;
      } else {
        cb1 = (function(that, tabItem, cb) {
          return function() {
            that._showTab(tabItem);
            return typeof cb === "function" ? cb() : void 0;
          };
        })(this, tabItem, cb);
        return this._downloadContent(tabItem, cb1);
      }
    };

    TabContent.prototype.hidePreload = function() {
      return this._hidePreload();
    };

    TabContent.prototype._showTab = function(tabItem) {
      var contentId;
      contentId = "box-table-type-" + (this._getSelectorPart(tabItem));
      return this._$contentWrapperElement.find('>div[id^="box-table-type-"]').each((function(that, contentId) {
        return function(i, e) {
          var $e;
          $e = that._config.jQuery(e);
          if (e.id === contentId) {
            $e.show();
            return that._events.fire('boxShow', tabItem, $e);
          } else if (e.id !== contentId && $e.is(":visible")) {
            $e.hide();
            return that._events.fire('boxHide', tabItem, $e);
          }
        };
      })(this, contentId));
    };

    TabContent.prototype._isContentOk = function(tabItem) {
      var contentId, selectorId;
      selectorId = this._getSelectorPart(tabItem);
      contentId = ("box-table-type-" + selectorId).replace(/\./g, '\\.');
      return this._$contentWrapperElement.find(">div#" + contentId).length > 0 && this._getSign(tabItem) === this._getSignFromHtml(tabItem);
    };

    TabContent.prototype._getSelectorPart = function(tabItem) {
      var part, tableTypeId;
      tableTypeId = tabItem.getTableTypeId();
      part = tableTypeId + "";
      if (this._table.isFormTable(tableTypeId) || this._table.isOverUnderTable(tableTypeId)) {
        part += '-' + tabItem.getUrlPart();
      }
      return part;
    };

    TabContent.prototype._getTableTypeUrlPart = function(tabItem) {
      var item, tableTypeId, url, urls;
      tableTypeId = tabItem.getTableTypeId();
      urls = [];
      if (!(this._table.isFormTable(tableTypeId) || this._table.isOverUnderTable(tableTypeId))) {
        urls.push(tabItem.getUrlPart());
      }
      item = tabItem;
      while (item.hasParentItem()) {
        item = item.getParentItem();
        if (item.isRootItem()) {
          break;
        }
        urls.unshift(item.getUrlPart());
      }
      url = urls.join('_');
      if (urls.length === 1) {
        url += "_";
      }
      return url;
    };

    TabContent.prototype._wrapEmptyContent = function($content, tabItem) {
      var contentId, selectorId, signKey, tableTypeId;
      selectorId = this._getSelectorPart(tabItem);
      contentId = "box-table-type-" + selectorId;
      tableTypeId = tabItem.getTableTypeId();
      signKey = this._table.getTabSignById(tableTypeId * 1);
      $content.wrapAll("<div data-hash=\"" + (this._signs.getSignValue(signKey)) + "\" id=\"" + contentId + "\"/>");
      return $content.parent();
    };

    TabContent.prototype._downloadContent = function(tabItem, cb) {
      var callback;
      this._events.fire('beforeBoxDownload', tabItem);
      this._signs.stopUpdater();
      this._showPreload();
      callback = (function(that, cb, tabItem) {
        return function(content) {
          var $content, boxClass;
          boxClass = 'glib-stats-box-' + tabItem.getId();
          $content = that._config.jQuery('<div>').html(content).find('>div');
          if ($content.hasClass('nodata-block')) {
            $content = that._wrapEmptyContent($content, tabItem);
          }
          $content.each((function(that) {
            return function(i, e) {
              var $el, id;
              id = (e.id + "").replace(/\./g, '\\.');
              $el = that._$contentWrapperElement.find("#" + id);
              if ($el.length) {
                that._events.fire('beforeBoxReplace', tabItem, $el);
              }
              $el.remove();
              return that._config.jQuery(e).addClass(boxClass);
            };
          })(that));
          that._$contentWrapperElement.append($content);
          that._hidePreload();
          that._validateSign(tabItem);
          that._signs.startUpdater();
          if (typeof cb === "function") {
            cb();
          }
          return that._events.fire('afterBoxDownload', tabItem, $content);
        };
      })(this, cb, tabItem);
      return this._request.getTableContent(this._getTableTypeUrlPart(tabItem), callback);
    };

    TabContent.prototype._validateSign = function(tabItem) {
      var signKey, tableTypeId;
      tableTypeId = tabItem.getTableTypeId();
      signKey = this._table.getTabSignById(tableTypeId * 1);
      if (!signKey) {
        return;
      }
      return this._signs.validateSign(signKey, this._getSignFromHtml(tabItem));
    };

    TabContent.prototype._getSign = function(tabItem) {
      var signKey, tableTypeId;
      tableTypeId = tabItem.getTableTypeId();
      signKey = this._table.getTabSignById(tableTypeId * 1);
      if (!signKey) {
        return '';
      }
      return this._signs.getSignValue(signKey);
    };

    TabContent.prototype._getSignFromHtml = function(tabItem) {
      var $el, contentId, selectorId;
      selectorId = this._getSelectorPart(tabItem);
      contentId = ("box-table-type-" + selectorId).replace(/\./g, '\\.');
      $el = this._$contentWrapperElement.find(">div#" + contentId);
      if (!$el.length) {
        return '';
      }
      return $el.data('hash');
    };

    TabContent.prototype._createPreloaderElement = function() {
      var html;
      html = "<div class=\"preload\" style=\"display: none;\"><span>" + this._config.txtLoading + "</span></div>";
      return this._$loaderElement = this._config.jQuery(html).appendTo(this._$contentWrapperElement);
    };

    TabContent.prototype._showPreload = function() {
      return this._$loaderElement.show();
    };

    TabContent.prototype._hidePreload = function() {
      return this._$loaderElement.hide();
    };

    return TabContent;

  })();

  TabItem = (function() {
    function TabItem(_tableTypeId, _tabFeedKey, sortKey, name, url, title, _defaultTabSort) {
      this._tableTypeId = _tableTypeId;
      this._tabFeedKey = _tabFeedKey;
      if (title == null) {
        title = '';
      }
      this._defaultTabSort = _defaultTabSort != null ? _defaultTabSort : 0;
      this._data = {
        name: name,
        url: url,
        title: title,
        sortKey: sortKey
      };
      this._children = [];
      this._checked = false;
    }

    TabItem.prototype.getUrl = function() {
      var url;
      url = '';
      if (this.hasParentItem()) {
        url += this.getParentItem().getUrl();
      }
      if (url) {
        url += ";";
      }
      url += this.getUrlPart();
      return url;
    };

    TabItem.prototype.getUrlPart = function() {
      return this._data['url'];
    };

    TabItem.prototype.getId = function() {
      var url;
      url = '';
      if (this.hasParentItem()) {
        url += this.getParentItem().getId();
      }
      if (url) {
        url += "-";
      }
      return url += this._data['url'];
    };

    TabItem.prototype.getTabFeedKey = function() {
      return this._tabFeedKey;
    };

    TabItem.prototype.getIdJqSelector = function() {
      return this.getId().replace(/\./g, '\\.');
    };

    TabItem.prototype.getName = function() {
      return this.getValue('name');
    };

    TabItem.prototype.getTitle = function() {
      return this.getValue('title', '');
    };

    TabItem.prototype.getTableTypeId = function() {
      return this._tableTypeId;
    };

    TabItem.prototype.getSortKey = function() {
      return this.getValue('sortKey', 999);
    };

    TabItem.prototype.getValue = function(key, retValIfKeyNotFound) {
      if (retValIfKeyNotFound == null) {
        retValIfKeyNotFound = null;
      }
      if (this._data[key] != null) {
        return this._data[key];
      } else {
        return retValIfKeyNotFound;
      }
    };

    TabItem.prototype.getDefaultTabSort = function() {
      return this._defaultTabSort;
    };

    TabItem.prototype.getParentItem = function() {
      return this._parentItem;
    };

    TabItem.prototype.setParentItem = function(_parentItem) {
      this._parentItem = _parentItem;
    };

    TabItem.prototype.hasParentItem = function() {
      return this._parentItem != null;
    };

    TabItem.prototype.addChildren = function(children) {
      var child, j, len;
      for (j = 0, len = children.length; j < len; j++) {
        child = children[j];
        this._children.push(child);
        child.setParentItem(this);
      }
      return this._children.sort(function(a, b) {
        var vA, vB;
        vA = a.getSortKey() * 1;
        vB = b.getSortKey() * 1;
        if (vA === vB) {
          return 0;
        }
        if (vA > vB) {
          return 1;
        } else {
          return -1;
        }
      });
    };

    TabItem.prototype.getChildren = function() {
      return this._children;
    };

    TabItem.prototype.hasChildren = function() {
      return this._children.length > 0;
    };

    TabItem.prototype.getContentElement = function() {};

    TabItem.prototype.getContentElementId = function() {};

    TabItem.prototype.setChecked = function(checked, bubble) {
      var checkedItem, item, results;
      if (checked == null) {
        checked = true;
      }
      if (bubble == null) {
        bubble = false;
      }
      this._checked = !!checked;
      if (!bubble) {
        return;
      }
      item = this;
      while (item.hasParentItem()) {
        item = item.getParentItem();
        item.setChecked(checked);
      }
      item = this;
      results = [];
      while (item.hasChildren()) {
        checkedItem = item.getCheckedChild();
        item = checkedItem ? checkedItem : item.getDefaultChild();
        results.push(item.setChecked(checked));
      }
      return results;
    };

    TabItem.prototype.isChecked = function() {
      return this._checked;
    };

    TabItem.prototype.isRootItem = function() {
      return false;
    };

    TabItem.prototype.getSiblings = function() {
      var j, len, ref, sibling, siblings;
      if (!this.hasParentItem()) {
        return [];
      }
      siblings = [];
      ref = this.getParentItem().getChildren();
      for (j = 0, len = ref.length; j < len; j++) {
        sibling = ref[j];
        if (sibling !== this) {
          siblings.push(sibling);
        }
      }
      return siblings;
    };

    TabItem.prototype.getDefaultChild = function() {
      var child, j, len, ref, retChild;
      if (!this.hasChildren()) {
        return false;
      }
      retChild = false;
      ref = this.getChildren();
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        if (retChild === false || child.getDefaultTabSort() > retChild.getDefaultTabSort()) {
          retChild = child;
        }
      }
      return retChild;
    };

    TabItem.prototype.getCheckedChild = function() {
      var child, j, len, ref;
      if (!this.hasChildren()) {
        return false;
      }
      ref = this.getChildren();
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        if (child.isChecked()) {
          return child;
        }
      }
      return false;
    };

    TabItem.prototype.getDeepestChild = function() {
      var checkedItem, item;
      if (this.hasChildren()) {
        checkedItem = this.getCheckedChild();
        item = checkedItem ? checkedItem : this.getDefaultChild();
        return item.getDeepestChild();
      }
      return this;
    };

    TabItem.prototype.getTopParentItem = function() {
      if (this.hasParentItem()) {
        return this.getParentItem().getTopParentItem();
      }
      return this;
    };

    TabItem.prototype.each = function(cb) {
      var child, j, len, ref, ret;
      ret = false;
      if (this.hasChildren()) {
        ref = this.getChildren();
        for (j = 0, len = ref.length; j < len; j++) {
          child = ref[j];
          if (ret) {
            break;
          }
          ret = child.each(cb);
        }
      }
      if (ret) {
        return ret;
      }
      ret = cb(this);
      return ret;
    };

    return TabItem;

  })();

  MainTabItem = (function(superClass) {
    extend(MainTabItem, superClass);

    function MainTabItem() {
      MainTabItem.__super__.constructor.call(this, 0, [null, null], '', '', '', '');
    }

    MainTabItem.prototype.isRootItem = function() {
      return true;
    };

    MainTabItem.prototype.getDeepestChild = function() {
      if (!this.isChecked()) {
        return this;
      }
      return MainTabItem.__super__.getDeepestChild.call(this);
    };

    return MainTabItem;

  })(TabItem);

  Table = (function() {
    Table.tableDefinition = {
      OVERALL: {
        id: 1,
        sign: 'SA'
      },
      HOME: {
        id: 2,
        sign: 'SB'
      },
      AWAY: {
        id: 3,
        sign: 'SC'
      },
      ADVANCED: {
        id: 4,
        sign: 'SD'
      },
      FORM_OVERALL: {
        id: 5,
        sign: 'SE'
      },
      OVERUNDER_OVERALL: {
        id: 6,
        sign: 'SF'
      },
      STREAKS: {
        id: 7,
        sign: 'SG'
      },
      FORM_HOME: {
        id: 8,
        sign: 'SH'
      },
      FORM_AWAY: {
        id: 9,
        sign: 'SI'
      },
      TOP_SCORERS: {
        id: 10,
        sign: 'SJ'
      },
      OVERUNDER_HOME: {
        id: 17,
        sign: 'SK'
      },
      OVERUNDER_AWAY: {
        id: 18,
        sign: 'SL'
      },
      HTFT_OVERALL: {
        id: 13,
        sign: 'SM'
      },
      HTFT_HOME: {
        id: 14,
        sign: 'SN'
      },
      HTFT_AWAY: {
        id: 15,
        sign: 'SO'
      },
      LIVE_OVERALL: {
        id: 16,
        sign: 'ST'
      }
    };

    function Table() {
      var data, key, ref;
      this._tabIdToKey = {};
      this._tabSignToKey = {};
      ref = Table.tableDefinition;
      for (key in ref) {
        data = ref[key];
        this._tabIdToKey[data.id] = key;
        this._tabSignToKey[data.sign] = key;
      }
    }

    Table.prototype.getTabId = function(key) {
      if (Table.tableDefinition[key] == null) {
        return null;
      }
      return Table.tableDefinition[key].id;
    };

    Table.prototype.getTabSign = function(key) {
      if (Table.tableDefinition[key] == null) {
        return null;
      }
      return Table.tableDefinition[key].sign;
    };

    Table.prototype.getTabSignById = function(id) {
      if (this._tabIdToKey[id] == null) {
        return false;
      }
      return this.getTabSign(this._tabIdToKey[id]);
    };

    Table.prototype.isFormTable = function(tableTypeId) {
      var ref;
      return (ref = tableTypeId * 1) === Table.tableDefinition.FORM_OVERALL.id || ref === Table.tableDefinition.FORM_HOME.id || ref === Table.tableDefinition.FORM_AWAY.id;
    };

    Table.prototype.isOverUnderTable = function(tableTypeId) {
      var ref;
      return (ref = tableTypeId * 1) === Table.tableDefinition.OVERUNDER_OVERALL.id || ref === Table.tableDefinition.OVERUNDER_HOME.id || ref === Table.tableDefinition.OVERUNDER_AWAY.id;
    };

    return Table;

  })();

  Tabs = (function() {
    function Tabs(_stats) {
      var ref;
      this._stats = _stats;
      ref = this._stats, this._config = ref._config, this._request = ref._request, this._signs = ref._signs, this._table = ref._table, this._events = ref._events;
      this._tabsMenu = null;
      this._currentUrl = '';
      this._$menuWrapperElement = this._config.jQuery(this._config.menuWrapperElement);
      this._$statsWrapperElement = this._config.jQuery(this._config.statsWrapperElement);
      this._tabContent = new TabContent(this._config, this._request, this._signs, this._table, this._events);
      this._lastHashUrlData = {};
      this._bindDomEvents();
      this._signs.onChangeCallback(this._updated, this, true);
      this._signs.onChangeFinalCallback(this._updatedFinal, this, true);
    }

    Tabs.prototype.selectMenuItem = function(item) {
      var currentTab, oldTab;
      oldTab = this._tabsMenu.getDeepestChild();
      this._tabsMenu.each(function(item) {
        item.setChecked(false);
        return false;
      });
      item.setChecked(true, true);
      currentTab = this._tabsMenu.getDeepestChild();
      this._onTabChangeCallback(currentTab, oldTab);
      return this._config.setLocationHash(this._tabsMenu.getDeepestChild().getUrl());
    };

    Tabs.prototype.selectMenuItemFromId = function(id) {
      var item, searchFunc;
      searchFunc = (function(id) {
        return function(item) {
          if (item.getId() === id) {
            return item;
          }
        };
      })(id);
      item = this._tabsMenu.each(searchFunc);
      if (item === false || (this._tabsMenu && this._tabsMenu.getDeepestChild() === item.getDeepestChild())) {
        return false;
      }
      this.selectMenuItem(item);
      return true;
    };

    Tabs.prototype.selectMenuItemFromHash = function() {
      var currentUrl, item, searchFunc, url;
      url = this._config.getLocationHash();
      if (url === false) {
        return false;
      }
      currentUrl = this._tabsMenu.getDeepestChild().getUrl();
      if (currentUrl === url || this._isUrlInLoop(url)) {
        return false;
      }
      searchFunc = (function(url) {
        return function(item) {
          if (item.getUrl() === url) {
            return item;
          }
        };
      })(url);
      item = this._tabsMenu.each(searchFunc);
      if (!item) {
        this._tabsMenu.each(function(item) {
          item.setChecked(false);
          return false;
        });
        item = this._tabsMenu.getDeepestChild();
      }
      this.selectMenuItem(item);
      return true;
    };

    Tabs.prototype.setCurrentItem = function() {
      if (!this._tabsMenu) {
        return;
      }
      return this.selectMenuItem(this._tabsMenu.getDeepestChild());
    };

    Tabs.prototype.updateMenuHtml = function(cb) {
      var callback;
      if (cb == null) {
        cb = function() {};
      }
      callback = (function(that, cb) {
        return function(tabsMenu) {
          that._$menuWrapperElement.html((new MenuHtml(tabsMenu)).getMenuHtml());
          return cb();
        };
      })(this, cb);
      return this._getTabsMenu(callback);
    };

    Tabs.prototype.updateMenuHtmlFromHash = function() {
      var cb;
      cb = (function(_this) {
        return function() {
          if (!_this.selectMenuItemFromHash()) {
            _this.selectMenuItem(_this._tabsMenu.getDeepestChild());
            return _this._updateMenuSelectedItem();
          }
        };
      })(this);
      return this.updateMenuHtml(cb);
    };

    Tabs.prototype._isUrlInLoop = function(url) {
      var isLoop;
      isLoop = false;
      if (this._lastHashUrlData[url] != null) {
        clearTimeout(this._lastHashUrlData[url]);
        isLoop = true;
      }
      this._lastHashUrlData[url] = setTimeout((function(that, url) {
        return function() {
          return delete that._lastHashUrlData[url];
        };
      })(this, url), 100);
      return isLoop;
    };

    Tabs.prototype._getTabsMenu = function(cb) {
      var callback;
      callback = (function(that, cb) {
        return function(signs) {
          that._tabsMenu = that._buildTabsMenu.call(that, signs);
          return typeof cb === "function" ? cb(that._tabsMenu) : void 0;
        };
      })(this, cb);
      return this._signs.getSigns(callback);
    };

    Tabs.prototype._buildTabsMenu = function(signs) {
      var actualTab, actualTabId, item, searchFunc, tabs, tabsMenu;
      if (this._tabsMenu) {
        actualTab = this._tabsMenu.getDeepestChild();
        actualTabId = actualTab.getId();
      }
      tabsMenu = new MainTabItem();
      if ((signs != null ? signs.TB : void 0) != null) {
        tabs = this._prepareTabsItems(this._getTabsConfig());
        tabsMenu.addChildren(tabs);
      }
      if (actualTabId != null) {
        searchFunc = (function(actualTabId) {
          return function(item) {
            if (item.getId() === actualTabId) {
              return item;
            }
          };
        })(actualTabId);
        item = tabsMenu.each(searchFunc);
        if (item) {
          item.setChecked(true, true);
        }
      }
      return tabsMenu;
    };

    Tabs.prototype._prepareTabsItems = function(items) {
      var addSubItems, allowedTab, item, j, len, ret, subTab, subTabItem, subTabItems, subTabs, tab, tabFeedKey, tableTypeId;
      allowedTab = this._signs.getAllowedTab();
      ret = [];
      for (tableTypeId in items) {
        item = items[tableTypeId];
        tableTypeId = tableTypeId * 1;
        if (!allowedTab.isAllowed(tableTypeId)) {
          continue;
        }
        tabFeedKey = [tableTypeId, null];
        tab = new TabItem(tableTypeId, tabFeedKey, item.sortKey, item.name, item.url, item.title ? item.title : '');
        addSubItems = item.has_sub_items;
        if (item.items != null) {
          subTabs = this._prepareTabsItems(item.items);
          if (subTabs.length > 1 || subTabs.length === 1 && subTabs[0].getTableTypeId() !== tab.getTableTypeId()) {
            tab.addChildren(subTabs);
          } else if (subTabs.length === 1 && subTabs[0].getTableTypeId() === tab.getTableTypeId() && subTabs[0].hasChildren()) {
            tab.addChildren(subTabs[0].getChildren());
          }
        }
        if (addSubItems) {
          subTabs = allowedTab.getSubTabItems(tableTypeId);
          if (subTabs.length) {
            subTabItems = [];
            for (j = 0, len = subTabs.length; j < len; j++) {
              subTabItem = subTabs[j];
              tabFeedKey = [tableTypeId, subTabItem.id];
              subTab = new TabItem(tableTypeId, tabFeedKey, subTabItem.sortKey, subTabItem.name, subTabItem.url, (subTabItem.title ? subTabItem.title : ''), (subTabItem.defaultTabOrder ? subTabItem.defaultTabOrder : 0));
              subTabItems.push(subTab);
            }
            tab.addChildren(subTabItems);
          }
        }
        ret.push(tab);
      }
      return ret;
    };

    Tabs.prototype._bindDomEvents = function() {
      var hashChange;
      this._$statsWrapperElement.off('click').on('click', this._config.menuWrapperElement + " ul li", this._config.menuWrapperElement, (function(_this) {
        return function(e) {
          var base, id;
          e.preventDefault();
          if (typeof (base = _this._config).tabItemOnclickCallback === "function") {
            base.tabItemOnclickCallback(e);
          }
          id = _this._config.jQuery(e.target).closest('li').attr('id');
          id = (id + "").replace(/^tabitem-/, '');
          return _this.selectMenuItemFromId(id);
        };
      })(this));
      hashChange = (function(_this) {
        return function() {
          if (!_this._stats.isEnabled()) {
            return;
          }
          return _this.selectMenuItemFromHash();
        };
      })(this);
      return this._config.jQuery(window).off('hashchange', hashChange).on('hashchange', hashChange);
    };

    Tabs.prototype._onTabChangeCallback = function(currentTab, prevTab) {
      var cb;
      if (currentTab.getId() === prevTab.getId()) {
        return;
      }
      if (prevTab.isRootItem()) {
        this._updateMenuSelectedItem();
        this._tabContent.updateHtml(currentTab);
        return;
      }
      cb = (function(that) {
        return function() {
          if (that._updateMenuHtmlAfterNextTabChange === true) {
            that._updateMenuHtmlAfterNextTabChange = false;
            that._signs.updateAllowedTab(true);
            cb = (function(that) {
              return function() {
                return that._updateMenuSelectedItem();
              };
            })(that);
            return that.updateMenuHtml(cb);
          } else {
            return that._updateMenuSelectedItem();
          }
        };
      })(this);
      return this._tabContent.updateHtml(currentTab, cb);
    };

    Tabs.prototype._updateMenuSelectedItem = function() {
      var cb, item, ref;
      cb = (function(that) {
        return function(item) {
          var $els, itemIdJqSelector;
          itemIdJqSelector = item.getIdJqSelector();
          if (!itemIdJqSelector) {
            return;
          }
          $els = that._$menuWrapperElement.find("#tabitem-" + itemIdJqSelector + ", #glib-stats-submenu-" + itemIdJqSelector);
          if (item.isChecked()) {
            $els.addClass('selected');
          } else {
            $els.removeClass('selected');
          }
        };
      })(this);
      this._tabsMenu.each(cb);
      item = this._tabsMenu.getDeepestChild();
      if ((ref = item.getParentItem()) != null ? ref.isRootItem() : void 0) {
        return this._$menuWrapperElement.find(">div.color-spacer").show();
      } else {
        return this._$menuWrapperElement.find(">div.color-spacer").hide();
      }
    };

    Tabs.prototype._updated = function(key, value, prevValue) {};

    Tabs.prototype._updatedFinal = function(what) {
      var cb, feedKey, tab;
      tab = this._tabsMenu.getDeepestChild();
      feedKey = tab.getTabFeedKey();
      cb = (function(tab, that) {
        return function() {
          that._updateMenuSelectedItem();
          return that._tabContent.updateHtml(tab);
        };
      })(tab, this);
      if ((what != null ? what.TB : void 0) === 1) {
        if (!this._signs.getAllowedTab().isAllowed(feedKey[0], feedKey[1])) {
          this._updateMenuHtmlAfterNextTabChange = true;
          this._signs.getAllowedTab().setAllowed(feedKey[0], feedKey[1]);
          if (feedKey[0] === this._table.getTabId('LIVE_OVERALL')) {
            return this.updateMenuHtml(cb);
          }
        } else {
          return this.updateMenuHtml(cb);
        }
      } else {
        return cb();
      }
    };

    Tabs.prototype._getTabsConfig = function() {
      return this._config.jQuery.extend({}, this._config.tabsConfig, true);
    };

    return Tabs;

  })();

}).call(this);
// Generated by CoffeeScript 1.8.0
(function() {
  var TableSort, TableSortColumn, TableSortSorter;

  window.Stats2TableSort = TableSort = (function() {
    TableSort.SORT_OPTS_INDEX_METHOD = 0;

    TableSort.SORT_OPTS_INDEX_DIRECTION = 1;

    TableSort.SORT_OPTS_INDEX_PRIORITY = 2;

    function TableSort(_jQuery, _$contentWrapper, _sortOpts, _defaultOrderCb) {
      this._jQuery = _jQuery;
      this._$contentWrapper = _$contentWrapper;
      this._sortOpts = _sortOpts;
      this._defaultOrderCb = _defaultOrderCb != null ? _defaultOrderCb : function() {
        return 0;
      };
      this._sortColumns = {};
      this._bindArrowClick();
    }

    TableSort.prototype.init = function($table, resetSorts) {
      var tableId;
      if (resetSorts == null) {
        resetSorts = false;
      }
      tableId = $table.attr('id');
      return $table.find('thead').each((function(that, tableId) {
        return function(_, thead) {
          var $thead, groupId, setDefaultCol, theadIndex, _ref;
          $thead = that._jQuery(thead);
          theadIndex = $thead.index();
          groupId = that._getGroupId(tableId, theadIndex);
          setDefaultCol = resetSorts || (((_ref = that._sortColumns) != null ? _ref[groupId] : void 0) == null);
          $thead.find('td, th').each((function(that, tableId, theadIndex) {
            return function(_, th) {
              return that._addSortColumn(tableId, theadIndex, th, resetSorts);
            };
          })(that, tableId, theadIndex));
          if (setDefaultCol) {
            that._setDefaultSortColumn(groupId);
          }
          return that._sort(groupId);
        };
      })(this, tableId));
    };

    TableSort.prototype._sort = function(groupId) {
      var $oldRows, $rows, $tbody, $thead, activeColIndex, rows, sortColumn;
      sortColumn = this._getActiveSortColumn(groupId);
      if (sortColumn === false) {
        return;
      }
      $thead = this._jQuery(sortColumn.getJqTheadSelector());
      $tbody = $thead.next('tbody');
      activeColIndex = sortColumn.getThIndex();
      $thead.find('tr.main td, tr.main th').each((function(that, activeColIndex, sortColumn) {
        return function(_, th) {
          var $a, $th;
          $th = that._jQuery(th);
          $a = $th.find('>a');
          if ($th.index() === activeColIndex) {
            return $a.attr('class', "gTableSort-" + (sortColumn.getDirection()) + " gTableSort-on");
          } else {
            return $a.attr('class', 'gTableSort-off');
          }
        };
      })(this, activeColIndex, sortColumn));
      $oldRows = $tbody.find('>tr');
      rows = (new TableSortSorter(sortColumn, $oldRows, this._defaultOrderCb)).sort();
      $rows = this._jQuery(rows);
      $rows.find('td.col_sorted').removeClass('col_sorted');
      $rows.find("td:nth-child(" + (activeColIndex + 1) + ")").addClass('col_sorted');
      this._fixRowParity($rows, $tbody.data('visibleRows'));
      $oldRows.remove();
      return $tbody.append($rows);
    };

    TableSort.prototype._addSortColumn = function(tableId, theadIndex, thElement, reinit) {
      var $th, colId, direction, groupId, sortMethod, thIndex, thType, _ref, _ref1;
      if (reinit == null) {
        reinit = false;
      }
      $th = this._jQuery(thElement);
      thIndex = $th.index();
      thType = $th.data('type');
      if (((_ref = this._sortOpts) != null ? _ref[thType] : void 0) == null) {
        return;
      }
      groupId = this._getGroupId(tableId, theadIndex);
      colId = this._getColId(thType, thIndex);
      if (reinit) {
        this._sortColumns[groupId] = {};
      }
      if (((_ref1 = this._sortColumns[groupId]) != null ? _ref1[colId] : void 0) == null) {
        if (this._sortColumns[groupId] == null) {
          this._sortColumns[groupId] = {};
        }
        sortMethod = this._sortOpts[thType][TableSort.SORT_OPTS_INDEX_METHOD];
        direction = this._sortOpts[thType][TableSort.SORT_OPTS_INDEX_DIRECTION];
        this._sortColumns[groupId][colId] = new TableSortColumn(tableId, theadIndex, thType, thIndex, sortMethod, direction);
      }
      if ($th.hasClass('gTableSort-switch')) {
        return;
      }
      return this._wrapHeaderColumnContent($th);
    };

    TableSort.prototype._getActiveSortColumn = function(groupId) {
      var sortColumn, _colId, _ref;
      if (this._sortColumns[groupId] == null) {
        return false;
      }
      _ref = this._sortColumns[groupId];
      for (_colId in _ref) {
        sortColumn = _ref[_colId];
        if (sortColumn.isActive()) {
          return sortColumn;
        }
      }
      return false;
    };

    TableSort.prototype._setDefaultSortColumn = function(groupId) {
      var colId, colIdToSet, priority, priorityMax, sortColumn, type, _ref, _ref1, _ref2;
      if (this._sortColumns[groupId] == null) {
        return;
      }
      colIdToSet = null;
      priorityMax = -9999;
      _ref = this._sortColumns[groupId];
      for (colId in _ref) {
        sortColumn = _ref[colId];
        type = sortColumn.getType();
        priority = ((_ref1 = this._sortOpts) != null ? (_ref2 = _ref1[type]) != null ? _ref2[TableSort.SORT_OPTS_INDEX_PRIORITY] : void 0 : void 0) != null ? this._sortOpts[type][TableSort.SORT_OPTS_INDEX_PRIORITY] : 0;
        if (priorityMax < priority) {
          colIdToSet = colId;
          priorityMax = priority;
        }
      }
      if (colIdToSet != null) {
        return this._setSortColumn(groupId, colIdToSet);
      }
    };

    TableSort.prototype._setSortColumn = function(groupId, colId, switchDirectionIfIsActive) {
      var activeSortColumn, sortColumn, _colId, _ref, _results;
      if (switchDirectionIfIsActive == null) {
        switchDirectionIfIsActive = false;
      }
      if (this._sortColumns[groupId] == null) {
        return;
      }
      if (switchDirectionIfIsActive) {
        activeSortColumn = this._getActiveSortColumn(groupId);
      }
      _ref = this._sortColumns[groupId];
      _results = [];
      for (_colId in _ref) {
        sortColumn = _ref[_colId];
        if (_colId === colId) {
          sortColumn.setActive(true);
          if ((activeSortColumn != null) && activeSortColumn === sortColumn) {
            _results.push(sortColumn.switchDirection());
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(sortColumn.setActive(false));
        }
      }
      return _results;
    };

    TableSort.prototype._wrapHeaderColumnContent = function($th) {
      return $th.wrapInner('<span class="txt" />').append('<span class="arrow" />').wrapInner('<a href=# class="gTableSort-off" />').addClass('gTableSort-switch');
    };

    TableSort.prototype._addSortArrows = function() {
      return this._$tablesWrapper.each('table.stats-table');
    };

    TableSort.prototype._getGroupId = function(tableId, theadIndex) {
      return "" + tableId + "-" + theadIndex;
    };

    TableSort.prototype._getColId = function(thType, thIndex) {
      return "" + thType + "-" + thIndex;
    };

    TableSort.prototype._bindArrowClick = function() {
      return this._$contentWrapper.on('click', 'thead tr.main th,thead tr.main td a', (function(_this) {
        return function(e) {
          var $th, colId, groupId, tableId, thIndex, thType, theadIndex;
          $th = _this._jQuery(e.target).closest('th, td');
          tableId = $th.closest('table').attr('id');
          theadIndex = $th.closest('thead').index();
          thType = $th.data('type');
          if (thType == null) {
            return;
          }
          thIndex = $th.index();
          groupId = _this._getGroupId(tableId, theadIndex);
          colId = _this._getColId(thType, thIndex);
          _this._setSortColumn(groupId, colId, true);
          _this._sort(groupId);
          e.preventDefault();
          return e.stopPropagation();
        };
      })(this));
    };

    TableSort.prototype._fixRowParity = function($rows, visibleRows) {
      var $filteredOut, numHidden, numToShow;
      if (visibleRows == null) {
        visibleRows = 0;
      }
      $filteredOut = $rows.filter('.filtered-out');
      numHidden = $rows.filter('.hidden').not($filteredOut).length;
      numToShow = visibleRows || $rows.length - numHidden;
      $rows.slice(numToShow).addClass('hidden');
      return $rows.not($filteredOut).slice(0, numToShow).removeClass('hidden').each((function(_this) {
        return function(i, el) {
          return _this._jQuery(el).toggleClass('odd', i % 2 === 0).toggleClass('even', i % 2 === 1);
        };
      })(this));
    };

    return TableSort;

  })();

  TableSortColumn = (function() {
    function TableSortColumn(_tableId, _theadIndex, _thType, _thIndex, _sortMethod, _direction) {
      this._tableId = _tableId;
      this._theadIndex = _theadIndex;
      this._thType = _thType;
      this._thIndex = _thIndex;
      this._sortMethod = _sortMethod != null ? _sortMethod : 'number';
      this._direction = _direction != null ? _direction : TableSortSorter.SORT_DIRECTION_ASC;
      this._defaultDirection = this._direction;
      this._isActive = false;
    }

    TableSortColumn.prototype.isActive = function() {
      return this._isActive;
    };

    TableSortColumn.prototype.setActive = function(_isActive) {
      this._isActive = _isActive != null ? _isActive : true;
    };

    TableSortColumn.prototype.switchDirection = function() {
      return this._direction = this._direction === TableSortSorter.SORT_DIRECTION_ASC ? TableSortSorter.SORT_DIRECTION_DESC : TableSortSorter.SORT_DIRECTION_ASC;
    };

    TableSortColumn.prototype.getDirection = function() {
      return this._direction;
    };

    TableSortColumn.prototype.getType = function() {
      return this._thType;
    };

    TableSortColumn.prototype.getThIndex = function() {
      return this._thIndex;
    };

    TableSortColumn.prototype.getJqTheadSelector = function() {
      return ("#" + this._tableId + " thead:nth-child(" + (this._theadIndex + 1) + ")").replace(/\./g, '\\.');
    };

    TableSortColumn.prototype.getSortMethod = function() {
      return this._sortMethod;
    };

    TableSortColumn.prototype.getDefaultDirection = function() {
      return this._defaultDirection;
    };

    return TableSortColumn;

  })();

  TableSortSorter = (function() {
    TableSortSorter.SORT_DIRECTION_ASC = 'asc';

    TableSortSorter.SORT_DIRECTION_DESC = 'desc';

    function TableSortSorter(_sortColumn, _$rows, _defaultSortOrderCb) {
      this._sortColumn = _sortColumn;
      this._$rows = _$rows;
      this._defaultSortOrderCb = _defaultSortOrderCb;
    }

    TableSortSorter.SORTERS = {
      number: function(a, b) {
        if (this.getDirection() === TableSortSorter.SORT_DIRECTION_ASC) {
          return a - b;
        } else {
          return b - a;
        }
      },
      string: function(a, b) {
        var num;
        if (a === b) {
          return 0;
        }
        num = a.localeCompare(b);
        if (this.getDirection() === TableSortSorter.SORT_DIRECTION_ASC) {
          return num;
        } else {
          return -num;
        }
      },
      resultSum: function(a, b) {
        if (this.getDirection() === TableSortSorter.SORT_DIRECTION_ASC) {
          return a - b;
        } else {
          return b - a;
        }
      }
    };

    TableSortSorter.MAPPERS = {
      number: function(row, cellIndex) {
        var cell, value;
        cell = row.childNodes[cellIndex] || {
          textContent: 0
        };
        value = (cell.textContent || cell.innerText) * 1;
        if (isNaN(value)) {
          return 0;
        } else {
          return value;
        }
      },
      string: function(row, cellIndex) {
        var cell, value;
        cell = row.childNodes[cellIndex] || {
          textContent: ''
        };
        value = cell.textContent || cell.innerText;
        return value.trim().toLowerCase();
      },
      resultSum: function(row, cellIndex) {
        var cell, value;
        cell = row.childNodes[cellIndex] || {
          textContent: '0:0'
        };
        value = (cell.textContent || cell.innerText).split(':');
        if (value.length === 2) {
          value = parseInt(value[0]) - parseInt(value[1]);
        } else {
          value = parseInt(value[0]);
        }
        if (isNaN(value)) {
          value = 0;
        }
        return value;
      }
    };

    TableSortSorter.prototype.sort = function() {
      var cellIndex, m, map, newRows, type, _i, _len;
      type = this._sortColumn.getSortMethod();
      cellIndex = this._sortColumn.getThIndex();
      if (!((TableSortSorter.MAPPERS[type] != null) && (TableSortSorter.SORTERS[type] != null))) {
        return;
      }
      newRows = [];
      map = [];
      this._$rows.each((function(_this) {
        return function(i, e) {
          return map.push([i, TableSortSorter.MAPPERS[type](e, cellIndex)]);
        };
      })(this));
      map.sort((function(_this) {
        return function(a, b) {
          var ret;
          ret = TableSortSorter.SORTERS[type].call(_this._sortColumn, a[1], b[1]);
          if (!ret && (_this._defaultSortOrderCb != null)) {
            ret = _this._defaultSortOrderCb.call(_this._sortColumn, _this._$rows[a[0]], _this._$rows[b[0]]);
          }
          return ret;
        };
      })(this));
      for (_i = 0, _len = map.length; _i < _len; _i++) {
        m = map[_i];
        newRows.push(this._$rows[m[0]]);
      }
      return newRows;
    };

    return TableSortSorter;

  })();

}).call(this);
var initStats2 = function(urlSubPart){
	if (urlSubPart == null) urlSubPart = "";

	var getEventFromFormJqElement = function($el){
		var r = /glib-event-([a-zA-Z0-9]{8})/.exec($el.attr('class') + '');
		if (r == null)
		{
			return;
		}

		return r[1];
	};

	var getParticipantsFromFormJqElement = function($el){
		var r = /glib-participants-([-a-zA-Z0-9]*)/.exec($el.attr('class') + '');
		if (r == null)
		{
			return;
		}
		return (r[1] + "").split('-');
	};

	var cb = function() {

		stats2Sort = new Stats2TableSort(
			$, $('#glib-stats-data'),
			{
				"assists":["number", "desc"],
				"assists1":["number", "desc"],
				"assists2":["number", "desc"],
				"avg_goals_match":["number", "desc"],
				"rank":["number", "asc", 1000],
				"player_name":["string", "asc"],
				"team_name":["string", "asc"],
				"participant_name":["string", "asc"],
				"matches":["number", "desc"],
				"wins":["number", "desc"],
				"wins_ot":["number", "desc"],
				"wins_regular":["number", "desc"],
				"draws":["number", "desc"],
                "count_0_point":["number", "desc"],
                "count_1_point":["number", "desc"],
                "count_2_point":["number", "desc"],
                "count_3_point":["number", "desc"],
                "goals_for_against_diff": ["number", "desc"],
                "goals_for_per_event": ["number", "desc"],
				"losses":["number", "asc"],
				"losses_ot":["number", "asc"],
				"losses_regular":["number", "asc"],
				"points":["number", "desc"],
				"goals":["resultSum", "desc"],
				"ponumbers":["int", "desc"],
				"over":["number", "desc"],
				"under":["number", "desc"],
				"winning_percentage":["number", "desc"],
				"for_against_percentage":["number", "desc"],
				"htft_ww":["number", "desc"],
				"htft_wd":["number", "desc"],
				"htft_wl":["number", "desc"],
				"htft_dw":["number", "desc"],
				"htft_dd":["number", "desc"],
				"htft_dl":["number", "desc"],
				"htft_lw":["number", "desc"],
				"htft_ld":["number", "desc"],
				"htft_ll":["number", "desc"],
				"wins_pen":["number", "desc"],
				"losses_pen":["number", "desc"],
				"net_rr": ["number", "desc"],
				"no_result": ["number", "desc"]
			},
			function(rowA, rowB) {
				var a = rowA.getAttribute('data-def-order');
				var b = rowB.getAttribute('data-def-order');
				if (a && b)
				{
					a = +a;
					b = +b;

					if (isNaN(a))
					{
						a = 0;
					}

					if (isNaN(b))
					{
						b = 0;
					}

					var type = this.getType();
					var revertDefaultDirection = type === 'points' || type === 'goals' || type === 'assists';
					var isAsc = this.getDirection() == 'asc'
						? (revertDefaultDirection ? false : true)
						: (revertDefaultDirection ? true : false);
					return isAsc ? (a-b) : (b-a);
				}
				return 0;
			}
		);

		var seasonsDropDownListWrap = $('#detail-header .seasons-picker:eq(0)');
		if ($(seasonsDropDownListWrap).length == 1)
		{
			var seasonsDropDownList = new cjs.DropDownList($, seasonsDropDownListWrap, function(item){
				window.location = $(item).find('a').attr('href');
			});
			seasonsDropDownList.init();
		}

		var usFormat = cjs.dic.get('utilConfig').get('app', 'US_time_format');
		var datetimeFormatTables = usFormat ? 'M d, Y' : 'd.m.Y';
		var datetimeFormatDraws = usFormat ? 'M d' : 'd/m';

		var setup_table_playoff = function(tableContext)
		{
			if (tableContext.find('#playoff-env').length > 0)
			{
				StatsDrawView.init(cjs.Util.Config.get("app","detail","version"));

				var button = $('.playoff-scroll-button');
				var buttonHeight = button.height();
				var playoffEnv = $('#playoff-env').get(0);
				var d = ($('#playoff-links').height() + $('#playoff-header').height()) - (parseInt(button.css('margin-top')) + button.height() / 2) + 8;

				if (typeof playoffEnv.getBoundingClientRect == 'function')
				{
					$(window).scroll(function()
					{
						var x = playoffEnv.getBoundingClientRect();
						var windowHeight = $(window).height();
						var xHeight = windowHeight;

						if (x.top > 0)
						{
							xHeight -= x.top;
						}

						if (windowHeight - x.bottom > 0 )
						{
							xHeight -= windowHeight - x.bottom;
						}

						if (xHeight < buttonHeight)
						{
							button.addClass('hidden');
						}
						else
						{
							button.removeClass('hidden');
						}

						var top = Math.floor((x.top < 0 ? -1 * x.top : 0) + xHeight / 2 + d) + 'px';
						button.css('top', top);
					});
				}
			}
		};

		var setup_timedata = function(context, format)
		{
			context.each(function() {
				var startDateTime = $(this).html();

				if (startDateTime && startDateTime !== '' && $.isNumeric(startDateTime))
				{
					var startDateTimeStr = cjs.Util.Date.timestamp2date(format, startDateTime, get_gmt_offset());
					$(this).html(startDateTimeStr);
				}
			});
		};

		var tabItemTrackingCallback = function(event)
		{
			var GAeventTracking = cjs.dic.get('util_config').get('app', 'google_analytics', 'event_tracking');
			if (GAeventTracking) {
				var tabId, eventNameSuffix, eventNameSuffixes, i, item, len;
				tabId = $(event.target).closest('li').attr('id');
				eventNameSuffix = (tabId + "").replace(/^tabitem-/, '');
				eventNameSuffixes = eventNameSuffix.split("-");

				for (i = 0, len = eventNameSuffixes.length; i < len; i++) {
					item = eventNameSuffixes[i];
					eventNameSuffixes[i] = item.replace('_', '-');
				}

				eventNameSuffix = eventNameSuffixes.join("_");
				e_t.track_click('detail-bookmark-click', 'stats-detail_' + eventNameSuffix);
			}

			return true;
		};

		var query = [];
		if (typeof participantEncodedIds != 'undefined' && participantEncodedIds.length != 0)
		{
			query.push('hp1=' + participantEncodedIds[0]);
			query.push('hp2=' + participantEncodedIds[1]);
		}

		if (typeof cjs.eventId != 'undefined' && cjs.eventId)
		{
			query.push('e=' + cjs.eventId);
		}

		var utilEnv = cjs.dic.get('utilEnviroment');
		var config = {
			tabsConfig: stats2Config.statsTabsConfig,
			overUnderTypes: stats2Config.statsOverUnderTypes,
			tournament: stats2Config.tournament,
			tournamentStage: stats2Config.tournamentStage,
			getFeedUrl: utilEnv.getFeedUrl,
			createAjaxFeedObject: utilEnv.createAjaxFeedObject,
			getParserConfig: utilEnv.getParserConfig,
			jQuery: $,
			menuWrapperElement: "#glib-stats-menu",
			contentWrapperElement: "#glib-stats-data",
			statsWrapperElement: "#glib-stats",
			source: project_type_id,
			txtLoading: cjs.dic.get('utilTrans')('TRANS_LOADING'),
			urlTableSigns: 'tx_%TOURNAMENT%_%TOURNAMENT_STAGE%',
			urlTableContent: 'ss_%SOURCE_ID%_%TOURNAMENT%_%TOURNAMENT_STAGE%_%TABLE_TYPE%' + (query.length ? "?" + query.join('&'): ""),
			tabItemOnclickCallback: tabItemTrackingCallback,
			ajaxMultiplierGetter: function() { return cjs.dic.get('Helper_AjaxSyncTime').getMultiplier(); }
		};


		if (typeof tournamentPage !== 'undefined' && tournamentPage)
		{
			config.getLocationHash = function(){return false;};
			config.setLocationHash = function(hash){};
		}
		else if (urlSubPart)
		{
			config.getLocationHash = function()
			{
				var url = location.hash.replace(/^#/, '').split(';');
				if (url[0] !== urlSubPart)
				{
					return false;
				}
				url.shift();
				return url.join(';');
			};
			config.setLocationHash = function(hash)
			{
				location.hash = urlSubPart + ";" + hash;
			};
		}

		stats2 = new Stats2(config);

		var tabFilters = {};
		var tabRowsVisibled = {};

		stats2.eventOn('beforeBoxReplace', function(item, $oldElement)
		{
			var id = $oldElement.attr('id');
			if (typeof tabFilters[id] !== 'undefined')
			{
				tabRowsVisibled[id] = tabFilters[id].getRowsVisibled();
			}
		});

		stats2.eventOn('afterBoxDownload', function(item, $elements){
			$elements.each(function(i, e){
				if (/^box-table-type/.test(e.id))
				{
					var $e = $(e);
					var item = {box: $e};
					var selectedFilter;
					if ($e.find('.glib-stats-filter').length != 0)
					{

						if (typeof tabFilters[e.id] !== 'undefined')
						{
							selectedFilter = tabFilters[e.id].getSelectedFilter();
						}
						tabFilters[e.id] = new TabFilter(item, selectedFilter, tabRowsVisibled[e.id]);
					}

					stats2Sort.init($e.find('table.stats-table'));
				}
			});

			var selector = [
			'a.form-bg',
			'a.form-bg-last'
			];

			$elements.find(selector.join(",")).each(function(i, el) {
				var item = $(el);
				var title = item.attr('title');
				var data = typeof title == 'undefined' ? '':title.split("\n");
				var dataMax = data.length - 1;

				if (dataMax >= 1 && data[dataMax] !== '')
				{
					var startDateTimeStr = cjs.Util.Date.timestamp2date(datetimeFormatTables, data[dataMax], get_gmt_offset());

					var dataTmp = data[0] + "\n";

					if (dataMax == 2)
					{
						dataTmp += data[1] + "\n";
					}

					item.attr('title', dataTmp + startDateTimeStr);
				}
			});

			setup_timedata($('td.pdate', $elements), datetimeFormatTables);
			setup_timedata($('.match .matches .date', $elements), datetimeFormatDraws);
		});

		stats2.eventOn('init', function(){
			var tableContext = $('#glib-stats');
			var tt = new tooltip(tableContext.attr('id'));
			var tt_selector = [
				'.stats-table tbody td:first-child',
				'.stats-table tbody td span.dw-icon',
				'.form div a',
				'.last_5 div a',
				'.link-inactive',
				'.playoff-box',
				'.playoff-box-hover',
				'.playoff-box-invert',
				'.glib-live-score',
				'.glib-live-rank-up',
				'.glib-live-rank-down',
				'.glib-live-value'
			];

			tableContext.delegate(tt_selector.join(', '), "mouseenter", function (e) {
				tt.show($(this).get(0), e);
			});

			tableContext.delegate(tt_selector.join(', '), "mouseleave", function (e) {
				tt.hide($(this).get(0), e);
			});

			tableContext.delegate('.form div a, .last_5 div a, a.glib-live-score', 'mouseenter', function(e){
				var participants = getParticipantsFromFormJqElement($(e.target));
				if (!participants)
				{
					return;
				}

				var selector = $.map(participants, function(e){return 'tr.glib-participant-' + e;}).join(', ');

				tableContext.find(selector).addClass('highlight_hover');
			});

			tableContext.delegate('.form div a, .last_5 div a, a.glib-live-score', 'mouseleave', function(e){
				var participants = getParticipantsFromFormJqElement($(e.target));
				if (!participants)
				{
					return;
				}
				var selector = $.map(participants, function(e){return 'tr.glib-participant-' + e;}).join(', ');
				tableContext.find(selector).removeClass('highlight_hover');
			});

			// Detail opening
			tableContext.on('click', '.form div a, .last_5 div a, a.glib-live-score', function(e){
				var el = $(e.target);
				var event = getEventFromFormJqElement(el);

				if (event)
				{
					e.preventDefault();
					if (cjs.Util.Config.get("app","detail","version") == 2)
					{
						var re = / glib-partnames-([^ ]+) /
						var partnames = re.exec(' ' + el.attr('class') + ' ');
						if (partnames && typeof partnames[1] != 'undefined')
						{
							partnames = partnames[1].split(';');
							detail_open('g_0_' + event, null, partnames[0], typeof partnames[1] != 'undefined' ? partnames[1] : null, $('#season_url').text(), false);
						}
					}
					else
					{
						detail_open('g_0_' + event, null, null, null, null, false);
					}
				}
			});
		});

		stats2.eventOn('afterBoxDownload', function()
		{
			if (cjs.dic.get('util_enviroment').isTournamentPage())
			{
				var updateSwitcher = function() {
					var isVisible = cjs.dic.get('util_element').isVisibleOnScreen($('#glib-stats-data'));
					if (isVisible && !stats2.isEnabled())
					{
						stats2.enable(false, true);
					}
					else if (!isVisible && stats2.isEnabled())
					{
						stats2.disable();
					}
				};

				setTimeout(updateSwitcher, 500);
				$(window).on('resize scroll', updateSwitcher);
			}
		});

		stats2.eventOn('afterBoxDownload', function(tabItem, $box){
			if (tabItem.getTableTypeId() == -1)
			{
				setup_table_playoff($box);
			}
		});

		stats2.eventOn('boxShow', function(tabItem, $box){
			StatsTableWidthChecker_CheckItemWidth($box);
		});

		stats2.eventOn('boxShow', function(tabItem, $box){
			if (tabItem.getTableTypeId() == -1)
			{
				StatsDrawView.init(cjs.Util.Config.get("app","detail","version"));
				StatsDrawView.update_size();
			}
		});

		stats2.eventOn('afterBoxDownload', function(tabItem, tableContext){
			if (typeof participantEncodedIds == 'undefined' || participantEncodedIds.length == 0)
			{
				return;
			}

			var tableHighlightParticipants = function()
			{
				for (var par_number = 0, _len = participantEncodedIds.length; par_number < _len; par_number++)
				{
					tableContext.find('tr.glib-participant-' + participantEncodedIds[par_number]).addClass('highlight');
					tableContext.find('tr.glib-team-' + participantEncodedIds[par_number]).addClass('highlight');
				}
			};

			var drawHighlightParticipants = function()
			{
				for (var par_number = 0, _len = participantEncodedIds.length; par_number < _len; par_number++)
				{
					tableContext.find('span.glib-participant-' + participantEncodedIds[par_number]).parent().addClass('highlight');
				}
			};

			var detcon = $('#detcon');

			if (detcon.length)
			{
				tableHighlightParticipants();
			}

			var playoff = $('#playoff-env');
			if (playoff.length)
			{
				drawHighlightParticipants();
			}

			if ($('#sportstats').length)
			{
				tableHighlightParticipants();
			}

		});

		stats2.eventOn('afterBoxDownload', function(tabItem, tableContext)
		{
			if (typeof participantEncodedIds == 'undefined' || participantEncodedIds.length == 0)
			{
				return;
			}

			var els = [];
			for (var par_number = 0, _len = participantEncodedIds.length; par_number < _len; par_number++)
			{
				var el = tableContext.find('span.glib-participant-'+participantEncodedIds[par_number]).parent();

				for (var j = 0; j < el.length; j++)
				{
					var i = $(el[j]).attr('id') + ' ' + $(el[j]).attr('class');

					if (par_number == 0)
					{
						els[i] = $(el[j]);
					}
					else
					{
						if (typeof els[i] != 'undefined')
						{
							var top = (els[i].offset().top - $('div.viewport').offset().top - $('.playoff .mid').height());
							if ($('div.overview').height() < $('div.viewport').height())
							{
								top = 0;
							}
							else if ($('div.viewport').height() > $('div.overview').height() - top)
							{
								top = $('div.overview').height() - $('div.viewport').height() + parseInt($('div.overview').css('padding-top')) + parseInt($('div.overview').css('padding-bottom'));
							}

							$('div.overview').css('top', -1 * top);
							StatsDrawView.el.env.tinyscrollbar_update('overview-y');
							break;
						}
					}
				}
			}
		});

		stats2.init();
	};

	cjs.dic.get('DicProxy').onReady(cb);
};

var getUrlByWinType = function(href)
{
	if (typeof cjs.isFullPage == 'undefined' || cjs.isFullPage == false)
	{
		window.open(href, '_blank');
	}
	else
	{
		window.open(href, '_self');
	}
};
