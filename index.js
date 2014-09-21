var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var events = require('dom-events')
var offset = require('mouse-event-offset')

function ClickDrag(element, opt) {
	if (!(this instanceof ClickDrag)) 
		return new ClickDrag(element, opt)
	opt = opt||{}
	EventEmitter.call(this)

	this.enabled = true
	this.element = element
	this._dragging = null

	this._mousedown = mousedown.bind(this)
	this._mousemove = mousemove.bind(this)
	this._mouseup = mouseup.bind(this)
	
	events.on(element, 'mousedown', this._mousedown)

	if (opt.parent instanceof EventEmitter) {
		opt.parent.on('mousemove', this._mousemove)
		opt.parent.on('mouseup', this._mouseup)
	} else {
		var parent = opt.parent || document
		events.on(parent, 'mousemove', this._mousemove)
		events.on(parent, 'mouseup', this._mouseup)
	}
}

inherits(ClickDrag, EventEmitter)

function getOffset(ev, element) {
	return offset(ev, { clientRect: element.getBoundingClientRect() }) 
}

function empty() {
	return { x:0, y: 0 }
}

function delta(start, off) {
	var d = empty()
	d.x = start.x - off.x
	d.y = start.y - off.y
	return d
}

function mousedown(ev) {
	if (!this.enabled) 
		return

	if (this._dragging === null) {
		this._dragging = ev.button
		var off = getOffset(ev, this.element)
		this._start = off

		this.emit('start', ev, off, empty())
	}
}

function mousemove(ev) {
	if (!this.enabled)
		return

	if (this._dragging === ev.button) {
		var off = getOffset(ev, this.element)
		var d = delta(off, this._start)
		this.emit('move', ev, off, d)
	}
}

function mouseup(ev) {
	if (!this.enabled)
		return
	if (this._dragging === ev.button) {
		this._dragging = null
		var off = getOffset(ev, this.element)
		var d = delta(off, this._start)
		this.emit('end', ev, off, d)
	}
}

module.exports = ClickDrag