/* bsJS - OpenSource JavaScript library version 0.3.0 / 2013.12.25 by projectBS committee
 * Copyright 2013.10 projectBS committee.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * GitHub-http://goo.gl/FLI7te Facebook group-http://goo.gl/8s5qmQ
 */
/*
	bsSelector 농부 백승현(https://www.facebook.com/pekuid)
	bsDetect가 있어야 합니다.
	https://github.com/projectBS/bsDetect/blob/gh-pages/js/detect.js
	http://projectbs.github.io/bsDetect/js/detect.js
	CSS3 & 4 참고자료
	http://css4-selectors.com/browser-selector-test/
	http://kimblim.dk/css-tests/selectors/
*/

var detect = DETECT(window, document);
var domData = (function(){
	var id = 1, data = {};
	return function( el, k, v ){
		var t0;
		if( !( t0 = el['data-bs'] ) ) el['data-bs'] = t0 = id++, data[t0] = {};
		return k == undefined ? data[t0] : v == undefined ? data[t0][k] : v === null ? delete data[t0][k] : ( data[t0][k] = v );
	};
})()

// bsSelector
var bsSelector = (function( doc, trim ){
'use strict';
	var isQSA = doc['querySelectorAll'] ? 1 : 0, isClsName = doc['getElementsByClassName'] ? 1 : 0,
		isIE = detect.browser == 'ie' ? 1 : 0, ieVer = detect.browserVer,
		rTag = /^[a-z]+[0-9]*$/i, rAlpha = /[a-z]/i, rClsTagId = /^[.#]?[a-z0-9]+$/i,
		tokenize, compare, query, hasParent, hasQSAErr, oSel;
		
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
				else{
					if( ( t0 = mT0[k] ) == 1 ){
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
			}
			return tks;
		};
	})(trim),
	compare = (function(){
		var r0 = /"|'/g, i, j, setIdx = function( pEl, dir, tagName ){
			var els, el, tname, iname, t0, i, j = 1;
			if( !pEl || pEl.tagName == 'HTML' ) return 0;
			tname = 'DQtime' + ( tagName ? 'T' : '' ) + ( dir ? 'L' : '' ), iname = 'DQindex' + ( tagName ? 'T' : '' ) + ( dir ? 'L' : '' ),
			els = pEl.childNodes, i = els.length;
			while( i-- ){
				el = els[i];
				if( el.nodeType == 1 && ( !tagName || el.tagName == tagName ) ) ( t0 = domData(el) )[tname] = ( tagName || '' ) + finder.bsRtime, t0[iname] = dir ? i + 1 : j++;
			}
			return 1;
		}, mT0 = {'~':1, '|':1, '!':1, '^':1, '$':1, '*':1};
		return function( el, token ){
			var key, val, opIdx, op, i, j, clsNm, elTagName, elIdx, pEl, t0, tname, ename;
			if( ( key = token.charAt(0) ) == '#' ) return token.substr(1) == el.id;
			else if( key == '.' ){
				if( !( clsNm = el.className ) ) return 0;
				return key = token.substr(1), clsNm.indexOf(' ') > -1 ? key == clsNm : clsNm.split(' ').indexOf(key) > -1;
			}else if( key == '[' ){
				// TODO:IE7 에서 A, SCRIPT, UL, LI 등의 요소에 기본 type 속성이 생성되어있는 문제 처리(아마 outerHTML으로 해결될지도?)
				key = token.substr(1), opIdx = key.indexOf('=');
				if( opIdx < 0 ) return el.getAttribute(key) !== null;
					/*if( key == 'type' && isIE && ieVer < 9 ){
						if( !el.tagName == 'INPUT' && !el.outerHTML.match(/type=("[^<>"]*"|'[^<>']*'|)[^>]+>/i) ) return 0; //"
						else console.log( el.outerHTML );
					}*/
				else if( t0 = el.getAttribute(key) ) return op = opIdx > -1 ? key.charAt( opIdx - 1 ) : null,
					val = key.split('='),
					key = opIdx > -1 ? mT0[op] ? val[0].substring( 0, opIdx - 1 ) : val[0] : key,
					val = opIdx > -1 ? val[1].replace( r0, '' ) : null,
					op == '~' ? t0.split(' ').indexOf(val) > -1 :// list of space-separated values
					op == '|' ? t0.split('-').indexOf(val) > -1 :// list of hyphen-separated values
					op == '^' ? !t0.indexOf(val) :// begins exactly with
					op == '$' ? t0.lastIndexOf(val) == ( t0.length - val.length ) :// end exactly with
					op == '*' ? t0.indexOf(val) > -1 :// substring with
					op == '!' ? t0 !== val :
					t0 === val;
					/*if( key == 'type' && isIE && ieVer < 9 ){
						if( !el.outerHTML.match(/type=("[^<>"]*"|'[^<>']*'|)[^>]+>/i) ) return 0; //"
						else el.outerHTML;
					}*/
			}else if( key == ':' ){
				key = token.substr(1),
				val = ( opIdx = key.indexOf('(') ) > -1 ? isNaN( val = key.substr( opIdx + 1 ) ) ? val.replace( trim, '' ) : parseFloat(val) : null;
				if( val ) key = key.substring( 0, opIdx );
				switch(key){
				case'link':
					if( el.tagName == 'A' && el.getAttribute('href') !== null ) return 1;
					break;
				case'active':case'visited':case'first-line':case'first-letter':case'hover':case'focus':break;
				case'root':
					if(el.tagName == 'HTML') return 1;
					break;
				case'first-of-type':case'last-of-type':
					elTagName = el.tagName, pEl = el.parentNode, t0 = domData(el), 
					key.charAt(0) == 'f' ? ( tname = 'DQtimeFCT', ename = 'DQFCTEl' ) : ( tname = 'DQtimeLCT', ename = 'DQLCTEl' );
					if( !t0[tname] || t0[tname] != elTagName + finder.bsRtime ){
						t0[tname] = elTagName + finder.bsRtime;
						if( ( op = pEl && pEl.childNodes ) && ( i = op.length ) ){
							t0[ename] = null;
							if( key.charAt(0) == 'f' ){
								for( j = i, i = 0 ; i < j ; i++ ){
									if( op[i].nodeType == 1 && op[i].tagName == elTagName ){
										t0[ename] = op[i];
										break;
									}
								}
							}else{
								while( i-- ){
									if( op[i].nodeType == 1 && op[i].tagName == elTagName ){
										t0[ename] = op[i];
										break;
									}
								}
							}
						}
					}
					return t0[ename] == el;
				case'nth-of-type':case'nth-last-of-type':
					if( val == 'n' ) return 1;
					elTagName = el.tagName, t0 = domData(el),
					key == 'nth-of-type' ? ( tname = 'DQtimeT', ename = 'DQindexT' ) : ( tname = 'DQtimeTL', ename = 'DQindexTL' );
					if( !t0[tname] || t0[tname] != elTagName + finder.bsRtime ) setIdx( el.parentNode, key == 'nth-of-type' ? 1 : 0, elTagName );
					elIdx = t0[ename];
					return val == 'even' || val == '2n' ? elIdx % 2 == 0 :
						val == 'odd' || val == '2n+1' ? elIdx % 2 == 1 :
						elIdx == val;
				case'only-of-type':
					op = el.parentNode && el.parentNode.childNodes;
					if( op && ( j = op.length ) ){
						i = 0, opIdx = 0, elTagName = el.tagName;
						while( i < j ){
							if( op[i].nodeType == 1 && elTagName != 'HTML' && elTagName == op[i].tagName && ++opIdx && (val = op[i]) && opIdx > 1 ) return 0;
							i++;
						}
						if( opIdx == 1 && el == val ) return 1;
					}
					return 0;
				case'only-child':
					pEl = el.parentNode, t0 = domData(el);
					if( !t0.DQtimeOCH || t0.DQtimeOCH != finder.bsRtime || !t0.DQChElLen ){
						t0.DQtimeOCH = finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( i = op.length ) ){
							opIdx = 0, val = null;
							while( i-- ){
								if( op[i].nodeType == 1 && opIdx++ ) val = op[i];
								if( opIdx > 2 ) break;
							}
							if( opIdx == 1 ) t0.DQChEl = val;
						}
						t0.DQChElLen = opIdx;
					}
					return t0.DQChElLen == 1 && t0.DQChEl == el;
				case'first-child':case'last-child':
					pEl = el.parentNode, t0 = domData(el),
					key == 'first-child' ? ( tname = 'DQtimeFC', ename = 'DQFCEl' ) : ( tname = 'DQtimeLC', ename = 'DQLCEl' );
					if( !t0[tname] || t0[tname] != finder.bsRtime ){
						t0[tname] = finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( j = op.length ) ){
							t0[ename] = null;
							if( key.charAt(0) == 'f' ){
								for( j = i, i = 0 ; i < j ; i++ ){
									if( op[i].nodeType == 1 ){
										t0[ename] = op[i];
										break;
									}
								}
							}else{
								while( i-- ){
									if( op[i].nodeType == 1 ){
										t0[ename] = op[i];
										break;
									}
								}
							}
						}
					}
					return t0[ename] == el;
				case'nth-child':
					t0 = domData(el),
					key == 'nth-child' ? ( tname = 'DQtime', ename = 'DQindex' ) : ( tname = 'DQtimeL', ename = 'DQindexL' );
					if( val == 'n' ) return 1;
					if( !t0[tname] || t0[tname] != finder.bsRtime ) setIdx( el.parentNode, 1 );
					elIdx = t0[ename];
					return val == 'even' || val == '2n' ? elIdx % 2 == 0 :
						val == 'odd' || val == '2n+1' ? elIdx % 2 == 1 :
						elIdx == val;
				case'empty':return el.nodeType == 1 && !el.nodeValue && !el.childNodes.length;
				case'checked':
					return elTagName = el.tagName, ( elTagName == 'INPUT' && (el.getAttribute('type') == 'radio' || el.getAttribute('type') == 'checkbox' ) && el.checked == true ) ||
						( elTagName == 'OPTION' && el.selected == true );
				case'enabled':
					return elTagName = el.tagName, (elTagName == 'INPUT' || elTagName == 'BUTTON' || elTagName == 'SELECT' || elTagName == 'OPTION' || elTagName == 'TEXTAREA') &&
						el.getAttribute('disabled') == null;
				case'disabled':
					return elTagName = el.tagName, (elTagName == 'INPUT' || elTagName == 'BUTTON' || elTagName == 'SELECT' || elTagName == 'OPTION' || elTagName == 'TEXTAREA') &&
						el.getAttribute('disabled') != null
				}
			}else return token == el.tagName || token == '*';// TAG 처리
			return 0;
		};
	})();
	finder = function( query, doc, ret ){
		var el, els, sels, t0, i, j, k, m, n,
			tags, key, hit, token, tokens, hasQS;
		if( ret ) ret.length = 0;
		else ret = [];
		doc = doc || document,
		finder.bsRtime = +new Date(),
		finder.lastQuery = query;
		if( rClsTagId.test(query) ){
			if( ( key = query.charAt(0) ) == '#' )
				return ret[0] = doc.getElementById( query.substr(1) ), ret;
			else if( key == '.' && isClsName )
				return doc.getElementsByClassName( query.substr(1) );
			else if( rTag.test( query ) )
				return doc.getElementsByTagName( query );
		}
		if( isQSA && query.indexOf(',') > -1 && query.indexOf('!') < 0 ) return doc.querySelectorAll( query );
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
	finder.isQSA = isQSA;
	return finder;
})( document, /^\s*|\s*$/g );