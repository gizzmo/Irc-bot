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
