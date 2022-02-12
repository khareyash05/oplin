import joplin from 'api';
import Imap from "imap";
const inspect = require('util').inspect;

// import {simpleParser} from 'mailparser';
var simpleParser = require("mailparser").simpleParser;
var email:string;
var pass : string;

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
			imap.openBox('INBOX', false, () => {
			  imap.search(['UNSEEN', ['ON', new Date()]], (err, results) => {
				const f = imap.fetch(results, {bodies: ''});
				f.on('message', msg => {
				  msg.on('body', stream => {
					simpleParser(stream, async (err, parsed) => {
					  const {from, subject, textAsHtml, text} = parsed;
					  console.log(parsed);
					  /* Make API call to save the data
						 Save the retrieved data into a database.
						 E.t.c
					  */
					 console.log("Text is here"+text);
					 console.log("HTML is here"+textAsHtml);
					//  text1 = text;
					//   html = textAsHtml;
					// //  markdown = converter.convert(html);
					//  markdown = html2md(html);
					//  console.log("Markdown is here"+markdown);
					//  console.log(parsed.attachments);
					//  content1 = parsed.attachments[0].content;
					//  console.log(content1);
					//  console.log(base64.encode(parsed.attachments[0].content));
					//  console.log("Attachments " +parsed.attachments[0].content); // for attachments
					});
				  });
				});
				f.once('error', ex => {
				  return Promise.reject(ex);
				});
				f.once('end', () => {
				  console.log('Done fetching all messages!');
				  imap.end();
				});
			  });
			});
		  });
	  
		  imap.once('error', err => {
			console.log(err);
		  });
	  
		  imap.once('end', () => {
			console.log('Connection ended');
		  });
	  
		  imap.connect();}
});
