// 不需要jQuery
var button_label0='獲取地址';
var button_label1='正在獲取';
var result_label0='等待提交...';
var result_label1='<img src="/assets/loader.gif" alt="loading" /> 獲取中(專輯需時稍長,不要關閉本頁)...';
var input_placeholder='在這裡粘貼視頻頁面的地址...(包含http://)';
var msg = "請用右鍵“目標另存為”或用快車下載\n【提示：大部分視頻無法使用迅雷下載】";
var msg_filenamecopyed = "已複製文件名: ";

String.prototype.trim= function(){  
    // 用正則表達式將前後空格  
    // 用空字符串替代。  
    return this.replace(/(^\s*)|(\s*$)/g, "");  
}
String.prototype.queryString = function(key){
    var sValue=this.match(new RegExp("[\?\&]"+key+"=([^\&]*)(\&?)","i"));
    return sValue ? sValue[1]:sValue
}

String.prototype.setKeyValue = function(key,value){
    if(this.queryString(key) != null){
        var reg = new RegExp("([\?\&])(" + key + "=)([^\&]*)(\&?)","i");
        return this.replace(reg,"$1$2" + value + "$4");
    }else{
        var add = arguments[2];
        if(add === true){
            return this + (this.indexOf("?") > -1 ? "&" : "?") + key + "=" + value;
        }
        else{
        	return this;
        }
    }
}
function urlencode(url){
	return encodeBase64(url.replace('http://','http:##').replace('https://','https:##'));
}
function copyToClipboard()
{ 
	if(window.clipboardData){ 
		window.clipboardData.clearData(); 
		var btn = $(this);
		var oldhtml = btn.html();
		window.clipboardData.setData("Text", $(this).attr('data-clipboard-text')); 
		return true;
	} 
	else{
		var clip = new ZeroClipboard(this);
		clip.on('complete', function(client, args) {
			var btn = $(this);
			var oldhtml = btn.html();
			$(this).html('已複製到剪切板').attr('disabled','disabled');
			setTimeout(function(){btn.html(oldhtml).attr('disabled',false);},1000);
		});
		return false;
	}
}
function norefererDownload(furl) {
	if(furl.indexOf('http://')==0){
		furl = furl.substring(7);
		window.location = "https://noreferer.flvxz.com/"+furl;
	}
	//window.location = "https://noreferer.flvxz.com/?url="+urlencode(furl);
	//var winobj=window.open(furl,"down");
	//if(winobj==null) window.location=furl;
	return false;
}

