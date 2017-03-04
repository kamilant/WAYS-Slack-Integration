const mongoose = require('mongoose');

var Schema = mongoose.Schema;
const songSchema = new Schema({
	name: String,
	img: String,
	img_thumb: String,
	progress: Number,
	progress_bar: String,
	tracked: {
		guitar_k: Boolean, 
		guitar_a: Boolean, 
		drums: Boolean, 
		bass: Boolean, 
		vocal: Boolean
	}
});
songSchema.methods.generateProgress = progress => {
	if(progress === 0) {
		return '[0]'
	}
	let progressBar = '-';
		for (var i = 0; i <= Math.floor(progress / 10); i++) {
			progressBar += '-';
		}
		this.progress_bar = `[ ${progressBar} ]`;
		return this.progress_bar;
}
var Song = mongoose.model('Song', songSchema);
module.exports = Song;