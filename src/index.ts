import joplin from 'api';

joplin.plugins.register({
	onStart: async function() {
		console.info('Hello world. Test plugin started!');
		const dialogs = joplin.views.dialogs;

		const handle = await dialogs.create('myDialog1');
		await dialogs.setHtml(handle, '<p>Testing dialog with default buttons</p><p>Second line</p><p>Third linexxx</p>');
		const result = await dialogs.open(handle);
		console.info('Got result: ' + JSON.stringify(result));
	},
});
