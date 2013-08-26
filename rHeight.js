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
		2. Allow sibling-nodes to get these values (ie, not necessarily child-nodes of the root rHeight element)
		3. Calculate heights with default CSS box-model (height + margin + border),
		4. Allow child nodes that are centered in their parent using "data-rheight-child-centered.
*/
(function( $ ){

	var pluginName = 'nya_rHeight',
		selectors = {
			// set a minimum-width (int) of the viewport before this feature will engage (eg. 320 for iPhone portrait)
			thresholdWidth:	'data-rheight-threshold-width',
			thresholdHeight:'data-rheight-threshold-height',
			// set a min-height in either an int, or in a ratio (eg. '1:1' for square, '16:9' for photos)
			minHeight:		'data-rheight-minheight',
			// set a max-height in either an int, or in a ratio (eg. '1:1' for square, '16:9' for photos)
			maxHeight:		'data-rheight-maxheight',

            // set to "true" for this all to work
            root:           'data-rheight',
            // tell the system what CSS attr we want to change on the root-node
            rootAttr:       'data-rheight-attr',
			// allows you to subtract either an int from the calculated height, or the combined heights of any selectors you pass in
			rootOffset:     'data-rheight-offset',

			// set any child-nodes that get this to "true" and they'll get the same value passed down from root
			child:			'data-rheight-child',
			// attr we want to change on the child-node
            childAttr:      'data-rheight-child-attr',
			// same as offset above, but does it on the child nodes. Note that it subtracts from the parent height, not the page height
			childOffset:	'data-rheight-child-offset',

			// set any sibling-nodes that get this and they will get the same css value passed over from root (use root-node selector here, so we tie it to the parent properly)
			//sibling:		'data-rheight-sibling',
			// attr we want to change on the sibling-node
			//siblingAttr:	'data-rheight-sibling-attr',
			// same as other offsets, but applies to siblings
			//siblingOffset:	'data-rheight-sibling-offset',
		},

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
					if ( $this.attr( selectors.thresholdWidth ) && viewport.width < $this.attr( selectors.thresholdWidth ) ) {
						methods.disable( $this );
						return;
					};

					// get height threshold, if it doesn't make it, don't do this
					if ( $this.attr( selectors.thresholdHeight ) && viewport.height < $this.attr( selectors.thresholdHeight ) ) {
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
				var attr = methods._getAttr( $mod.attr( selectors.rootAttr ) );
				
				// respect min-height
				if ( $mod.attr( selectors.minHeight ) && newHeight < methods._getHeight( $mod.attr( selectors.minHeight ), viewport.width ) )
					newHeight = methods._getHeight( $mod.attr( selectors.minHeight ), viewport.width );

				// respect max-height
				if ( $mod.attr( selectors.maxHeight ) && newHeight > methods._getHeight( $mod.attr( selectors.maxHeight ), viewport.width ) )
					newHeight = methods._getHeight( $mod.attr( selectors.maxHeight ), viewport.width );

				$mod.attr( 'style', attr +':'+ newHeight +'px;' );

				// look for inner nodes to resize as well
				var $children = $mod.find( '['+ selectors.child +']' );
				$children.each( function() {
					methods.resizeChild( $(this), newHeight );
				});
			},

			resizeChild: function( $child, parentHeight ) {
				//console.log("$.fn['"+ pluginName +"'].methods.handleChild()");
				//console.log( $child );

				// resize
				var newHeight = parentHeight;
				var attr = methods._getAttr( $child.attr( selectors.childAttr ) );
				var val  = methods._getAttrValue ( $child, $child.attr( selectors.childAttr ), newHeight );
				$child.attr( 'style', attr +':'+ val +'px;' );
			},

			setViewport: function() {
				//console.log("$.fn['"+ pluginName +"'].methods.setViewport()");

				viewport.width = $( document.body ).width();
				viewport.height = $( window ).height();
			},

			_getAttr: function( attr ) {
				//console.log("  $.fn['"+ pluginName +"'].methods._getAttr('"+ attr +"')");
				var rAttr = 'min-height';
				switch ( attr ) {
					case 'center':
						rAttr = 'margin-top';
						break;
				};
				return rAttr;
			},

			_getAttrValue: function( $this, attr, height ) {
				//console.log("  $.fn['"+ pluginName +"'].methods._getAttrValue('"+ attr +"', '"+ height +"')");
				rAttr = ( attr=='center' ) ? ( height - $this.outerHeight() ) /2 : height;
				return rAttr;	
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
				if ( !$mod.attr( selectors.rootOffset ) || $mod.attr( selectors.rootOffset )=="0")
					return 0;

				// or return offset if its an int
				if ( $mod.attr( selectors.rootOffset ) == parseInt($mod.attr( selectors.rootOffset )) )
					return $mod.attr( selectors.rootOffset );

				// else return element height
				var $node = $( $mod.attr( selectors.rootOffset ) );
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


