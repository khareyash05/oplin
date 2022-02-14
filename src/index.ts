import joplin from 'api';
import Imap from "imap";
const inspect = require('util').inspect;
const parse = require('parse-email')

var email:string;
var pass : string;
var textAsHtml : string;
var textAsPlain : string;

joplin.plugins.register({
	onStart: async function() {
		console.info('Hello world. Test plugin started!');
		const dialogs = joplin.views.dialogs;

		const handle = await dialogs.create('myDialog1');
		await dialogs.setHtml(handle, `
		<form name="user">
			<p>Email Plugin</p>
			<p>Enter your email</p>
			<input placeholder="ENter your email" class="first" Name="email"/>
			<p>Enter your password</p>
			<input placeholder="Enter your password" Name="pass"/>
		</form>
		`);
		const result = await dialogs.open(handle);
		console.info('Got result: ' + JSON.stringify(result.formData.user.email));
		email = result.formData.user.email;
		pass = result.formData.user.pass;
		const imapConfig = {
			user: email,
			password: pass,
			host: 'imap.gmail.com',
			port: 993,
			tls: true,
			tlsOptions: { rejectUnauthorized: false }
		};
		const imap = new Imap(imapConfig);
		  imap.once('ready', () => {
			function openInbox(cb) {
				imap.openBox('INBOX', true, cb);
			  }
			openInbox(function(err, box) {
				if (err) throw err;
				var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM)','TEXT'] });
				f.on('message', function(msg, seqno) {
				  console.log('Message #%d', seqno);
				  var prefix = '(#' + seqno + ') ';
				  msg.on('body', function(stream, info) {
					if (info.which === 'TEXT')
					  console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
					var buffer = '', count = 0;
					stream.on('data', function(chunk) {
					  count += chunk.length;
					  buffer += chunk.toString('utf8');
					  parse(buffer)
					  .then(mail => {
						  console.log(mail.textAsHtml)
						  textAsHtml = mail.textAsHtml;
						  textAsPlain = mail.text;
						})
					  if (info.which === 'TEXT')
						console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
					});
					stream.once('end', function() {
					  if (info.which !== 'TEXT')
						console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
					  else
						console.log(prefix + 'Body [%s] Finished', inspect(info.which));
					});
				  });
				  msg.once('attributes', function(attrs) {
					console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
				  });
				  msg.once('end', function() {
					console.log(prefix + 'Finished');
				  });
				});
				f.once('error', function(err) {
				  console.log('Fetch error: ' + err);
				});
				f.once('end', function() {
				  console.log('Done fetching all messages!');
				  imap.end();
				});
			  });
		  })
	  
		  imap.once('error', err => {
			console.log(err);
		  });
	  
		  imap.once('end', () => {
			console.log('Connection ended');
		  });
	  
		  imap.connect();
	}
});
