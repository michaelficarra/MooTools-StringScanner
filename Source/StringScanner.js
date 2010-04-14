/*
---
description: Performs lexical scanning operations on a String
license: LGPL
authors:
- Michael Ficarra
requires:
- core/1.2.4:Core
- core/1.2.4:Array
- core/1.2.4:Hash
- core/1.2.4:Class
provides: [StringScanner]
...
*/
var StringScanner = new Class({
	initialize: function(str){
		this.str = $defined(str) ? str.toString() : '';
		this.pos = 0;
		this.lastMatch = {
			reset: function(){
				this.str = null;
				this.captures = [];
				return this;
			}
		}.reset();
		return this;
	},
	bol: function(){
		return this.pos<=0 || this.str[this.pos-1]=="\n";
	},
	captures: function(){
		return this.lastMatch.captures;
	},
	check: function(pattern){
		if(this.str.substr(this.pos).search(pattern)!==0){
			this.lastMatch.reset();
			return null;
		}
		var matches = this.str.substr(this.pos).match(pattern);
		this.lastMatch.str = matches[0];
		this.lastMatch.captures = matches.slice(1);
		return this.lastMatch.str;
	},
	checkUntil: function(pattern){
		var patternPos = this.str.substr(this.pos).search(pattern);
		if(patternPos < 0){
			this.lastMatch.reset();
			return null;
		}
		var matches = this.str.substr(this.pos+patternPos).match(pattern);
		this.lastMatch.str = this.str.substr(this.pos,patternPos)+matches[0];
		this.lastMatch.captures = matches.slice(1);
		return this.lastMatch.str;
	},
	clone: function(){
		var clone = new this.constructor(this.str);
		clone.pos = this.pos;
		clone.lastMatch = this.lastMatch;
		return clone;
	},
	concat: function(str){
		this.str += str;
		return this;
	},
	eos: function(){
		return this.pos==this.str.length;
	},
	exists: function(pattern){
		var patternPos = this.str.substr(this.pos).search(pattern);
		if(patternPos < 0){
			this.lastMatch.reset();
			return null;
		}
		var matches = this.str.substr(this.pos+patternPos).match(pattern);
		this.lastMatch.str = matches[0];
		this.lastMatch.captures = matches.slice(1);
		return patternPos;
	},
	getch: function(){
		return this.scan(/./);
	},
	// ruby equivalent: matched
	match: function(){
		return this.lastMatch.str;
	},
	// ruby equivalent: match?
	matches: function(pattern){
		this.check(pattern);
		return this.matchSize();
	},
	// ruby equivalent: matched?
	matched: function(){
		return this.lastMatch.str !== null;
	},
	matchSize: function(){
		return this.matched() ? this.match().length : null;
	},
	peek: function(len){
		return this.str.substr(this.pos,len);
	},
	pointer: function(){
		return this.pos;
	},
	setPointer: function(pos){
		this.pos = [[0,pos].max(),this.str.length].min();
		return this.pos;
	},
	reset: function(){
		this.lastMatch.reset();
		this.pos = 0;
		return this;
	},
	rest: function(){
		return this.str.substr(this.pos);
	},
	scan: function(pattern){
		var chk = this.check(pattern);
		if(chk !== null) this.pos += chk.length;
		return chk;
	},
	scanUntil: function(pattern){
		var chk = this.checkUntil(pattern);
		if(chk !== null) this.pos += chk.length;
		return chk;
	},
	skip: function(pattern){
		this.scan(pattern);
		return this.matchSize();
	},
	skipUntil: function(pattern){
		this.scanUntil(pattern);
		return this.matchSize();
	},
	string: function(){
		return this.str;
	},
	terminate: function(){
		this.pos = this.str.length;
		this.lastMatch.reset();
		return this;
	}
});

new Native({
	name: 'StringScanner',
	initialize: StringScanner,
	protect: true
});

// Natives seem to discard the toString function, so it needs to be readded here.
// Also, it seems StringScanner.implement doesn't add it (I think because it's already defined somewhere)
StringScanner.prototype.toString = function(){
	return '#<StringScanner '+(this.eos()?'fin':(this.pos+'/'+this.str.length+' @ '+(this.str.length>8?this.str.substr(0,5)+'...':this.str).inspect()))+'>';
};

StringScanner.alias({
	'bol': 'beginningOfLine',
	'eos': 'endOfString',
	'clone': 'dup',
	'exists': 'exist',
	'getch': 'getChar',
	'pointer': 'position',
	'terminate': 'clear'
});

/* Copyright 2010 Michael Ficarra
This program is distributed under the (very open)
terms of the GNU Lesser General Public License */
