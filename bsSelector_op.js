/* bsSelector v0.1
 * Copyright (c) 2013 by ProjectBS Committe and contributors. 
 * http://www.bsplugin.com All rights reserved.
 * Licensed under the BSD license. See http://opensource.org/licenses/BSD-3-Clause
 * CSS3 & 4 참고자료
 * http://css4-selectors.com/browser-selector-test/
 * http://kimblim.dk/css-tests/selectors/
*/
var bsSelector = function( doc, trim, detect, domData ){
	'use strict';
	var isQSA = doc['querySelectorAll'] ? 1 : 0, isClsName = doc['getElementsByClassName'] ? 1 : 0,
		isIE = detect.browser == 'ie' ? 1 : 0, ieVer = detect.browserVer,
		rTag = /^[a-z]+[0-9]*$/i, rAlpha = /[a-z]/i, rClsTagId = /^[.#]?[a-z0-9]+$/i,
		tokenize, compare, query, qtime, TIME, hasParent, hasQSAErr, oSel;
	
	
	oSel = [],
	tokenize = (function(trim){
		var mParent = {' ':1, '>':1}, mQSAErr = '!', mBracket = {'[':0, '(':0, ']':1, ')':1},
			mEx = {'*':1, ' ':1, ']':1, '>':1, '+':1, '~':1, '^':1, '$':1},
			mT0 = {' ':1, '*':2, '>':2, '+':2, '~':2, '#':3, '.':3, ':':3, '[':3}, mT1 = {'>':1, '+':1, '~':1};
		return function( s, tks ){
			var tk, b, t0, t1, i, k;
			tks.length = 0, tk = '', s = s.replace( trim, '' ), i = s.length;
			while( i-- ){
				k = s.charAt(i);
				if( hasParent || mParent[k] ) hasParent = 1;
				if( hasQSAErr || b && k == mQSAErr ) hasQSAErr = 1;
				if( ( t0 = mBracket[k] ) !== undefined && ( b = t0 ) ) continue;
				if( !( t0 = mEx[k] ) ) tk = k + tk;
				if( t0 && b ) tk = k + tk;
				else if( ( t0 = mT0[k] ) == 1 ){
					if( ( t1 = tks[tks.length - 1] ) == ' ' ) continue;
					if( tk ) tks[tks.length] = t1 = tk, tk = '';
					if( !mT1[t1] ) tks[tks.length] = k;
				}else if( t0 == 2 ){
					if( tk.replace( trim, '' ) ) tks[tks.length] = tk, tk = '';
					if( tks[tks.length - 1] == ' ' ) tks.pop();
					tks[tks.length] = k;
				}else if( t0 == 3 || !i ){
					if( tk && !b ) tks[tks.length] = tk, tk = '';
				}else if( s.charAt( i - 1 ) == ' ' ) tks[tks.length] = tk, tk = '';
			}
			return tks;
		};
	})(trim),
	qtime = {},
	compare = (function(){
		var r0 = /"|'/g, i, j, 
		mT0 = {'~':1, '|':1, '!':1, '^':1, '$':1, '*':1},
		enabled = {INPUT:1, BUTTON:1, SELECT:1, OPTION:1, TEXTAREA:1},
		checked = {INPUT:1, radio:1, checkbox:1, OPTION:2},
		first = {'first-child':0, 'last-child':0, 'first-of-type':1, 'last-of-type':1},
		times = {'nth-child':'DQt0', 'nth-last-child':'DQt1', 'first-child':'DQt2', 'last-child':'DQt3', 'first-of-type':'DQt4', 'last-of-type':'DQt5'},
		indexes = {'nth-child':'DQi0', 'nth-last-child':'DQi1', 'first-child':'DQi2', 'last-child':'DQi3', 'first-of-type':'DQi4', 'last-of-type':'DQi5'};
		return function( el, token ){
			var data, time, indexes, parent, children, tag, update, dir, t0, t1, k, v, i, j, m;
			switch( token.charAt(0) ){
			case'#':return token.substr(1) == el.id;
			case'.':return !( t0 = el.className ) ? 0 : ( k = token.substr(1), t0.indexOf(' ') > -1 ? k == t0 : t0.split(' ').indexOf(k) > -1 );
			case'[':
				t0 = el.getAttribute( k = token.substr(1) ), i = k.indexOf('=');
				if( i == -1 ) return t0 === null ? 0 : 1;
				if( t0 === null ) return 0;
				t1 = k.charAt( i - 1 ), v = k.substr( i + 1 ), k = k.substring( 0, i - 1 );
				switch( t1 ){
				case'~':return t0.split(' ').indexOf(v) > -1;
				case'|':return t0.split('-').indexOf(v) > -1;
				case'^':return t0.indexOf(v) == 0;
				case'$':return t0.lastIndexOf(v) == ( t0.length - v.length );
				case'*':return t0.indexOf(v) > -1;
				case'!':return t0 !== val;
				default:return t0 === val;
				}
			case':':
				k = token.substr(1), i = k.indexOf('('), v = i > -1 ? isNaN( t0 = k.substr( i + 1 ) ) ? t0.replace( trim, '' ) : parseFloat(t0) : null;
				if( v ) k = k.substring( 0, i );
				switch( k ){
				case'active':case'visited':case'first-line':case'first-letter':case'hover':case'focus':return;
				case'link':return el.tagName == 'A' && el.getAttribute('href');
				case'root':return el.tagName == 'HTML';
				case'empty':return el.nodeType == 1 && !el.nodeValue && !el.childNodes.length;
				case'checked':return t0 = checked[el.tagName], ( t0 == 1 && el.checked == true && checked[el.getAttribute('type')] ) || ( t0 == 2 && el.selected );
				case'enabled':return enabled[t0 = el.tagName] && !el.getAttribute('disabled');
				case'disabled':return enabled[t0 = el.tagName] && el.getAttribute('disabled');
				case'first-child':case'first-of-type':dir = 1;case'last-child':case'last-of-type':
					if( ( children = el.parentNode.childNodes ) && ( i = j = children.length ) ){
						m = 0;
						if( t1 = first[k] ) tag = el.tagName;
						while( i-- ){
							t0 = children[dir ? j - i - 1 : i];
							if( t0.nodeType == 1 && ( t1 ? tag == t0.tagName : 1 ) ) return !m++ && t0 == el;
						}
					}
					return;
				case'only-of-type':dir = 1;case'only-child':
					if( ( children = el.parentNode.childNodes ) && ( i = children.length ) ){
						m = 0;
						if( dir ) tag = el.tagName;
						while( i-- ){
							t0 = children[i];	
							if( t0.nodeType == 1 ){
								if( m++ && ( dir ? tag == t0.tagName : 1 ) ) return;
								else t1 = t0;
							}
						}
						return el == t1;
					}
					return;
				default:
					if( !( parent = el.parentNode ) || parent.tagName == 'HTML' || !( time = times[k] ) || !( children = parent.childNodes ) || !( j = i = children.length ) ) return 0;
					tag = el.tagName, data = domData(el), index = indexes[k];
					if( !data[time] || data[time] != qtime[time] ) data[time] = qtime[time] = TIME, update = 1;
					switch( k ){
					case'nth-child':dir = 1;case'nth-last-child':
						if( v == 'n' ) return 1;
						if( update ) while( i-- ){
							t0 = children[i];
							if( t0.nodeType == 1 ) ( t1 = domData(t0) )[time] = TIME, t1[index] = dir ? i + 1 : j - i;
						}
						j = ( i = data[index] ) % 2;
						return v == 'even' || v == '2n' ? j == 0 : v == 'odd' || v == '2n+1' ? j == 1 : i == v;
					case'nth-of-type':dir = 1;case'nth-last-of-type':
						if( v == 'n' ) return 1;
						if( update ){
							m = 1;
							while( i-- ){
								t0 = children[dir ? j - i - 1 : i];
								if( t0.nodeType == 1 && t0.tagName == tag ) ( t1 = domData(t0) )[time] = TIME, t1[index] = m++;
							}
						}
						j = ( i = data[index] ) % 2;
						return v == 'even' || v == '2n' ? j == 0 : v == 'odd' || v == '2n+1' ? j == 1 : i == v;
					}
					return token == el.tagName || token == '*';
				}
			}
		};
	})();
	query = (function(){
		var DOC = document, R = {length:0};
		return function( query, doc, r ){
			var el, els, sels, t0, i, j, k, m, n,
				tags, key, hit, token, tokens, hasQS;
			
			if( !r ) r = R;
			r.length = 0, doc = doc || DOC, TIME = +new Date();

			if( rClsTagId.test(query) ) switch( query.charAt(0) ){
				case'#':return r[r.length++] = doc.getElementById(query.substr(1)), r;
				case'.':
					t0 = doc.getElementsByClassName(query.substr(1)), r.length = i = t0.length;
					while(i--) r[i] = t0[i];
					return r;
				default:
					doc.getElementsByTagName(query);
					while(i--) r[i] = t0[i];
					return r;
			}
			
			if( isQSA && query.indexOf(',') > -1 && query.indexOf('!') < 0 ) return doc.querySelectorAll(query);




		oSel.length = 0,
		hasQS = 0,
		sels = utrim( query.split(',') );
		for( i = sels.length; i--; ){
			t0 = parseQuery( sels[i] );
			for( j = t0.length; j--; ){
				if( rTag.test( t0[j] ) )
					t0[j] = t0[j].toUpperCase();
				else if( t0[j].charAt(0) == ':' ){
					t0[j] = t0[j].toLowerCase();
					if( ( t0[j] == ':nth-child(n' || t0[j] == ':nth-last-child(n' ) && t0.length != 1 ){
						t0.splice(j,1);continue;
					}
				}
				if( isQSA && !hasQSAErr && !hasQS && !nQSA.indexOf( t0[j].charAt(0) ) > -1 ) hasQS = 1;
			}
			oSel.push( t0 );
		}
		//console.log("### oSel", oSel);return;
		if( oSel.length == 1 && oSel[0].length ){
			if( ( key = oSel[0][0].charAt(0) ) == '#' ){
				els = [doc.getElementById( oSel[0][0].substr(1) )],
				oSel[0].shift();
			}
			else if( key == '.' && isClsName ){
				els = doc.getElementsByClassName( oSel[0][0].substr(1) ),
				oSel[0].shift();
				if( hasQS && els.length > 100 ) return doc.querySelectorAll( query );
			}
			else if( key == '[' || key == ':' ){
				if( hasQS ) return doc.querySelectorAll( query );
				if( !hasParent ){
					els = oSel[0][oSel[0].length-1];
					if( ( key = els.charAt(0) ) == '#' )
						els = [doc.getElementById( els.substr(1) )],
						oSel[0].pop();
					else if( key == '.' && isClsName )
						els = doc.getElementsByClassName( els.substr(1) ),
						oSel[0].pop();
					else if( rTag.test( els ) )
						els = doc.getElementsByTagName( els ),
						oSel[0].pop();
					else
						els = doc.getElementsByTagName('*');
				}
				else
					els = doc.getElementsByTagName('*');
			}
			else if( rTag.test( els = oSel[0][0] ) ){
				els = doc.getElementsByTagName( els ),
				oSel[0].shift();
				if( hasQS && els.length > 100 ) return doc.querySelectorAll( query );
			}
			else els = doc.getElementsByTagName('*');
		}else{
			els = doc.getElementsByTagName('*');
		}
		if( !oSel[0].length ) return els;
		for( i = 0, j = els.length; i < j; i++ ){
			for( k = oSel.length; k--; ){
				tokens = oSel[k];
				el = els[i];
				for( m = 0, n = tokens.length; m < n; m++ ){
					token = tokens[m];
					hit = 0;
					if( ( key = token.charAt(0) ) == ' ' ){ // loop parent
						m++;
						while( el = el.parentNode ){
							if( hit = compareEl( el, tokens[m] ) ) break;
						}
					}else if( key == '>' ){ // immediate parent
						hit = compareEl( el = el.parentNode, tokens[++m] );
					}else if( key == '+' ){ // has immediate nextsibling
						while( el = el.previousSibling ) if( el.nodeType == 1 ) break;
						hit = el && compareEl( el, tokens[++m] );
					}else if( key == '~' ){ // has any nextsibling
						m++;
						while( el = el.previousSibling ){
							if( el.nodeType == 1 && compareEl( el, tokens[m] ) ){
								hit = 1; break;
							}
						}
					}else{
						hit = compareEl( el, token );
					}
					if( !hit ) break; // 여긴 AND 연산
				}
				if( hit ) break; // 여긴 OR 연산
			}
			if( hit ) ret[ret.length] = els[i];
		}
		return ret;
	};
	query.isQSA = isQSA;
	return query;
};