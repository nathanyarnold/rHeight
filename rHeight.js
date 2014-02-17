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
		1. Calculate heights with default CSS box-model (height + margin + border),
*/
(function( $ ){

	var pluginName = 'rHeight',
		selectors = {
            // set to "true" for this all to work
            root:           'data-rheight',
            // tell the system what CSS attr we want to change on the root-node
            rootAttr:       'data-rheight-attr',
            // allows you to subtract either an int from the calculated height, or the combined heights of any selectors you pass in
            rootOffset:     'data-rheight-offset',

			// set a minimum-width (int) of the viewport before this feature will engage (eg. 320 for iPhone portrait)
			thresholdWidth:	'data-rheight-threshold-width',
			thresholdHeight:'data-rheight-threshold-height',
			// set a min-height in either an int, or in a ratio (eg. '1:1' for square, '16:9' for photos)
			minHeight:		'data-rheight-minheight',
			// set a max-height in either an int, or in a ratio (eg. '1:1' for square, '16:9' for photos)
			maxHeight:		'data-rheight-maxheight',

			// set any child-nodes that get this to "true" and they'll get the same value passed down from root
			child:			'data-rheight-child',
			// attr we want to change on the child-node
			childAttr:		'data-rheight-child-attr',
			// same as offset above, but does it on the child nodes. Note that it subtracts from the parent height, not the page height
			childOffset:	'data-rheight-child-offset',
			// set a minimum-width (int) of the viewport before this feature will engage (eg. 320 for iPhone portrait)
			childThresholdWidth: 'data-rheight-child-threshold-width',
			childThresholdHeight: 'data-rheight-child-threshold-height'
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
						methods.resize();
					}, 10
				);

				// eventListener on any page-resize
				$( window ).on( 'orientationchange', $.proxy( this, 'resize' ) );
				$( window ).on( 'resize', $.proxy( this, 'resize' ) );
			},

			resize: function() {
				//console.log("$.fn['"+ pluginName +"'].methods.resize()");

				// get viewport dimensions
				methods._setViewport();
			
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
					methods._resizeNode( $this );
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

			// set styles for each registered item
			_resizeNode: function ( $mod ) {
				//console.log(" - $.fn['"+ pluginName +"'].methods.handleModule()");

				// get threshold, if it doesn't make it, don't do this
				if ( viewport.width < $mod.attr( selectors.minHeight ) ) {
					methods.disable( $mod );
					return;
				};

				// figure out offset
				var offset = methods._getOffset( $mod, selectors.rootOffset );

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
				methods._resizeChildren( $mod, newHeight );
			},

			_resizeChildren: function( $mod, height ) {
				//console.log("$.fn['"+ pluginName +"'].methods._resizeChildren($mod, '"+ height +"')");
				var $children = $mod.find( '['+ selectors.child +']' );
				$children.each( function() {
	
					var $this = $(this);

                    // get threshold, if it doesn't make it, don't do this
                    if ( $this.attr( selectors.childThresholdWidth ) && viewport.width < $this.attr( selectors.childThresholdWidth ) ) {
                        methods._disableChild( $this );
                        return;
                    };

                    // get height threshold, if it doesn't make it, don't do this
                    if ( $this.attr( selectors.childThresholdHeight ) && viewport.height < $this.attr( selectors.childThresholdHeight ) ) {
                        methods._disableChild( $this );
                        return;
                    };

					methods._resizeChild( $this, height );
				});
			},

			_resizeChild: function( $child, height ) {
				//console.log("$.fn['"+ pluginName +"'].methods._resizeChild($child, '"+ height +"')");
				//console.log( $child );

				// figure out offset
				var offset = methods._getOffset( $child, selectors.childOffset, height );
				//console.log(' - offset:'+ offset);

				// resize
				var attr = methods._getAttr( $child.attr( selectors.childAttr ) );
				var val  = methods._getAttrValue ( $child, $child.attr( selectors.childAttr ), height-offset );
				$child.attr( 'style', attr +':'+ val +'px;' );
			},

			_disableChild: function( $child ) {
				$child.attr( 'style', '' );
			},

			_setViewport: function() {
				//console.log("$.fn['"+ pluginName +"'].methods._setViewport()");

				viewport.width = $( document.body ).width();
				viewport.height = $( window ).height();
			},

			_getAttr: function( attr ) {
				//console.log("  $.fn['"+ pluginName +"'].methods._getAttr('"+ attr +"')");
				switch ( attr ) {
					case 'min-height':
					case 'max-height':
					case 'height':
					case 'margin-top':
					case 'padding-top':
					case 'border-top':
					case 'margin-bottom':
					case 'padding-bottom':
					case 'border-bottom':
					case 'top':
					case 'bottom':
						return attr;
					case 'center':
						return 'margin-top';
					default:
						return 'min-height';
				};
			},

			_getAttrValue: function( $this, attr, height ) {
				//console.log("  $.fn['"+ pluginName +"'].methods._getAttrValue('"+ attr +"', '"+ height +"')");
				if ( attr=='center' ) {
					// if outerHeight is larger, return zero, otherwise, center vertically
					var rAttr = ( height > $this.outerHeight() ) ? ( height - $this.outerHeight() ) / 2 : 0;
				} else {
					var rAttr = height;
				}
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

			_getOffset: function( $mod, offsetAttr, height ) {
				//console.log("   - $.fn['"+ pluginName +"'].methods._getOffset( $mod, '"+ offsetAttr +"')");
				
				// just return 0 if not set
				if ( !$mod.attr( offsetAttr ) || $mod.attr( offsetAttr )=="0")
					return 0;

				// get values
				var value = $mod.attr( offsetAttr );
				var intValue = parseInt( value );

				// or return offset if it's an int
				if ( value==intValue || value==intValue+'px')
					return $mod.attr( offsetAttr );

				// or return offset if it's a %
				if ( value==intValue+'%')
					return Math.round(height * .01 * intValue);

				// else return element height
				var $node = $( $mod.attr( offsetAttr ) );
				if ( $node.length > 0 )  {
					var height = 0;
					$node.each( function() {
						height += $(this).outerHeight( true );
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


