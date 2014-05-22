/* bsSelector v0.2
 * Copyright (c) 2013 by ProjectBS Committe and contributors. 
 * http://www.bsplugin.com All rights reserved.
 * Licensed under the BSD license. See http://opensource.org/licenses/BSD-3-Clause
 * CSS3 & 4 참고자료
 * http://css4-selectors.com/browser-selector-test/
 * http://www.w3.org/TR/css3-selectors/
*/
var bsSelector = function( doc, trim, domData ){
	'use strict';
	var compare = {
		// id
		'#':function( el, token ){
			return token.substr(1) == el.id;
		},
		// class
		'.':function( el, token ){
			var t0, k;
			return !( t0 = el.className ) ? 0 : ( k = token.substr(1), t0.indexOf(' ') > -1 ? k == t0 : t0.split(' ').indexOf(k) > -1 );
		},
		// Attribute
		'[':(function(){
			var mT0 = {'~':1, '|':1, '!':1, '^':1, '$':1, '*':1};
			return function( el, token ){
				var t0, t1, i, v;
				if( ( i = token.indexOf('=') ) == -1 ) return el.getAttribute( token.substr(1) ) === null ? 0 : 1;
				if( ( t0 = el.getAttribute( token.substring( 1, i - ( mT0[t1 = token.charAt( i - 1 )] ? 1 : 0 ) ) ) ) === null ) return;
				v = token.substr( i + 1 );
				switch( t1 ){
				case'~':return t0.split(' ').indexOf(v) > -1;
				case'|':return t0.split('-').indexOf(v) > -1;
				case'^':return t0.indexOf(v) == 0;
				case'$':return t0.lastIndexOf(v) == ( t0.length - v.length );
				case'*':return t0.indexOf(v) > -1;
				case'!':return t0 !== v;
				default:return t0 === v;
				}
			};
		})(),
		// pseudo
		':':(function( trim, domData ){
			var mTag = {'first-of-type':1, 'last-of-type':1, 'only-of-type':1},
			nChild = {'first-child':'firstElementChild', 'last-child':'lastElementChild'},
			enabled = {INPUT:1, BUTTON:1, SELECT:1, OPTION:1, TEXTAREA:1},
			checked = {INPUT:1, radio:1, checkbox:1, OPTION:2},
			skip ={'target':1, 'active':1, 'visited':1, 'first-line':1, 'first-letter':1, 'hover':1, 'focus':1, 'after':1, 'before':1, 'selection':1,
				'eq':1, 'gt':1, 'lt':1,
				'valid':1, 'invalid':1, 'optional':1, 'in-range':1, 'out-of-range':1, 'read-only':1, 'read-write':1, 'required':1
			};
			return function filters( el, token ){
				var parent, childs, tag, dir, t0, t1, t2, k, v, i, j, m, dd, tname, ename, lname;
				k = token.substr(1), i = k.indexOf('('), v = i > -1 ? isNaN( t0 = k.substr( i + 1 ) ) ? t0.replace( trim, '' ) : parseFloat(t0) : null;
				if( v ) k = k.substring( 0, i );
				if( skip[k] ) return;
				switch( k ){
				case'link':return el.tagName == 'A' && el.getAttribute('href');
				case'root':return el.tagName == 'HTML';
				case'lang':return el.getAttribute('lang') == v;
				case'empty':return el.nodeType == 1 && !el.nodeValue && !el.childNodes.length;
				case'checked':return t0 = checked[el.tagName], ( t0 == 1 && el.checked && checked[el.getAttribute('type')] ) || ( t0 == 2 && el.selected );
				case'enabled':return enabled[el.tagName] && ( ( t0 = el.getAttribute('disabled') ) == null || t0 == '' );
				case'disabled':return enabled[el.tagName] && ( ( t0 = el.getAttribute('disabled') ) != null && t0 != '' );
				case'contains':return ( el.innerText || el.textContent || '' ).indexOf(v) > -1;
				case'not':
					switch( v.charAt(0) ){
					case'#':return v.substr(1) != el.id;
					case'.':return !( !( t0 = el.className ) ? 0 : ( t1 = v.substr(1), t0.indexOf(' ') < 0 ? t1 == t0 : t0.split(' ').indexOf(t1) > -1 ) );
					default:return v != el.tagName && v != '*';
					}
					return 0;
				case'first-child':case'first-of-type':dir = 1;case'last-child':case'last-of-type':
					if( isElCld && ( t1 = nChild[k] ) ) return el.parentNode[t1] == el;
					dd = domData( parent = el.parentNode ), tag = el.tagName;
					(t1 = mTag[k]) ? dir ? ( tname = 'DQseqFCT', ename = 'DQFCTEl' ) : ( tname = 'DQseqLCT', ename = 'DQLCTEl' ):
						dir ? ( tname = 'DQseqFC', ename = 'DQFCEl' ) : ( tname = 'DQseqLC', ename = 'DQLCEl' );
					if( !dd[tname] || dd[tname] != ( t1 ? tag : '' ) + bsRseq ){
						if( ( childs = isElCld ? parent.children : parent.childNodes ) && ( i = j = childs.length ) ){
							m = 0;
							while( i-- ){
								t0 = childs[dir ? j - i - 1 : i];
								if( ( isElCld ? 1 : t0.nodeType == 1 ) && ( t1 ? tag == t0.tagName : 1 ) && !m++ ){
									dd[tname] = ( t1 ? tag : '' ) + bsRseq,
									dd[ename] = t0;break;
								}
							}
						}
					}
					return dd[ename] == el;
				case'only-of-type':case'only-child':
					if( isElCld && k == 'only-child' ) return el.parentNode.children.length == 1;
					dd = domData( parent = el.parentNode ),
					t1 = mTag[k], tag = el.tagName;
					k == 'only-of-type' ? ( tname = 'DQseqOT', lname = 'DQTChElLen' ) : ( tname = 'DQseqOCH', lname = 'DQChElLen' );
					if( !dd[tname] || dd[tname] != ( t1 ? tag : '' ) + bsRseq ){
						if( ( childs = isElCld ? parent.children : parent.childNodes ) && ( i = childs.length ) ){
							m = 0;
							while( i-- ){
								t0 = childs[i];
								if( ( isElCld ? 1 : t0.nodeType == 1 ) && ( t1 ? tag == t0.tagName : 1 ) && !m++ );
							}
							dd[tname] = ( t1 ? tag : '' ) + bsRseq,
							dd[lname] = m;
						}
					}
					return dd[lname] == 1;
				default:
					if( !( parent = el.parentNode ) || parent.tagName == 'HTML' || !( childs = isElCld ? parent.children : parent.childNodes ) || !( j = i = childs.length ) )
						return;
					if( v == 'n' ) return 1;
					t1 = 1, dd = domData(el);
					switch( k ){
					case'nth-child':
						if( !dd.DQseq || dd.DQseq != bsRseq ){
							for( i = 0; i < j; i++ ){
								t0 = childs[i];
								if( isElCld ? 1 : t0.nodeType == 1 ){
									( t2 = domData(t0) ).DQseq = bsRseq,
									t2.DQindex = t1++;
								}
							}
						}
						return t0 = dd.DQindex, v == 'even' || v == '2n' ? t0 % 2 == 0 :
						v == 'odd' || v == '2n+1' ? t0 % 2 == 1 :
						t0 == v;
					case'nth-last-child':
						if( !dd.DQseqL || dd.DQseqL != bsRseq ){
							while( i-- ){
								t0 = childs[i];
								if( isElCld ? 1 : t0.nodeType == 1 ){
									( t2 = domData(t0) ).DQseqL = bsRseq,
									t2.DQindexL = t1++;
								}
							}
						}
						return t0 = dd.DQindexL, v == 'even' || v == '2n' ? t0 % 2 == 0 :
						v == 'odd' || v == '2n+1' ? t0 % 2 == 1 :
						t0 == v;
					case'nth-of-type':
						tag = el.tagName;
						if( !dd.DQseqT || dd.DQseqT != tag + bsRseq ){
							for( i = 0; i < j; i++ ){
								t0 = childs[i];
								if( ( isElCld ? 1 : t0.nodeType == 1 ) && t0.tagName == tag ){
									( t2 = domData(t0) ).DQseqT = tag + bsRseq,
									t2.DQindexT = t1++;
								}
							}
						}
						return t0 = dd.DQindexT, v == 'even' || v == '2n' ? t0 % 2 == 0 :
						v == 'odd' || v == '2n+1' ? t0 % 2 == 1 :
						t0 == v;
					case'nth-last-of-type':
						tag = el.tagName;
						if( !dd.DQseqTL || dd.DQseqTL != tag + bsRseq ){
							while( i-- ){
								t0 = childs[i];
								if( ( isElCld ? 1 : t0.nodeType == 1 ) && t0.tagName == tag ){
									( t2 = domData(t0) ).DQseqTL = tag + bsRseq,
									t2.DQindexTL = t1++;
								}
							}
						}
						return t0 = dd.DQindexTL, v == 'even' || v == '2n' ? t0 % 2 == 0 :
						v == 'odd' || v == '2n+1' ? t0 % 2 == 1 :
						t0 == v;
					}
				}//
			};
		})( trim, domData || (function(){
				var id = 1, data = {};
				return function domData( el, k, v ){
					var t0;
					if( !( t0 = el['data-bs'] ) ) el['data-bs'] = t0 = id++, data[t0] = {};
					return k == undefined ? data[t0] : v == undefined ? data[t0][k] : v === null ? delete data[t0][k] : ( data[t0][k] = v );
				};
			})() )
	},
	rTag = /^[a-z]+[0-9]*$/i, rAlpha = /[a-z]/i, rClsTagId = /^[.#]?[a-z0-9]+$/i,
	DOC = document, tagName = {}, clsName = {},
	className = (function( tagName, clsName ){
		var reg = {}, r = [];
		return DOC['getElementsByClassName'] ? function(cls){
			return clsName[cls] || ( clsName[cls] = DOC.getElementsByClassName(cls) );
		} : function(cls){
			var t0 = tagName['*'] || ( tagName['*'] = DOC.getElementsByTagName('*') ), t1 = r[cls] || ( r[cls] = new RegExp( '\\b' + cls + '\\b', 'g' ) ), i = t0.length;
			r.length = 0;
			while( i-- ) if( t1.test( t0[i].className ) ) r[r.length++] = t0[i];
			return r;
		};
	})( tagName, clsName ),
	bsRseq = 0,
	navi,
	chrome = ( navi = window['navigator'].userAgent.toLowerCase() ).indexOf('chrome') > -1 || navi.indexOf('crios') ? 1 : 0,
	mQSA = {' ':1,'+':1,'~':1,':':1,'[':1},
	mParent = {' ':1, '>':1}, mBracket = {'[':1, '(':1, ']':2, ')':2},
	mEx = {' ':1, '*':1, ']':1, '>':1, '+':1, '~':1, '^':1, '$':1},
	mT0 = {' ':1, '*':2, '>':2, '+':2, '~':2, '#':3, '.':3, ':':3, '[':3}, mT1 = {'>':1, '+':1, '~':1},
	R = [], arrs = {_l:0},
	aPsibl = ['previousSibling', 'previousElementSibling'],
	tEl = DOC.createElement('ul'), isElCld, isQSA;
	if( !Array.prototype.indexOf ) Array.prototype.indexOf = function( v, I ){
		var i, j, k, l;
		if( j = this.length ) for( I = I || 0, i = I, k = parseInt( ( j - i ) * .5 ) + i + 1, j--; i < k; i++ ) if( this[l = i] === v || this[l = j - i + I] === v ) return l;
		return -1;
	};
	tEl.innerHTML = '<li>1</li>',
	isElCld = tEl['firstElementChild'] && tEl['lastElementChild'] && tEl['children'] ? 1 : 0,
	isQSA = isElCld && DOC['querySelectorAll'] ? 1 : 0;
	return function selector( query, doc, r ){
		var sels, sel,
			hasParent, hasQSAErr, hasQS,
			t0, t1, t2, t3, i, j, k, l, m, n,
			el, els, hit, token, tokens;

		if( !r ) r = R;
		r.length = 0, doc ? ( DOC = doc ) : ( doc = DOC );
		if( rClsTagId.test(query) ) switch( query.charAt(0) ){
			case'#':return r[r.length++] = doc.getElementById(query.substr(1)), r;
			case'.':return className(query.substr(1));
			default:return tagName[query] || ( tagName[query] = doc.getElementsByTagName(query) );
		}
		if( chrome && isQSA ){
			if( ( t0 = query.toLowerCase() ).indexOf(':contains') < 0 && t0.indexOf('!') < 0 ){
				return doc.querySelectorAll(query);
			}
		}
		if( isQSA && ( i = query.indexOf(',') ) > -1 && query.indexOf('!') < 0 ) return doc.querySelectorAll(query);
		if( i == -1 ) sels = arrs._l ? arrs[--arrs._l] : [], sels[0] = query, i = 1;
		else sels = query.split(','), i = sels.length;
		while( i-- ){
			t0 = arrs._l ? arrs[--arrs._l] : [], t1 = '', sel = sels[i].replace( trim, '' ), m = 0, j = sel.length;
			while( j-- ){
				k = sel.charAt(j);
				if( hasParent || mParent[k] ) hasParent = 1;
				if( m == 2 && k == '!' ) hasQSAErr = 1;
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
					if( !( t1 = t0[j] ).toLowerCase().indexOf( ':contains(' ) ){
						hasQSAErr = 1; continue;
					}else{
						t0[j] = t1;
						if( ( t1 == ':nth-child(n' || t1 == ':nth-last-child(n' ) && t0.length != 1 ){
							hasQSAErr = 1, t0.splice( j, 1 ); continue;
						}
					}
				}
				if( isQSA && !hasQS && !mQSA[t0[j].charAt(0)] ) hasQS = 1;
			}
			sels[i] = t0;
		}
		if( hasQSAErr ) hasQS = 0;
		if( sels.length == 1 ){
			t0 = sels[0][0];
			if( ( k = t0.charAt(0) ) == '#' ) els = arrs._l ? arrs[--arrs._l] : [], els[0] = doc.getElementById(t0.substr(1)), sels[0].shift();
			else if( k == '.' ){
				els = className(t0.substr(1)), sels[0].shift();
				if( hasQS && els.length > 100 ) return doc.querySelectorAll(query);
			}else if( k == '[' || k == ':' ){
				if( hasQS ) return doc.querySelectorAll(query);
				if( !hasParent ){
					t0 = sels[0][sels[0].length - 1], k = t0.charAt(0);
					if( k == '#' ) sels[0].pop(), els = arrs._l ? arrs[--arrs._l] : [], els[0] = doc.getElementById( t0.substr(1) );
					else if( k == '.' ) sels[0].pop(), els = className( t0.substr(1) );
					else if( rTag.test(t0) ) sels[0].pop(), els = tagName[t0] || ( tagName[t0] = doc.getElementsByTagName(t0) );
				}
			}else if( rTag.test(t0) ){
				sels[0].shift(), els = tagName[t0] || ( tagName[t0] = doc.getElementsByTagName(t0) );
				if( hasQS && els.length > 100 ) return doc.querySelectorAll(query);
			}
		}
		if( !els ) els = tagName['*'] || ( tagName['*'] = doc.getElementsByTagName('*') );
		if( !sels[0].length ) return arrs[arrs._l++] = sels[0], sels.length = 0, arrs[arrs._l++] = sels, els;
		bsRseq++;
		for( i = 0, j = els.length; i < j; i++ ){
			l = sels.length;
			while( l-- ){
				el = els[i];
				for( tokens = sels[l], m = 0, n = tokens.length; m < n; m++ ){
					token = tokens[m], hit = 0;
					if( ( k = token.charAt(0) ) == ' ' ){
						m++;
						while( el = el.parentNode )
							if( hit = ( ( t0 = compare[tokens[m].charAt(0)] ) ? t0( el, tokens[m] ) : ( tokens[m] == el.tagName || tokens[m] == '*' ) ) ) break;
					}else if( k == '>' )
						hit = ( ( t0 = compare[tokens[++m].charAt(0)] ) ? t0( el = el.parentNode, tokens[m] ) :
						( tokens[m] == ( el = el.parentNode ).tagName || tokens[m] == '*' ) );
					else if( k == '+' ){
						while( el = el[aPsibl[isElCld]] ) if( ( isElCld ? 1 : el.nodeType == 1 ) ) break;
						hit = el && ( ( t0 = compare[tokens[++m].charAt(0)] ) ? t0( el, tokens[m] ) : ( tokens[m] == el.tagName || tokens[m] == '*' ) );
					}else if( k == '~' ){
						m++;
						while( el = el[aPsibl[isElCld]] ){
							if( ( isElCld ? 1 : el.nodeType == 1 ) && ( ( t0 = compare[tokens[m].charAt(0)] ) ? t0( el, tokens[m] ) : ( tokens[m] == el.tagName || tokens[m] == '*' ) ) ){
								hit = 1; break;
							}
						}
					}else hit = ( ( t0 = compare[token.charAt(0)] ) ? t0( el, token ) : ( token == el.tagName || token == '*' ) );
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
var query = bsSelector( document, /^\s*|\s*$/g );