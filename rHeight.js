/*
	Description:
		jQuery plugin that uses min-height to force DOM elements to the height of the viewport. 
		Basically a CSS style="height:100%" analogue to style="width:100%".
		Allows for:
			- min-width thresholds (functionality doesn't engage until cpecified min-width is reached in viewport), 
			- min-heights and max-heights on elements using either pixels or width:height ratios,
		 	- offsets that subtract either a set pixels amount or the combined height of specified DOM elements from total height,
			- extention of set height to all specified child-nodes.
		Note: Currently requires CSS box-model "box-sizing:border-box" on all elements to work.
	To-do:
		1. Allow sizable child-nodes to also have their own independant offset,
		2. Calculate heights with default CSS box-model (height + margin + border),
		3. Allow child nodes that are centered in their parent using "data-rheight-child-centered.
*/
(function( $ ){

	var pluginName = 'nya_rHeight',
		selectors = {
			// set "true" if you want this to run
			root:			'data-rheight',
			// set a minimum-width (int) of the viewport before this feature will engage (eg. 320 for iPhone portrait)
			threshold:		'data-rheight-threshold',
			// set a min-height in either an int, or in a ratio (eg. '1:1' for square, '16:9' for photos)
			minHeight:		'data-rheight-minheight',
			// set a max-height in either an int, or in a ratio (eg. '1:1' for square, '16:9' for photos)
			maxHeight:		'data-rheight-maxheight',
			// allows you to subtract either an int from the calculated height, or the combined heights of any selectors you pass in
			offset:			'data-rheight-offset',
			// any child-nodes that get this attr will get the same height passed down
			child:			'data-rheight-child',
			// same as offset above, but does it on the child nodes. Note that it subtracts from the parent height, not the page height
			childOffset:	'data-rheight-child-offset'
		};

		// Objects to work on
		root = false,
		viewport = {
			width: 0,
			height: 0
		},

		// METHODS
		methods = {
			init: function() {
				//console.log("$.fn['"+ pluginName +"'].methods.init()");

				// bail if there are no images to work with
				if ( root.length < 1 ) return;
				//console.log(root);

				// set fixed-height on page load
				window.setTimeout( function() {
						methods.handleResize();
					}, 10
				);

				// eventListener on any page-resize
                $( window ).on( 'orientationchange', $.proxy( this, 'handleResize' ) );
                $( window ).on( 'resize', $.proxy( this, 'handleResize' ) );
			},

			handleResize: function() {
				//console.log("$.fn['"+ pluginName +"'].methods.handleResize()");

				// get viewport dimensions
				methods.setViewport();
			
				// resize
				root.each(function() {
					var $this = $( this );

					// get threshold, if it doesn't make it, don't do this
					if ( viewport.width < $this.attr( selectors.threshold ) ) {
						methods.disable( $this );
						return;
					};

					// otherwise, resize
					methods.resizeModule( $this );
				});
			},

			// not using, reset styles
			disable: function ( $mod ) {
				//console.log(" - $.fn['"+ pluginName +"'].methods.reset()");

				$mod.attr( 'style', '' );
				var $children = $mod.find( '['+ selectors.child +']' );
				$children.each( function() {
                    $(this).attr( 'style', '' );
                });
			},

			// using, set styles
			resizeModule: function ( $mod ) {
				//console.log(" - $.fn['"+ pluginName +"'].methods.handleModule()");

				// get threshold, if it doesn't make it, don't do this
				if ( viewport.width < $mod.attr( selectors.minHeight ) ) {
					methods.disable( $mod );
					return;
				};

				// figure out offset
				var offset = methods._getOffset( $mod );

				// define height
				var newHeight = viewport.height - offset;
				
				// respect min-height
				if ( $mod.attr( selectors.minHeight ) && newHeight < methods._getHeight( $mod.attr( selectors.minHeight ), viewport.width ) )
					newHeight = methods._getHeight( $mod.attr( selectors.minHeight ), viewport.width );

				// respect max-height
				if ( $mod.attr( selectors.maxHeight ) && newHeight > methods._getHeight( $mod.attr( selectors.maxHeight ), viewport.width ) )
					newHeight = methods._getHeight( $mod.attr( selectors.maxHeight ), viewport.width );

				$mod.attr( 'style', 'min-height:'+ newHeight +'px;' );

				// look for inner nodes to resize as well
				var $children = $mod.find( '['+ selectors.child +']' );
				$children.each( function() {
					methods.resizeChild( $(this), newHeight );
				});
			},

			resizeChild: function( $child, parentHeight ) {
				//console.log("   - $.fn['"+ pluginName +"'].methods.handleChild()");

				// resize
				var newHeight = parentHeight;
				$child.attr( 'style', 'min-height:'+ newHeight +'px;' );
			},

			setViewport: function() {
				//console.log("$.fn['"+ pluginName +"'].methods.setViewport()");

				viewport.width = $( document.body ).width();
				viewport.height = $( window ).height();
			},

			// returns a pixel height value where a pixel or ratio is sent in
			_getHeight: function( height, width ) {
				//console.log("   - $.fn['"+ pluginName +"'].methods._getHeight("+ height +", "+ width +")");

				if ( height.indexOf(':') < 0 ) {
					// if absulute value, simply return
					return parseInt(height);
				} else {
					// otherwise, we have a ratio, so calculate height from that
					var tmp = height.split(':');
					return parseInt(width) * parseInt(tmp[1]) / parseInt(tmp[0]);
				};
			},

			_getOffset: function( $mod ) {
				//console.log("   - $.fn['"+ pluginName +"'].methods._getOffset()");
				
				// just return 0 if not set
				if ( !$mod.attr( selectors.offset ) || $mod.attr( selectors.offset )=="0")
					return 0;

				// or return offset if its an int
				if ( $mod.attr( selectors.offset ) == parseInt($mod.attr( selectors.offset )) )
					return $mod.attr( selectors.offset );

				// else return element height
				var $node = $( $mod.attr( selectors.offset ) );
				if ( $node.length > 0 )  {
					var height = 0;
					$node.each( function() {
						height += $(this).outerHeight();
					});
					return height;
				} else {
					return 0;
				};
			},

			EOF: null
		};

	$.fn[pluginName] = function () {
		root = this;
		methods.init();
	};

	$( function() {
		$( '['+ selectors.root + ']' )[ pluginName ]();
	} );
})(jQuery);


