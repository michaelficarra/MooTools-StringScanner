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
# - core/1.2.4:Class.Extras

provides: [StringScanner]

...
*/
var StringScanner = new Class({
	initialize: function(str){
		this.str = $defined(str) ? str.toString() : '';
		this.pos = 0;
		this.last_match = {
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
		return this.last_match.captures;
	},
	check: function(pattern){
		if(this.str.substr(this.pos).search(pattern)!==0){
			this.last_match.reset();
			return null;
		}
		var matches = this.str.substr(this.pos).match(pattern);
		this.last_match.str = matches[0];
		this.last_match.captures = matches.slice(1);
		return this.last_match.str;
	},
	check_until: function(pattern){
		var pattern_pos = this.str.substr(this.pos).search(pattern);
		if(pattern_pos < 0){
			this.last_match.reset();
			return null;
		}
		var matches = this.str.substr(this.pos+pattern_pos).match(pattern);
		this.last_match.str = this.str.substr(this.pos,pattern_pos)+matches[0];
		this.last_match.captures = matches.slice(1);
		return this.last_match.str;
	},
	clone: function(){
		var clone = new this.constructor(this.str);
		clone.pos = this.pos;
		clone.last_match = this.last_match;
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
		var pattern_pos = this.str.substr(this.pos).search(pattern);
		if(pattern_pos < 0){
			this.last_match.reset();
			return null;
		}
		var matches = this.str.substr(this.pos+pattern_pos).match(pattern);
		this.last_match.str = matches[0];
		this.last_match.captures = matches.slice(1);
		return pattern_pos;
	},
	getch: function(){
		return this.scan(/./);
	},
	// ruby equivalent: matched
	match: function(){
		return this.last_match.str;
	},
	// ruby equivalent: match?
	matches: function(pattern){
		this.check(pattern);
		return this.match_size();
	},
	// ruby equivalent: matched?
	matched: function(){
		return this.last_match.str !== null;
	},
	match_size: function(){
		return this.matched() ? this.match().length : null;
	},
	peek: function(len){
		return this.str.substr(this.pos,len);
	},
	pointer: function(){
		return this.pos;
	},
	set_pointer: function(pos){
		this.pos = [[0,pos].max(),this.str.length].min();
		return this.pos;
	},
	reset: function(){
		this.last_match.reset();
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
	scan_until: function(pattern){
		var chk = this.check_until(pattern);
		if(chk !== null) this.pos += chk.length;
		return chk;
	},
	skip: function(pattern){
		this.scan(pattern);
		return this.match_size();
	},
	skip_until: function(pattern){
		this.scan_until(pattern);
		return this.match_size();
	},
	string: function(){
		return this.str;
	},
	terminate: function(){
		this.pos = this.str.length;
		this.last_match.reset();
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
	'bol': 'beginning_of_line',
	'eos': 'end_of_string',
	'clone': 'dup',
	'exists': 'exist',
	'getch': 'get_char',
	'pointer': 'position',
	'terminate': 'clear',
	'toString': 'to_s'
});

/* Copyright 2010 Michael Ficarra
This program is distributed under the (very open)
terms of the GNU Lesser General Public License */
