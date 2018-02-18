var scrubber = (function() {

	var scrubSelector	=	".scrubber video";
	
	var scrubber	=	document.querySelectorAll( scrubSelector );

	[].forEach.call( scrubber, function( element ) {

		if (element.addEventListener) {
		// IE9, Chrome, Safari, Opera
		element.addEventListener("mousewheel", MouseWheelHandler, false);
		// Firefox
		element.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
		}
		// IE 6/7/8
		else element.attachEvent("onmousewheel", MouseWheelHandler);

	} )

	function MouseWheelHandler( e )
	{
		var offset		=	0.01;
		var scrollSpeed	=	0.1;

		e.preventDefault();
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

		if ( delta > 0 )
		{
			if (this.currentTime - offset  > this.duration )
			{
				this.currentTime	=	0;
			}
			else
			{
				this.currentTime	+=	scrollSpeed;
			}	
		}
		else
		{
			if (this.currentTime < offset)
			{
				this.currentTime	=	this.duration - offset;
			}
			else
			{
				this.currentTime 	-= 	scrollSpeed;
			}
		}				
	}
})();