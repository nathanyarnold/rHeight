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
			root: 'data-rheight',
			rootAttr: 'data-rheight-attr',
			rootOffset: 'data-rheight-offset',
			thresholdWidth: 'data-rheight-threshold-width',
			thresholdHeight:'data-rheight-threshold-height',
			minHeight:		'data-rheight-minheight',
			maxHeight:		'data-rheight-maxheight',

			child:			'data-rheight-child',
			childAttr:		'data-rheight-child-attr',
			childOffset:	'data-rheight-child-offset',
			childThresholdWidth: 'data-rheight-child-threshold-width',
			childThresholdHeight: 'data-rheight-child-threshold-height'
		},

		// Objects to work on
		root = false,

		viewport = {
			width: 0,
			height: 0
		},

		resizeTimer = false,

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
				$( window ).on( 'resize', $.proxy( this, 'handleResize' ) );
			},

			// use this, so we're not CONSTANTLY re-calculating during a resize event
			handleResize: function() {
				// if we're already doing this, don't bother doing it again
				if ( resizeTimer )
					clearTimeout( resizeTimer )

				// run method on resize
				resizeTimer = window.setTimeout( function() {
					methods.resize();
				}, 50);
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
				//console.log('	newHeight: '+ newHeight);
				//console.log('	attr: '+	attr );
				
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
				var val	= methods._getAttrValue ( $child, $child.attr( selectors.childAttr ), height-offset );
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
				//console.log("	$.fn['"+ pluginName +"'].methods._getAttr('"+ attr +"')");
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
				//console.log("	$.fn['"+ pluginName +"'].methods._getAttrValue('"+ attr +"', '"+ height +"')");
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
				//console.log("	 - $.fn['"+ pluginName +"'].methods._getHeight("+ height +", "+ width +")");

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
				//console.log("	 - $.fn['"+ pluginName +"'].methods._getOffset( $mod, '"+ offsetAttr +"')");
				
				// just return 0 if attribute is not set
				if ( !$mod.attr( offsetAttr ) || $mod.attr( offsetAttr )=="0")
					return 0;

				// return 0 if there's an attribute, but no value
				var value = $mod.attr( offsetAttr );
				if ( !value )
					return 0;

				// split values by comma
				var valuesArray = value.split(',');

				// go through each item, get offset for each
				var total = 0;
				$.each(valuesArray, function(i, value) {
					var subTotal = methods._getOffsetItem( value.trim() );
					total += subTotal;
				});

				return total;
		 },

		 _getOffsetItem: function( value ) { 
				// get int value
				var intValue = parseInt( value );

				// simply return px value, if it's an int
				if ( value==intValue || value==intValue+'px')
					return intValue;

				// or return offset if it's a %
				if ( value==intValue+'%')
					return Math.round(height * .01 * intValue);

				// else return element height
				var $node = $( value );
				if ( $node.length > 0 )	{
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