// 需要jQuery
(function ($) {

$(document).ready(function(){
	var supportPlaceholder = 'placeholder' in document.createElement('input');
	if(supportPlaceholder){
		// 設置placeholder屬性
		$('#videoPageURI').attr('placeholder',input_placeholder);
	}
	else{
		// 用JS實現placeholder
		$('#videoPageURI').focus(function(){this.select();if(this.value==input_placeholder){this.value='';}});
		$('#videoPageURI').blur(function(){if(this.value==''){this.value=input_placeholder}});
	}
	$('#videoPageURI').change(function(){
		$('#videoPageURI').val($('#videoPageURI').val().trim());
		if($('#videoPageURI').val() == '' || /^https?:/.test($('#videoPageURI').val())){
			$('#videoPageURI').parent().removeClass('control-group error');
			$('#fetchButton').attr('disabled',false);
			//$('#fetchButton').removeAttr('disabled');
		}
		else{
			$('#videoPageURI').parent().addClass('control-group error');
			$('#fetchButton').attr('disabled',"disabled");
		}
	});
	//根據url的地址，執行init
	var videoPageURI = location.toString().queryString('url');
	$('#fetchButton').val(button_label0);
	if(videoPageURI==null){
		if(!supportPlaceholder) $('#videoPageURI').val(input_placeholder);
		$('#resultbox').hide();
	} else {
		if(videoPageURI.indexOf('http')===0){
			videoPageURI = decodeUri(decodeURIComponent(videoPageURI));
		} else {
			videoPageURI = decodeUri(videoPageURI);
			if(videoPageURI.indexOf('http')!==0 && videoPageURI.indexOf(':')===0) videoPageURI='http'+videoPageURI;
		}
		$('#videoPageURI').val(videoPageURI);
		getFlv();
	}
	$('#examplebox').show();
});
window.notify_finish = function(){
	$('.copyclipboard').each(function(){
		var clip = new ZeroClipboard(this);
		clip.on('complete', function(client, args) {
			var btn = $(this);
			var oldhtml = btn.html();
			$(this).html('已複製到剪切板').attr('disabled','disabled');
			setTimeout(function(){btn.html(oldhtml).attr('disabled',false);},1000);
		});
	});
}
window.getFlv = function() {
  var uri = $('#videoPageURI').val().trim();
  if( uri == null || uri == "" ) return;
  $('#fetchButton').attr('disabled',"disabled");
  $('#fetchButton').val(button_label1);
  $('#result').css('display','block');
  $('#result').html(result_label1);
  $('#resultbox').show();
	$.getScript("http://www.flvxz.com/getFlv.php?url="+encodeUri(uri), function(){
		$('#fetchButton').attr('disabled',false);
		$('#fetchButton').val(button_label0);
		$('#apiurls').html('<a class="btn btn-mini" href="http://api.flvxz.com/url/'+encodeUri(uri)+'" target="_blank" title="xml格式的輸出，目前免費">xml</a><a class="btn btn-mini" href="http://api.flvxz.com/url/'+encodeUri(uri)+'/xmlformat/ckxml" target="_blank" title="xml格式for ckplayer">ckxml</a>');
	});
	//$.getScript("http://log.flvxz.com/?url="+urlencode(uri));
}
window.flvout = function(d,resultid){
	var r = $('#result');
	if(typeof resultid == "undefined"){
		if(r.html().indexOf('loading')>=0) r.html('');
		r.children('.flvxz_tobereplaced').remove();
		r.html(r.html()+d);
	}
	else{
		var tip = '結果稍後出現...'; // 不能包含loading，因為#result判斷用了loading
		var ri = $('#'+resultid);
		if(!ri[0]) r.html(r.html()+'<div id=\"'+resultid+'\">'+tip+'</div>');
		ri = $('#'+resultid); // 添加了resultid的div，重新獲取
		if(ri.html().indexOf(tip)>=0) ri.html('');
		ri.children('.flvxz_tobereplaced').remove();
		ri.html(ri.html()+d);
	}
}
window.encodeUri = function(uri){
	uri = uri.replace(/^(http:\/\/[^\/]*(?:youku|tudou|ku6|youtube|yinyuetai|letv|sohu))xia.com\//,'$1.com/');
	uri = uri.replace(/^(https?:)\/\//,'$1##');
	uri = encodeBase64(uri);
	return uri;
}
window.decodeUri = function(uri){
	if(/^[A-Za-z0-9=\+\/]+#*$/.test(uri)) uri = decodeBase64(uri);
	uri = uri.replace(/^(https?:)##/,'$1//');
	return uri;
}
window.parseFlv = function(){
	var uri=$('#videoPageURI').val().trim();
	uri = encodeUri(uri);
	top.location = '?url=' + uri;
}

window.in_array = function(stringToSearch, arrayToSearch) {
    for (s = 0; s <arrayToSearch.length; s++) {
        thisEntry = arrayToSearch[s].toString();
        if (thisEntry == stringToSearch) {
            return true;
        }
    }
    return false;
}

window.preview = function(sharecode){
	$('#previewbox').html(sharecode);
	$('#previewbox').slideDown('slow');
}

window.youkupass = function(this_btn,vid){
	var pass = $(this_btn).prev().val();
	if(pass.length==0) return;
	$(this_btn).val('正在驗證密碼').attr('disabled', 'disabled');
	$.getScript("http://www.flvxz.com/youkupass.php?vid=" + vid + "&password=" + pass);	
}
window.youkulogin = function(this_btn,vid){
	var pass = $(this_btn).prev().val();
	var user = $(this_btn).prev().prev().val();
	if(user.length==0||pass.length==0) return;
	$(this_btn).val('正在驗證密碼').attr('disabled', 'disabled');
	$.getScript("http://www.flvxz.com/youkulogin.php?vid=" + vid + "&username=" + user + "&password=" + pass);	
}
window.tudoupass = function(this_btn,vid){
	var pass = $(this_btn).prev().val();
	if(pass.length==0) return;
	$(this_btn).val('正在驗證密碼').attr('disabled', 'disabled');
	$.getScript("http://www.flvxz.com/tudoupass.php?vid=" + vid + "&password=" + pass);	
}
window.v56pass = function(this_btn,vid,sid){
	var pass = $(this_btn).prev().val();
	if(pass.length == 0) return;
	$(this_btn).val('正在驗證密碼').attr('disabled', 'disabled');
	$.getScript("http://www.flvxz.com/getFlv.php?url=" + encodeBase64('http://www.56.com/fakeurl/vid/' + vid + "/sid/" + sid + "/password/" + pass));
}
window.kankan = function(vid,title){
	var arr = vid.split('_');
	$('#result_'+arr[2]).html('<span class="flvxz_tobereplaced">正在解析 '+title+'</span>');
	$.getScript("http://www.flvxz.com/kankan.php?vid=" + vid + '&title=' + encodeURIComponent(title) );	
}
window.funshion = function(vid,title){
	$('#result_'+vid).html('<span class="flvxz_tobereplaced">正在解析 '+title+'</span>');
	$.getScript("http://www.flvxz.com/getFlv.php?url="+encodeBase64('http://www.funshion.com/fakeurl/'+encodeURIComponent(title)+'/cid/'+vid));
}

}(jQuery));