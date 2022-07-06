import $mConfig from "./config/index.config.js"
function formatImg(img){
	if(img.indexOf('http') >= 0 || img.indexOf('/static/img/') >= 0){
		return img
	} else {
		return $mConfig.baseUrl + '/upload/' + img
	}
}

import $mRouter from './common/router.js';
import $mRoutesConfig from './config/routes.config.js';
import $apis from './apis/api.js';

export {$mRouter, $mRoutesConfig, $apis, formatImg}