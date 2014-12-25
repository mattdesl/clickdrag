var style = require('dom-style')
var draggable = require('../')

require('domready')(function() {
	var container = document.createElement("div")
	style(container, {
		position: 'absolute',
		top: '0px',
		left: '0px',
		width: '64px',
		height: '64px',
		cursor: 'pointer',
		background: 'red'
	})
	document.body.appendChild(container)

	var highlight = document.createElement("div")
	style(highlight, {
		position: 'absolute',
		top: '0px',
		left: '0px',
		width: '10px',
		margin: '-5px',
		'pointer-events': 'none',
		height: '10px',
		cursor: 'pointer',
		background: 'black'
	})
	document.body.appendChild(highlight)

	var drag = draggable(container)
	drag.on('start', function(ev, offset, delta) {	
		console.log("Start drag", offset, delta)
	})
	drag.on('move', function(ev, offset, delta) {
		style(highlight, {
			left: offset.x+'px',
			top: offset.y+'px'
		})
		console.log("Delta: ", delta)
	})
	drag.on('end', function(ev, offset, delta) {
		console.log("Stop drag", offset)
	})
})