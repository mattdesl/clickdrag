var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var events = require('dom-events')
var offset = require('mouse-event-offset')
var xtend = require('xtend')

function wrapEvent(fn, element, instance) {
	return function(name) {
		fn(element, name, instance['_'+name])
	}
}

function ClickDrag(element, opt) {
	if (!(this instanceof ClickDrag)) 
		return new ClickDrag(element, opt)
	opt = opt||{}
	EventEmitter.call(this)

	this.enabled = true
	this.element = element
	this._dragging = null
	this._touchOnly = false

	var touch = opt.touch
	var parent = opt.parent || document

	//the events we're adding to the element & parent
	var targets = ['mousedown']
	var parentTargets = ['mousemove', 'mouseup']

	//bind methods to this instance
	this._mousedown = down.bind(this, null)
	this._mousemove = move.bind(this, null)
	this._mouseup = up.bind(this, null)
	
	//user requesting touch events
	if (touch) {
		targets.push('touchstart')
		parentTargets.push('touchmove', 'touchend')
		this._touchstart = down.bind(this, 'targetTouches')
		this._touchmove = move.bind(this, 'targetTouches')
		this._touchend = up.bind(this, 'changedTouches')	
	}

	//add the events to the element
	targets.forEach(wrapEvent(events.on, element, this))
	parentTargets.forEach(wrapEvent(events.on, parent, this))

	this._targets = targets
	this._parentTargets = parentTargets
	this._parent = parent
}

inherits(ClickDrag, EventEmitter)

ClickDrag.prototype._emit = function(name, ev, clientType) {
	var client
	if (clientType && ev[clientType])
		client = ev[clientType][0]

	//merge with client rect to avoid target issues
    client = xtend(client, {
    	clientRect: this.element.getBoundingClientRect()
    })

    var pos = offset(ev, client)
    if (name === 'start')
        this._start = pos
    
    var dt = delta(pos, this._start)
    this.emit(name, ev, pos, dt)
}

ClickDrag.prototype.dispose = function() {
	this._targets.forEach(wrapEvent(events.off, this.element, this))
	this._parentTargets.forEach(wrapEvent(events.off, this._parent, this))
	this.element = null
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

function down(clientType, ev) {
	if (!this.enabled || (!clientType && this._touchOnly)) 
		return

	//touch events work, stop listening for mouse
	//to avoid duplicate emits
	if (clientType) {
		this._touchOnly = true
	}

	if (this._dragging === null) {
		this._dragging = clientType ? true : ev.button
		this._emit('start', ev, clientType)
	}
}

function move(clientType, ev) {
	if (!this.enabled || (!clientType && this._touchOnly)) 
		return

	var expected = clientType ? true : ev.button
	if (this._dragging === expected) {
		this._emit('move', ev, clientType)
	}
}

function up(clientType, ev) {
	if (!this.enabled || (!clientType && this._touchOnly)) 
		return

	var expected = clientType ? true : ev.button
	if (this._dragging === expected) {
		this._dragging = null
		this._emit('end', ev, clientType)
	}
}

module.exports = ClickDrag