/*
	bs selector 백승현
	bs Core가 있어야 합니다.
	http://css4-selectors.com/browser-selector-test/
	http://kimblim.dk/css-tests/selectors/
*/
var bs = {};
bs.trim = (function(){
	var t = String.prototype.trim ? 1 : 0, trim = /^\s*|\s*$/g,
	f = function(v){
		var t0, i;
		if( !v ) return v;
		t0 = typeof v;
		if( t0 == 'string' ) return t ? v.trim() : v.replace( trim, '' );
		if( t0 == 'object' ){
			if( v.splice ){t0 = [], i = v.length; while( i-- ) t0[i] = f(v[i]);}
			else{t0 = {}; for( i in v ) if( v.hasOwnProperty(i) ) t0[i] = f(v[i]);}
			return t0;
		}
		return v;
	};
	return f;
})();
var bssel = (function(){
'use strict';
var isQS;
isQS = ( typeof document.querySelectorAll == 'function' ); // <= IE8
var echo = function(target, filter, parentName) {
	var k;
	if (parentName && (typeof parentName != "string" || typeof parentName == "string" && (parentName.split(".").length + parentName.split("]").length) > 3)) return;
	if (!filter) filter = "";
	if (target === null || target === undefined) {
		console.log(((parentName) ? parentName + "." : "") + target);
		return;
	}
	if (typeof target != "object") {
		if (typeof target == filter || filter === "")
			console.log(((parentName) ? parentName + "." : "") + target + "["+ typeof target +"]");
		return;
	}
	(target instanceof Array) ? console.log(((parentName) ? parentName + ":" : "") + "[Array["+ target.length + "]]") : console.log(((parentName) ? parentName + ":" : "") + "[Object]");
	for (k in target) {
		if (target instanceof Array) {
			if (typeof target[k] == "object")
				echo(target[k], filter, ((parentName) ? parentName + "[" : "[") + k + ((parentName) ? "]" : "]"));
			else if (typeof target[k] == filter || filter === "")
				console.log(((parentName) ? parentName + "[" : "[") + k + ((parentName) ? "]" : "]") + ":" + target[k] + " ("+ typeof target[k] +")");
		} else {
			if (typeof target[k] == "object")
				echo(target[k], filter, ((parentName) ? parentName + "." : "")+k);
			else if (typeof target[k] == filter || filter === "")
				console.log(((parentName) ? parentName + "." : "") + k + ":" + target[k] + " ("+ typeof target[k] +")");
		}
	}
};

// 본체
var finder = (function(){
	var parseQuery, compareEl, rTag, rAlpha, rClId, hasParent, nParent;

	nParent = ' >',
	rTag = /^[a-z]+[0-9]*$/i,
	rAlpha = /[a-z]/i,
	rClId = /^[.#]?[a-z0-9]+$/i,
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
					if( bs.trim(token) ) tokens.push(token), token = '';
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
		var r0, _nthOf, _lastNthOf, _nthOfType, _lastNthOfType;
		r0 = /"|'/g, //"
		_nthOf = function _nthOf(el, nth){
			var typeIdx, i, j, pEl;
			if( el.nodeType != 1 || !( pEl = el.parentNode && el.parentNode.childNodes ) || !pEl.length ) return 0;
			//if( !_bNth( el ) ) return 0;
			i = 0, typeIdx = 0, j = pEl.length;
			while( i < j ){
				if( pEl[i].nodeType == 1 && pEl[i].tagName != 'HTML' ){
					++typeIdx;
					if( el == pEl[i] ){
						if( nth == 'even' || nth == '2n' ) return typeIdx%2 == 0;
						else if( nth == 'odd' || nth == '2n+1' ) return typeIdx%2 == 1;
						else if( nth == 'n' ) return 1;
						else return typeIdx == nth;
					}
				}
				i++;
			}
			return 0;
		},
		_lastNthOf = function(el, nth){
			var typeIdx, i, pEl;
			if( el.nodeType != 1 || !( pEl = el.parentNode && el.parentNode.childNodes ) || !pEl.length ) return 0;
			i = pEl.length, typeIdx = 0;
			while( i-- ){
				if( pEl[i].nodeType == 1 && pEl[i].tagName != 'HTML' ){
					++typeIdx;
					if( el == pEl[i] ){
						if( nth == 'even' || nth == '2n' ) return typeIdx%2 == 0;
						else if( nth == 'odd' || nth == '2n+1' ) return typeIdx%2 == 1;
						else if( nth == 'n' ) return 1;
						else return typeIdx == nth;
					}
				}
			}
			return 0;
		},
		_nthOfType = function _nthOfType(el, nth){
			var typeIdx, i, j, pEl;
			if( el.nodeType != 1 || !( pEl = el.parentNode && el.parentNode.childNodes ) || !pEl.length ) return 0;
			i = 0, typeIdx = 0, j = pEl.length;
			while( i < j ){
				if( pEl[i].nodeType == 1 && pEl[i].tagName != 'HTML' && el.tagName == pEl[i].tagName ){
					++typeIdx;
					if( el == pEl[i] ){
						if( nth == 'even' || nth == '2n' ) return typeIdx%2 == 0;
						else if( nth == 'odd' || nth == '2n+1' ) return typeIdx%2 == 1;
						else if( nth == 'n' ) return 1;
						else return typeIdx == nth;
					}
				}
				i++;
			}
			return 0;
		},
		_lastNthOfType = function _lastNthOfType(el, nth){
			var typeIdx, i, pEl;
			if( el.nodeType != 1 || !( pEl = el.parentNode && el.parentNode.childNodes ) || !pEl.length ) return 0;
			i = pEl.length, typeIdx = 0;
			while( i-- ){
				if( pEl[i].nodeType == 1 && pEl[i].tagName != 'HTML' && el.tagName == pEl[i].tagName ){
					++typeIdx;
					if( el == pEl[i] ){
						if( nth == 'even' || nth == '2n' ) return typeIdx%2 == 0;
						else if( nth == 'odd' || nth == '2n+1' ) return typeIdx%2 == 1;
						else if( nth == 'n' ) return 1;
						else return typeIdx == nth;
					}
				}
			}
			return 0;
		};
		return function(el, token){
			var key, val, opIdx, op, i, j, clsNm;
			if( ( key = token.charAt(0) ) == '#' ){
				key = token.substr(1);
				if( key == el.id ) return 1;
			}else if( key == '.' ){
				if( !( clsNm = el.className ) ) return 0;
				key = token.substr(1);
				clsNm = clsNm.indexOf(' ') > -1 ? bs.trim( clsNm.split(' ') ) : [clsNm];
				for( i = clsNm.length; i--; )	if( key == clsNm[i] ) return 1;
				return 0;
			}else if( key == '[' ){
				// TODO:IE7 에서 A, SCRIPT, UL, LI 등의 요소에 기본 type 속성이 생성되어있는 문제 처리(아마 outerHTML으로 해결될지도?)
				key = token.substr(1);
				opIdx = key.indexOf('=');
				op = opIdx > -1 ? key.charAt(opIdx-1) : null;
				val = key.split('=');
				key = opIdx > -1 ? (op == '~' || op == '|' || op == '!' || op == '^' || op == '$' || op == '*' ? val[0].substring(0, opIdx-1) : val[0]) : key;
				val = opIdx > -1 ? val[1].replace(r0, ''):null;
				if( opIdx < 0 ){
					if( el.getAttribute(key) !== null ) return 1;
				}else if( key = el.getAttribute(key) ){
					if( op == '~' ){ // list of space-separated values
						key = key.split(' ');
						for( i = key.length; i--; ) if( key[i] == val ) return 1;
					}else if( op == '|' ){ // list of hyphen-separated values
						key = key.split('-');
						for( i = key.length; i--; ) if( key[i] == val ) return 1;
					}else if( op == '^' ){ // begins exactly with
						return !key.indexOf(val);
						//if( !key.indexOf(val) ) return 1;
					}else if( op == '$' ){ // end exactly with
						return key.lastIndexOf(val) == ( key.length - val.length );
						//if( key.lastIndexOf(val) == ( key.length - val.length ) ) return 1;
					}else if( op == '*' ){ // substring with
						return key.indexOf(val) > -1;
						//if( key.indexOf(val) > -1 ) return 1;
					}else if( op == '!' ){
						return key !== val;
						//if( key !== val ) return 1;
					}else{
						return key === val;
						//if( key === val ) return 1;
					}
				}
			}else if( key == ':' ){
				// TODO:pseudo 처리
				key = token.substr(1);
				val = ( opIdx = key.indexOf('(') ) > -1 ? isNaN( val = key.substr( opIdx+1 ) ) ? bs.trim(val) : Number( val ) : null;
				if( val ) key = key.substring( 0, opIdx );
				switch(key){
				case'link':
					if( el.tagName == 'A' && el.getAttribute('href') !== null ) return 1;
					break;
				case'active':
				case'visited':
				case'first-line':
				case'first-letter':
				case'hover':
				case'focus':
					break;
				case'root':
					if(el.tagName == 'HTML') return 1;
					break;
				case'first-of-type':
					return _nthOfType(el, 1);
					break;
				case'last-of-type':
					return _lastNthOfType(el, 1);
					break;
				case'nth-of-type':
					return _nthOfType(el, val);
					break;
				case'nth-last-of-type':
					return _lastNthOfType(el, val);
					break;
				case'only-of-type':
					if( el.nodeType != 1 ) return 0;
					op = el.parentNode && el.parentNode.childNodes;
					if( op && ( j = op.length ) ){
						i = 0, opIdx = 0;
						while( i < j ){
							if( op[i].nodeType == 1 && op[i].tagName != 'HTML' && el.tagName == op[i].tagName && ++opIdx && (val = op[i]) && opIdx > 1 ) return 0;
							i++;
						}
						if( opIdx == 1 && el == val ) return 1;
					}
					return 0;
					break;
				case'only-child':
					if( el.nodeType != 1 ) return 0;
					op = el.parentNode && el.parentNode.childNodes;
					if( op && ( i = op.length ) ){
						opIdx = 0;
						while( i-- ){
							if( op[i].nodeType == 1 && op[i].tagName != 'HTML' && ++opIdx && (val = op[i]) && opIdx > 1 ) return 0;
						}
						if( opIdx == 1 && el == val ) return 1;
					}
					return 0;
					break;
				case'first-child':
					return _nthOf(el, 1);
					break;
				case'last-child':
					return _lastNthOf(el, 1);
					break;
				case'nth-child':
					return _nthOf(el, val);
					break;
				case'nth-last-child':
					return _lastNthOf(el, val);
					break;
				case'empty':
					if( el.nodeType == 1 && !el.nodeValue && !el.childNodes.length ) return 1;
					return 0;
					break;
				case'checked':
					if(
						( el.tagName == 'INPUT' && (el.getAttribute('type') == 'radio' || el.getAttribute('type') == 'checkbox' ) && el.checked == true ) ||
						( el.tagName == 'OPTION' && el.selected == true )
					) return 1;
					return 0;
					break;
				case'enabled':
					if(
						(el.tagName == 'INPUT' || el.tagName == 'BUTTON' || el.tagName == 'SELECT' || el.tagName == 'OPTION' || el.tagName == 'TEXTAREA') &&
						el.getAttribute('disabled') == null
					) return 1;
					return 0;
					break;
				case'disabled':
					if(
						(el.tagName == 'INPUT' || el.tagName == 'BUTTON' || el.tagName == 'SELECT' || el.tagName == 'OPTION' || el.tagName == 'TEXTAREA') &&
						el.getAttribute('disabled') != null
					) return 1;
					return 0;
					break;
				}
			}else{ // TAG 처리
				if( token.toUpperCase() == el.tagName || token == '*' ) return 1;
			}
			return 0;
		};
	})();
	return function finder($s){
		var doc, nRet, ret, el, els, sels, oSel, t0, i, j, k, m, n,
			tags, key, hit, token, tokens, l2r, isAll;
		//console.log('############', $s);
		doc = document,
		finder.lastQuery = $s;
		if( !bs.trim($s) ) return;
		if( rClId.test($s) ){
			if( ( key = $s.charAt(0) ) == '#' )
				return [doc.getElementById( $s.substr(1) )];
			else if( key == '.' && doc.getElementsByClassName )
				return doc.getElementsByClassName( $s.substr(1) );
			else if( rTag.test( $s ) )
				return doc.getElementsByTagName( $s );
		}
		oSel = [],
		sels = bs.trim( $s.split(',') );
		for( i = sels.length; i--; ){
			oSel.push( parseQuery( sels[i] ) );
		}
		//console.log("### oSel", oSel);
		// TODO:native 처리
		if( oSel.length == 1 ){ // ,가 없을 경우
			if( ( key = oSel[0][0].charAt(0) ) == '#' ){
				els = [doc.getElementById( oSel[0][0].substr(1) )],
				oSel[0].shift();
			}
			else if( key == '.' && doc.getElementsByClassName ){
				els = doc.getElementsByClassName( oSel[0][0].substr(1) ),
				oSel[0].shift();
			}
			else if( key == '[' || key == ':' ){
				if( !hasParent ){
					els = oSel[0][oSel[0].length-1];
					if( ( key = els.charAt(0) ) == '#' )
						els = [doc.getElementById( els.substr(1) )],
						oSel[0].pop();
					else if( key == '.' )
						els = doc.getElementsByClassName( els.substr(1) ),
						oSel[0].pop();
					else if( rTag.test( els ) )
						els = doc.getElementsByTagName( els ),
						oSel[0].pop();
					else
						isAll = 1, els = doc.getElementsByTagName('*');
				}
				else
					isAll = 1, els = doc.getElementsByTagName('*');
			}
			else if( rTag.test( oSel[0][0] ) )
				els = doc.getElementsByTagName( oSel[0][0] ),
				oSel[0].shift();
			else isAll = 1, els = doc.getElementsByTagName('*');
		}else isAll = 1, els = doc.getElementsByTagName('*');

		ret = [];
		//console.log(els.length)
		for( i = 0, j = els.length; i < j; i++ ){
			//hit = 0;
			for( k = oSel.length; k--; ){
				tokens = oSel[k];
				el = els[i];
				if( !l2r ){ // 후방탐색
					for( m = 0, n = tokens.length; m < n; m++ ){
						//console.log('abc')
						token = tokens[m];
						hit = 0;
						if( ( key = token.charAt(0) ) == ' ' ){ // loop parent
							m++;
							while( el = el.parentNode ){
								if( hit = compareEl(el, tokens[m]) ) break;
							}
						}else if( key == '>' ){ // immediate parent
							hit = compareEl(el = el.parentNode, tokens[++m]);
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
							hit = compareEl(el, token);
						}
						if( !hit ) break; // 여긴 AND 연산
						//console.log(key);
					}
				}else{ // 전방탐색
					for( m = tokens.length; m--; ){
					}
				}
				if( hit ) break; // 여긴 OR 연산
			}
				//console.log(hit.length)
				if( hit ) ret.push(els[i]);
			}
		//}
		//echo(ret[0]);
		return ret;
	}
})();
	finder.isQS = isQS;
	return finder;
})();













//
//function querySelectorAll(element, selector) {
//    if(element.querySelectorAll) { // Morden Browser
//        return element.querySelectorAll(selector);
//    }
//    else { // low versioning IE only
//        var a=element.all, c=[], selector = selector.replace(/\[for\b/gi, '[htmlFor').split(','), i, j, s=document.createStyleSheet();
//        for (i=selector.length; i--;) {
//            s.addRule(selector[i], 'k:v');
//            for (j=a.length; j--;) a[j].currentStyle.k && c.push(a[j]);
//            s.removeRule(0);
//        }
//        return c;
//    }
//}

