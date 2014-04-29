/* bsSelector v0.1
 * Copyright (c) 2013 by ProjectBS Committe and contributors. 
 * http://www.bsplugin.com All rights reserved.
 * Licensed under the BSD license. See http://opensource.org/licenses/BSD-3-Clause
 * CSS3 & 4 참고자료
 * http://css4-selectors.com/browser-selector-test/
 * http://kimblim.dk/css-tests/selectors/
*/
var bsSelector = function( doc, trim ){
	'use strict';
	var compare = (function(){
		var r0 = /"|'/g, i, j,//"
		mT0 = {'~':1, '|':1, '!':1, '^':1, '$':1, '*':1},
		enabled = {INPUT:1, BUTTON:1, SELECT:1, OPTION:1, TEXTAREA:1},
		checked = {INPUT:1, radio:1, checkbox:1, OPTION:2};
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
					if( !( parent = el.parentNode ) || parent.tagName == 'HTML' || !( children = parent.childNodes ) || !( j = i = children.length ) ) return;
					if( v == 'n' ) return 1;
					t1 = 0;
					switch( k ){
					case'nth-child':
						for( i = 0 ; i < j ; i++ ){
							t0 = children[i];
							if( t0.nodeType == 1 ){
								t1++;
								if( el == t0 ) return j = t1 % 2, v == 'even' || v == '2n' ? j == 0 : v == 'odd' || v == '2n+1' ? j == 1 : t1 == v;
							}
						}
						return;
					case'nth-last-child':
						while( i-- ){
							t0 = children[i];
							if( t0.nodeType == 1 ){
								t1++;
								if( el == t0 ) return j = t1 % 2, v == 'even' || v == '2n' ? j == 0 : v == 'odd' || v == '2n+1' ? j == 1 : t1 == v;
							}
						}
						return;
					case'nth-of-type':
						tag = el.tagName;
						for( i = 0 ; i < j ; i++ ){
							t0 = children[i];
							if( t0.nodeType == 1 && t0.tagName == tag ){
								t1++;
								if( el == t0 ) return j = t1 % 2, v == 'even' || v == '2n' ? j == 0 : v == 'odd' || v == '2n+1' ? j == 1 : t1 == v;
							}
						}
						return;
					case'nth-last-of-type':
						tag = el.tagName;
						while( i-- ){
							t0 = children[i];
							if( t0.nodeType == 1 && t0.tagName == tag ){
								t1++;
								if( el == t0 ) return j = t1 % 2, v == 'even' || v == '2n' ? j == 0 : v == 'odd' || v == '2n+1' ? j == 1 : t1 == v;
							}
						}
						return;
					}
				}
			default:
				return token == el.tagName || token == '*';
			}
		};
	})(),
	isQSA = doc['querySelectorAll'] ? 1 : 0,
	rTag = /^[a-z]+[0-9]*$/i, rAlpha = /[a-z]/i, rClsTagId = /^[.#]?[a-z0-9]+$/i,
	DOC = document, tagName = {}, clsName = {},
	className = (function( tagName, clsName ){
		var reg = {}, r = {length:0};
		return document['getElementsByClassName'] ? function(cls){
			//console.log( DOC, DOC.getElementsByClassName(cls), cls );
			return clsName[cls] || ( clsName[cls] = DOC.getElementsByClassName(cls) );
		} : function(cls){
			var t0 = tagName['*'] || ( tagName['*'] = DOC.getElementsByTagName('*') ), t1 = r[cls] || ( r[cls] = new RegExp( '\\b' + cls + '\\b', 'g' ) ), i;
			r.length = 0;
			while( i-- ) if( t1.test(t0[i].className) ) r[r.length++] = t0[i];
			return r;
		};
	})( tagName, clsName ),
	mQSA = {' ':1,'+':1,'~':1,':':1,'[':1},
	mParent = {' ':1, '>':1}, mQSAErr = '!', mBracket = {'[':1, '(':1, ']':2, ')':2},
	mEx = {' ':1, '*':1, ']':1, '>':1, '+':1, '~':1, '^':1, '$':1},
	mT0 = {' ':1, '*':2, '>':2, '+':2, '~':2, '#':3, '.':3, ':':3, '[':3}, mT1 = {'>':1, '+':1, '~':1},
	R = {length:0}, arrs = {_l:0};
	
	return function( query, doc, r ){
		var sels, sel, 
			hasParent, hasQSAErr, hasQS,
			t0, t1, t2, t3, i, j, k, l, m, n,
			el, els, tags, key, hit, token, tokens;
		
		if( !r ) r = R;
		r.length = 0, doc ? ( DOC = doc ) : ( doc = DOC );
		if( rClsTagId.test(query) ) switch( query.charAt(0) ){
			case'#':return r[r.length++] = doc.getElementById(query.substr(1)), r;
			case'.':return className(query.substr(1));
			default:return tagName[query] || ( tagName[query] = doc.getElementsByTagName(query) );
		}
		//if( isQSA && ( i = query.indexOf(',') ) > -1 && query.indexOf('!') < 0 ) return doc.querySelectorAll(query);
		if( i == -1 ) sels = arrs._l ? arrs[--arrs._l] : [], sels[0] = query, i = 1;
		else sels = query.split(','), i = sels.length;
		while( i-- ){
			t0 = arrs._l ? arrs[--arrs._l] : [], t1 = '', sel = sels[i].replace( trim, '' ), m = 0, j = sel.length;
			while( j-- ){
				k = sel.charAt(j);
				if( hasParent || mParent[k] ) hasParent = 1;
				if( hasQSAErr || m == 2 && k == '!' ) hasQSAErr = 1;
				if( ( t2 = mBracket[k] ) && ( m = t2 ) == 2 ) continue;
				if( !( t2 = mEx[k] ) ) t1 = k + t1;
				if( t2 && m == 2 ) t1 = k + t1;
				else if( ( t2 = mT0[k] ) == 1 ){
					if( ( t3 = t0[t0.length - 1] ) == ' ' ) continue;
					if( t1 ) t0[t0.length] = t1, t1 = '';
					if( !mT1[t3] ) t0[t0.length] = k;
				}else if( t2 == 2 ){
					if( t1.replace( trim, '' ) ) t0[t0.length] = t1, t1 = '';
					if( t0[t0.length - 1] == ' ' ) t0.pop();
					t0[t0.length] = k;
				}else if( t2 == 3 || !j ){
					if( t1 && m < 2 ) t0[t0.length] = t1, t1 = '';
				}else if( sel.charAt( j - 1 ) == ' ' ) t0[t0.length] = t1, t1 = '';
			}
			j = t0.length;
			while( j-- ){
				if( rTag.test(t0[j]) ) t0[j] = t0[j].toUpperCase();
				else if( t0[j].charAt(0) == ':' ){
					t0[j] = t0[j].toLowerCase();
					if( ( t0[j] == ':nth-child(n' || t0[j] == ':nth-last-child(n' ) && t0.length != 1 ){
						t0.splice( j, 1 );
						continue;
					}
				}
				if( isQSA && !hasQSAErr && !hasQS && !mQSA[t0[j].charAt(0)] ) hasQS = 1;
			}
			sels[i] = t0;
		}
		//console.log(sels);return;
		if( sels.length == 1 ){
			t0 = sels[0][0];
			if( ( k = t0.charAt(0) ) == '#' ) els = arrs._l ? arrs[--arrs._l] : [], els[0] = doc.getElementById(t0.substr(1)), sels[0].shift();
			else if( k == '.' ){
				els =  className(t0.substr(1)), sels[0].shift();
				//if( hasQS && els.length > 100 ) return doc.querySelectorAll(query);
			}else if( k == '[' || k == ':' ){
				if( hasQS ) return doc.querySelectorAll(query);
				if( !hasParent ){
					t0 = sels[0][sels[0].length - 1], k = t0.charAt(0);
					if( k == '#' ) sels[0].pop(), els = arrs._l ? arrs[--arrs._l] : [], els[0] = doc.getElementById( t0.substr(1) );
					else if( k == '.' ) sels[0].pop(), els = doc.getElementsByClassName( t0.substr(1) );
					else if( rTag.test(t0) ) sels[0].pop(), els = tagName[t0] || ( tagName[t0] = doc.getElementsByTagName(els) );
				}
			}else if( rTag.test(t0) ){
				sels[0].shift(), els = tagName[t0] || ( tagName[t0] = doc.getElementsByTagName(t0) );
				//if( hasQS && els.length > 100 ) return doc.querySelectorAll(query);
			}
		}
		if( !els ) els = tagName['*'] || ( tagName['*'] = doc.getElementsByTagName('*') );
		if( !sels[0].length ) return arrs[arrs._l++] = sels[0], sels.length = 0, arrs[arrs._l++] = sels, els;
		//console.log(sels); return;
		//console.log(els);return;
		for( i = 0, j = els.length ; i < j ; i++ ){
			l = sels.length;
			while( l-- ){
				for( tokens = sels[l], el = els[i], m = 0, n = tokens.length; m < n; m++ ){
					token = tokens[m];
					if( ( k = token.charAt(0) ) == ' ' ){
						m++;
						while( el = el.parentNode ) if( hit = compare( el, tokens[m] ) ) break;
					}else if( k == '>' ) hit = compare( el = el.parentNode, tokens[++m] );
					else if( k == '+' ){
						while( el = el.previousSibling ) if( el.nodeType == 1 ) break;
						hit = el && compare( el, tokens[++m] );
					}else if( k == '~' ){
						m++;
						while( (el = el.previousSibling) != null ){
							if( el.nodeType == 1 && compare( el, tokens[m] ) ){
								hit = 1;
								break;
							}
						}
					}else hit = compare( el, token );
					if( !hit ) break;
				}
				if( i == j - 1 ) tokens.length = 0, arrs[arrs._l++] = tokens;
				if( hit ) break;
			}
			if( i == j - 1 ) sels.length = 0, arrs[arrs._l++] = sels;
			if( hit ) r[r.length++] = els[i];
		}
		return r;
	};
};