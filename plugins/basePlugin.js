/**
* Plugin Helper Class
*/

BasePlugin = exports.BasePlugin = function(irc, name) {
	this.irc = irc;
	this.name = name;
};

BasePlugin.prototype.getPluginProperty = function(propertyName) {
	this.irc.logger.verbose('Fetching propertyName: %s for plugin %s', propertyName, this.name);

	if (this.irc.config.pluginConfigs !== 'undefined') {
		var pluginConfigs = this.irc.config.pluginConfigs;
		if (pluginConfigs[this.name] !== 'undefined') {
			var pluginConfig = pluginConfigs[this.name];
			if (pluginConfig[propertyName] !== 'undefined') {
				return pluginConfig[propertyName];
			}
		}
	}
};


/**
 * This method checks, if a user is member of the given group, or the group of the
 * user is "higher" (meaning a smaller index) in the userGroups config array.
 *
 * If the config option userCheck is set to something different then true, the
 * method returns true and does noch do any further checks. If the property is not
 * set, then the method runs the checks as well.
 *
 * @param nick - the nick of the user
 * @param allowedGroup - the group the user is checked against
 */
BasePlugin.prototype.checkUser = function(user, allowedGroup) {
	var userCheck = this.irc.config.userCheck;

	if (userCheck === 'undefined' || userCheck !== true) {
		return true;
	}


	if (typeof user !== "object") {
		user = this.irc.users.find(user);
	}

	var userGroups = this.irc.config.userGroups;

	if (user !== undefined) {
		var userGroup = user.group;
		if (userGroup === 'undefined' || userGroups.indexOf(userGroup) < 0) {
			return false;
		}
		if (userGroups.indexOf(userGroup) <= userGroups.indexOf(allowedGroup)) {
			return true;
		}
	}

	return false;
};
