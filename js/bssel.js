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

// bssel
var bssel = (function(){
'use strict';
var isQS, isClsName;
isQS = ( typeof document.querySelectorAll == 'function' ); // <= IE8
isClsName = ( typeof document.getElementsByClassName == 'function' );
var finder = (function(){
	var utrim, parseQuery, compareEl, rTag, rAlpha, rClsTagId, hasParent, nParent, nQS,
		oSel, ret, isIE, ieVer;
	oSel = [],
	ret = [],
	isIE = detect.browser == 'ie',
	ieVer = detect.browserVer,
	nQS = ' +~:[',
	nParent = ' >',
	rTag = /^[a-z]+[0-9]*$/i,
	rAlpha = /[a-z]/i,
	rClsTagId = /^[.#]?[a-z0-9]+$/i,
	utrim = (function(){
		var t = String.prototype.trim ? 1 : 0, trim = /^\s*|\s*$/g,
		f = function(v){
			var t0, t1, i;
			if( !v ) return v;
			t0 = typeof v;
			if( t0 == 'string' ) return t ? v.trim() : v.replace( trim, '' );
			if( v.splice ){
				t1 = [], i = v.length; while( i-- ) t1[i] = f(v[i]);
				return t1;
			}
			return v;
		};
		return f;
	})(),
	parseQuery = function(s){
		var tokens, token, key, i, t0, t1, f0;
		tokens = [],
		token = '',
		i = s.length;
		while( i-- ){
			key = s.charAt(i);
			if( nParent.indexOf(key) > -1 ) hasParent = 1;
			if( key == '[' || key == '(' ) f0 = 0;
			else if( key == ']' || key == ')' ){ f0 = 1;continue; }

			if( key != '*' && key != ' ' && key != ']' && key != '>' && key != '+' && key != '~' && key != '^' && key != '$' && key != '*' ){
				token = key + token;
			}
			if( ( key == '*' || key == ' ' || key == ']' || key == '>' || key == '+' || key == '~' || key == '^' || key == '$' || key == '*' ) && f0 ) token = key + token;
			else{
				if( key == ' ' ){
					if( tokens[tokens.length-1] == ' ' ) continue;
					if( token ) tokens.push(token), token = '';
					if( ( t0 = tokens[tokens.length-1] ) != '>' && t0 != '+' && t0 != '~' ) tokens.push(key);
				}else if( key == '*' || key == '>' || key == '+' || key == '~' ){
					if( utrim(token) ) tokens.push(token), token = '';
					if( tokens[tokens.length-1] == ' ' ) tokens.pop();
					tokens.push(key);
				}else if( key == '#' || key == '.' || key == ':' || key == '[' || !i ){
					if( token ) tokens.push(token), token = '';
				}else if( s.charAt(i-1) == ' ' ) tokens.push(token), token = '';
			}
		}
		//console.log(tokens);
		return tokens;
	},
	compareEl = (function(){
		var r0, setIdx, setLastIdx, setTypeIdx, setLastTypeIdx, i, j;
		r0 = /"|'/g, //"
		setIdx = function setIdx(pEl){
			var el, els, i, j, typeIdx;
			if( !pEl || pEl.tagName == 'HTML' ) return 0;
			els = pEl.childNodes,
			typeIdx = 1,
			i = 0, j = els.length;
			while( i < j ){
				el = els[i++];
				if( el.nodeType == 1 )
					el.bsRtime = finder.bsRtime,
					el.bsIdx = typeIdx++;
			}
			return 1;
		},
		setLastIdx = function setLastIdx(pEl){
			var el, els, i, typeIdx;
			if( !pEl || pEl.tagName == 'HTML' ) return 0;
			els = pEl.childNodes,
			typeIdx = 1,
			i = els.length;
			while( i-- ){
				el = els[i];
				if( el.nodeType == 1 )
					el.bsRtimeL = finder.bsRtime,
					el.bsIdxL = typeIdx++;
			}
			return 1;
		},
		setTypeIdx = function setTypeIdx(pEl, tagName){
			var el, els, i, j, typeIdx;
			if( !pEl || pEl.tagName == 'HTML' ) return 0;
			els = pEl.childNodes,
			typeIdx = 1,
			i = 0, j = els.length;
			while( i < j ){
				el = els[i++];
				if( el.nodeType == 1 && el.tagName == tagName )
					el.bsRtimeT = tagName + finder.bsRtime,
					el.bsIdxT = typeIdx++;
			}
			return 1;
		},
		setLastTypeIdx = function setLastTypeIdx(pEl, tagName){
			var el, els, i, typeIdx;
			if( !pEl || pEl.tagName == 'HTML' ) return 0;
			els = pEl.childNodes,
			typeIdx = 1,
			i = els.length;
			while( i-- ){
				el = els[i];
				if( el.nodeType == 1 && el.tagName == tagName )
					el.bsRtimeLT = tagName + finder.bsRtime,
					el.bsIdxLT = typeIdx++;
			}
			return 1;
		};
		return function(el, token){
			var key, val, opIdx, op, i, j, clsNm, elTagName, elIdx, pEl, t0;
			if( ( key = token.charAt(0) ) == '#' ){
				key = token.substr(1);
				if( key == el.id ) return 1;
			}else if( key == '.' ){
				if( !( clsNm = el.className ) ) return 0;
				key = token.substr(1);
				clsNm = clsNm.indexOf(' ') > -1 ? utrim( clsNm.split(' ') ) : [clsNm];
				for( i = clsNm.length; i--; )	if( key == clsNm[i] ) return 1;
				return 0;
			}else if( key == '[' ){
				// TODO:IE7 에서 A, SCRIPT, UL, LI 등의 요소에 기본 type 속성이 생성되어있는 문제 처리(아마 outerHTML으로 해결될지도?)
				// '<div abc=\'test="addbc"\' test="abc" test="abc1"><div test="def">'.match(/test=("[^<>"]*"|'[^<>']*'|)[^>]+>/i)
				key = token.substr(1);
				opIdx = key.indexOf('=');
				op = opIdx > -1 ? key.charAt(opIdx-1) : null;
				val = key.split('=');
				key = opIdx > -1 ? (op == '~' || op == '|' || op == '!' || op == '^' || op == '$' || op == '*' ? val[0].substring(0, opIdx-1) : val[0]) : key;
				val = opIdx > -1 ? val[1].replace(r0, ''):null;
				if( opIdx < 0 ){
					/*if( key == 'type' && isIE && ieVer < 9 ){
						if( !el.tagName == 'INPUT' && !el.outerHTML.match(/type=("[^<>"]*"|'[^<>']*'|)[^>]+>/i) ) return 0; //"
						else console.log( el.outerHTML );
					}*/
					if( el.getAttribute(key) !== null ) return 1;
				}else if( t0 = el.getAttribute(key) ){
					/*if( key == 'type' && isIE && ieVer < 9 ){
						if( !el.outerHTML.match(/type=("[^<>"]*"|'[^<>']*'|)[^>]+>/i) ) return 0; //"
						else el.outerHTML;
					}*/
					if( op == '~' ){ // list of space-separated values
						key = t0.split(' ');
						for( i = key.length; i--; ) if( key[i] == val ) return 1;
					}else if( op == '|' ){ // list of hyphen-separated values
						key = t0.split('-');
						for( i = key.length; i--; ) if( key[i] == val ) return 1;
					}else if( op == '^' ){ // begins exactly with
						return !t0.indexOf(val);
					}else if( op == '$' ){ // end exactly with
						return t0.lastIndexOf(val) == ( t0.length - val.length );
					}else if( op == '*' ){ // substring with
						return t0.indexOf(val) > -1;
					}else if( op == '!' ){
						return t0 !== val;
					}else{
						return t0 === val;
					}
				}
			}else if( key == ':' ){
				// TODO:pseudo 처리
				key = token.substr(1);
				val = ( opIdx = key.indexOf('(') ) > -1 ? isNaN( val = key.substr( opIdx+1 ) ) ? utrim(val) : Number( val ) : null;
				if( val ) key = key.substring( 0, opIdx );
				switch(key){
				case'link':
					if( el.tagName == 'A' && el.getAttribute('href') !== null ) return 1;
					break;
				case'active':case'visited':case'first-line':case'first-letter':case'hover':case'focus':
					break;
				case'root':
					if(el.tagName == 'HTML') return 1;
					break;
				case'first-of-type':
					elTagName = el.tagName,
					pEl = el.parentNode;
					if( !pEl.bsRtimeFCT || pEl.bsRtimeFCT != elTagName + finder.bsRtime ){
						pEl.bsRtimeFCT = elTagName + finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( j = op.length ) ){
							i = 0, pEl.bsFCTEl = null;
							while( i < j ){
								if( op[i].nodeType == 1 && op[i].tagName == elTagName ){
									pEl.bsFCTEl = op[i]; break;
								}
								i++;
							}
						}
					}
					return pEl.bsFCTEl == el;
					break;
				case'last-of-type':
					elTagName = el.tagName,
					pEl = el.parentNode;
					if( !pEl.bsRtimeLCT || pEl.bsRtimeLCT != elTagName + finder.bsRtime ){
						pEl.bsRtimeLCT = elTagName + finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( i = op.length ) ){
							pEl.bsLCTEl = null;
							while( i-- ){
								if( op[i].nodeType == 1 && op[i].tagName == elTagName ){
									pEl.bsLCTEl = op[i]; break;
								}
							}
						}
					}
					return pEl.bsLCTEl == el;
					break;
				case'nth-of-type':
					if( val == 'n' ) return 1;
					elTagName = el.tagName;
					if( !el.bsRtimeT || el.bsRtimeT != elTagName + finder.bsRtime ) setTypeIdx(el.parentNode, elTagName );
					elIdx = el.bsIdxT;
					if( val == 'even' || val == '2n' ) return elIdx%2 == 0;
					else if( val == 'odd' || val == '2n+1' ) return elIdx%2 == 1;
					else return elIdx == val;
					break;
				case'nth-last-of-type':
					if( val == 'n' ) return 1;
					elTagName = el.tagName;
					if( !el.bsRtimeLT || el.bsRtimeLT != elTagName + finder.bsRtime ) setLastTypeIdx(el.parentNode, elTagName );
					elIdx = el.bsIdxLT;
					if( val == 'even' || val == '2n' ) return elIdx%2 == 0;
					else if( val == 'odd' || val == '2n+1' ) return elIdx%2 == 1;
					else return elIdx == val;
					break;
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
					break;
				case'only-child':
					pEl = el.parentNode;
					if( !pEl.bsRtimeOCH || pEl.bsRtimeOCH != finder.bsRtime || !pEl.bsChElLen){
						pEl.bsRtimeOCH = finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( i = op.length ) ){
							opIdx = 0, val = null;
							while( i-- ){
								if( op[i].nodeType == 1 && opIdx++ ) val = op[i];
								if( opIdx > 2 ) break;
							}
							if( opIdx == 1 ) pEl.bsChEl = val;
						}
						pEl.bsChElLen = opIdx;
					}
					if( pEl.bsChElLen == 1 && pEl.bsChEl == el ){
						return 1;
					}
					return 0;
					break;
				case'first-child':
					pEl = el.parentNode;
					if( !pEl.bsRtimeFC || pEl.bsRtimeFC != finder.bsRtime ){
						pEl.bsRtimeFC = finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( j = op.length ) ){
							i = 0, pEl.bsFCEl = null;
							while( i < j ){
								if( op[i].nodeType == 1 ){
									pEl.bsFCEl = op[i]; break;
								}
								i++;
							}
						}
					}
					return pEl.bsFCEl == el;
					break;
				case'last-child':
					pEl = el.parentNode;
					if( !pEl.bsRtimeLC || pEl.bsRtimeLC != finder.bsRtime ){
						pEl.bsRtimeLC = finder.bsRtime,
						op = pEl && pEl.childNodes;
						if( op && ( i = op.length ) ){
							pEl.bsLCEl = null;
							while( i-- ){
								if( op[i].nodeType == 1 ){
									pEl.bsLCEl = op[i]; break;
								}
							}
						}
					}
					return pEl.bsLCEl == el;
					break;
				case'nth-child':
					if( val == 'n' ) return 1;
					if( !el.bsRtime || el.bsRtime != finder.bsRtime ) setIdx(el.parentNode);

					elIdx = el.bsIdx;
					if( val == 'even' || val == '2n' ) return elIdx%2 == 0;
					else if( val == 'odd' || val == '2n+1' ) return elIdx%2 == 1;
					else return elIdx == val;
					break;
				case'nth-last-child':
					if( val == 'n' ) return 1;
					if( !el.bsRtimeL || el.bsRtimeL != finder.bsRtime ) setLastIdx(el.parentNode);

					elIdx = el.bsIdxL;
					if( val == 'even' || val == '2n' ) return elIdx%2 == 0;
					else if( val == 'odd' || val == '2n+1' ) return elIdx%2 == 1;
					else return elIdx == val;
					break;
				case'empty':
					if( el.nodeType == 1 && !el.nodeValue && !el.childNodes.length ) return 1;
					return 0;
					break;
				case'checked':
					elTagName = el.tagName;
					if(
						( elTagName == 'INPUT' && (el.getAttribute('type') == 'radio' || el.getAttribute('type') == 'checkbox' ) && el.checked == true ) ||
						( elTagName == 'OPTION' && el.selected == true )
					) return 1;
					return 0;
					break;
				case'enabled':
					elTagName = el.tagName;
					if(
						(elTagName == 'INPUT' || elTagName == 'BUTTON' || elTagName == 'SELECT' || elTagName == 'OPTION' || elTagName == 'TEXTAREA') &&
						el.getAttribute('disabled') == null
					) return 1;
					return 0;
					break;
				case'disabled':
					elTagName = el.tagName;
					if(
						(elTagName == 'INPUT' || elTagName == 'BUTTON' || elTagName == 'SELECT' || elTagName == 'OPTION' || elTagName == 'TEXTAREA') &&
						el.getAttribute('disabled') != null
					) return 1;
					return 0;
					break;
				}
			}else{ // TAG 처리
				return token == el.tagName || token == '*';
			}
			return 0;
		};
	})();
	return function finder( $s, $doc ){
		var doc, nRet, el, els, sels, t0, i, j, k, m, n,
			tags, key, hit, token, tokens, l2r, hasQS;
		finder.bsRtime = +new Date(),
		doc = $doc || document,
		finder.lastQuery = $s;
		if( rClsTagId.test($s) ){
			if( ( key = $s.charAt(0) ) == '#' )
				return ret.length=0, ret[0] = doc.getElementById( $s.substr(1) ), ret;
			else if( key == '.' && isClsName )
				return doc.getElementsByClassName( $s.substr(1) );
			else if( rTag.test( $s ) )
				return doc.getElementsByTagName( $s );
		}
		oSel.length = 0,
		hasQS = 0,
		sels = utrim( $s.split(',') );
		for( i = sels.length; i--; ){
			t0 = parseQuery( sels[i] );
			for( j = t0.length; j--; ){
				if( rTag.test( t0[j] ) ) t0[j] = t0[j].toUpperCase();
				if( isQS && !hasQS && !nQS.indexOf( t0[j].charAt(0) ) > -1 ) hasQS = 1;
			}
			oSel.push( t0 );
		}
		if( hasQS ) return doc.querySelectorAll( $s );
		//console.log("### oSel", oSel);
		// TODO:native 처리
		if( oSel.length == 1 ){ // ,가 없을 경우
			if( ( key = oSel[0][0].charAt(0) ) == '#' ){
				els = [doc.getElementById( oSel[0][0].substr(1) )],
				oSel[0].shift();
			}
			else if( key == '.' && isClsName ){
				els = doc.getElementsByClassName( oSel[0][0].substr(1) ),
				oSel[0].shift();
			}
			else if( key == '[' || key == ':' ){
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
			else if( rTag.test( els = oSel[0][0] ) )
				els = doc.getElementsByTagName( els ),
				oSel[0].shift();
			else els = doc.getElementsByTagName('*');
		}else{
			els = doc.getElementsByTagName('*');
		}

		ret.length = 0;
		for( i = 0, j = els.length; i < j; i++ ){
			//hit = 0;
			for( k = oSel.length; k--; ){
				tokens = oSel[k];
				el = els[i];
				//if( !l2r ){ // 후방탐색
					for( m = 0, n = tokens.length; m < n; m++ ){
						//console.log('abc')
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
						//console.log(key);
					}
				/*}else{ // 전방탐색
					for( m = tokens.length; m--; ){
					}
				}*/
				if( hit ) break; // 여긴 OR 연산
			}
			if( hit ) ret[ret.length] = els[i];
		}
		return ret;
	};
})();
	finder.isQS = isQS;
	return finder;
})();



