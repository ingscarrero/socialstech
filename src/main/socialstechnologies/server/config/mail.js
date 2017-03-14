module.exports = {
	sst:{
		host: 'smtp.office365.com', // Office 365 server
        port: 587,     // secure SMTP
        secure: false,
        tls: {
            ciphers: 'SSLv3'
        },
        requireTLS: true,
		auth:{
			user:'scarrero@socialstechnologies.com',
			pass:'Ti.871226'
		}
	}
}