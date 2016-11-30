var fs = require('fs');

module.exports = {
	http:{
		enable: true,
		options: {
			port:3000
		}
	},
	https:{
		enable: true,
		options: {
			key: fs.readFileSync('/path/to/key.pem', 'utf8'),
			cert: fs.readFileSync('/path/to/cert.pem','utf8'),
			passphrase: 'keyPassprase',
			port: 3443
		}
	},
	secret: '<<insertyoursecrethere>>',
	database:{
		uri: 'localhost',
		database: 'annotations',
		port: '27017',
		user: null,
		password: null
	},
	ldapIdSuffix: '@ad.mycompany.com',
	ldapStrategyOpts: {
		server: {
			url: 'ldap://mycompany.com:3268',
			bindDn: 'cn=someone,ou=users,dc=ad,dc=mycompany,dc=com',
			bindCredentials: '',
			searchBase: 'DC=ad,DC=mycompany,DC=de',
			searchFilter: '(sAMAccountName={{username}})'
		}
	}
};
