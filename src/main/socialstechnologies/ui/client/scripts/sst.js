
'use strict';
var sst = function(){
	var sstDefinition = {
		parallax: parallax,
		stickyHeader: stickyHeader,
		relocateScroll: relocateScrollToElementWithId,
		animateElementOnShow: animateElementOnShow,
		toggleValidationError: toggleValidationError 
	}

	function toggleValidationError(element){

		//var elSelector = '.validation-error'


		if (device.tablet() || device.mobile()) {
			var $target = $(element);
			cssClass = 'touch-validation-error';
			if($target.hasClass(cssClass)) {
				$target.removeClass(cssClass);
			} else {
				$target.addClass(cssClass);
			}
			/*
			var $elements = $(elSelector);
			$elements.each(function(){
				var $target = $(this);
				$target.click(function (){
					var $target = $(this),
					cssClass = 'touch-validation-error';
					if(!$target.hasClass(cssClass)) {
						$target.removeClass(cssClass);
					} else {
						$target.addClass(cssClass);
					}
				});
			});*/
		}
	}

	

	function animateElementOnShow($, window, document, undefined){

		var animateShownClass = 'animate-scrolling';
		var shownDefaultClass = 'animate-scrolling-shown';
		var animateShownTextClass = 'animate-scrolling-text';
		var animateShownLeftClass = 'animate-scrolling-left';
		var shownClass = 'animate-scrolling-shown-middle';
		var $window = $(window)
		var elSelector = '.accessory';
		var elSelectorContent = '.accessory-content';


		var $elements = $(elSelector);
		$elements.each(function(){
			var $target = $(this);

			$target.addClass(animateShownClass);
			$target.addClass(animateShownLeftClass);

			$window.bind('scroll', function() {
				pollElementVisibility($window, $target, true, (result)=>{
					if (result === true){
						if(!$target.hasClass(shownClass)) {
							$target.addClass(shownClass);
						}
					} else {
						if($target.hasClass(shownClass)) {
							$target.removeClass(shownClass);
						}
					}
				});
			});
		});


		var $contents = $(elSelectorContent);
		$contents.each(function(){
			var $target = $(this);

			$target.addClass(animateShownClass);
			$target.addClass(animateShownTextClass);

			$window.bind('scroll', function() {
				pollElementVisibility($window, $target, false, (result)=>{
					if (result === true){
						if(!$target.hasClass(shownDefaultClass)) {
							$target.addClass(shownDefaultClass);
						}
					} else {
						if($target.hasClass(shownDefaultClass)) {
							$target.removeClass(shownDefaultClass);
						}
					}
				});
			});
		});

	}

	function pollElementVisibility($window, $target, fullyInView, callback){
		var pageTop = $window.scrollTop();
		var pageBottom = pageTop + $window.height();
		var elementTop = $target.offset().top;
		var elementBottom = elementTop + $target.height();
		var didShown = false;

		if (fullyInView === true) {
			 didShown = (pageBottom - elementTop) > 0 && (pageBottom - elementBottom) > 0;
		} else {
			didShown = (pageBottom - elementTop) >= 0;
		}
		callback(didShown);
	}

	function relocateScrollToElementWithId(id){
		var timelapse = 1200
	    var $targetElem = $("#"+id)
	    $('html, body').animate({
	        scrollTop: $targetElem.offset().top + $targetElem.height()
	    }, timelapse);
	}

	function parallax($, window, document, undefined) {
		var speed = 3,
		elemSelector = '.parallax',
		elemCssClass = 'fixed',
		$window = $(window),
		$document = $(document);
		

		$document.ready(function(){
			if (!device.tablet() && !device.mobile()) {

				var $elements = $(elemSelector)

				$elements.addClass(elemCssClass);
	          	$window = $(window);
	         	$elements.each(function(){
	              var $scroll = $(this);
	              $window.scroll(function() {
	                  var yPos = -(($window.scrollTop() - $scroll.offset().top) / speed);
	                  var coords = '50% '+ yPos + 'px';
	                  $scroll.css({ backgroundPosition: coords });
	              });
	          });
			}
		})
	}

	function stickyHeader($, window, document, undefined) {
		var elSelector    = '.header',
	      elClassNarrow = 'header--narrow',
	      elNarrowOffset  = 100,
	      $document = $(document)
	      

	    $document.ready(function(){
	    	

		    var elHeight    = 0,
		      elTop     = 0,
		      $document   = $( document ),
		      dHeight     = 0,
		      $window     = $( window ),
		      wHeight     = 0,
		      wScrollCurrent  = 0,
		      wScrollBefore = 0,
		      wScrollDiff   = 0,
		      $element = $( elSelector );


		    if( !$element.length ) 
	    		return true;

		    $window.on( 'scroll', function()
		    {
		      elHeight    = $element.outerHeight();
		      dHeight     = $document.height();
		      wHeight     = $window.height();
		      wScrollCurrent  = $window.scrollTop();
		      wScrollDiff   = wScrollBefore - wScrollCurrent;
		      elTop     = parseInt( $element.css( 'top' ) ) + wScrollDiff;

		      $element.toggleClass( elClassNarrow, wScrollCurrent > elNarrowOffset ); // toggles "narrow" classname

		      if( wScrollCurrent <= 0 ) // scrolled to the very top; element sticks to the top
		        $element.css( 'top', 0 );

		      else if( wScrollDiff > 0 ) // scrolled up; element slides in
		        $element.css( 'top', elTop > 0 ? 0 : elTop );

		      else if( wScrollDiff < 0 ) // scrolled down
		      {
		        if( wScrollCurrent + wHeight >= dHeight - elHeight )  // scrolled to the very bottom; element slides in
		          $element.css( 'top', ( elTop = wScrollCurrent + wHeight - dHeight ) < 0 ? elTop : 0 );

		        else // scrolled down; element slides out
		          $element.css( 'top', Math.abs( elTop ) > elHeight ? -elHeight : elTop );
		      }

		      wScrollBefore = wScrollCurrent;
		    });
	    })    
	}
	return sstDefinition;
};

//sst().setActiveMenu(jQuery, document);
$(document).ready(function(){
	sst().stickyHeader(jQuery, window, document);
	sst().parallax(jQuery, window, document);
	sst().animateElementOnShow(jQuery, window, document);
})