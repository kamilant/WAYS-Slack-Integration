'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

const {baseURL, footerIcon} = require('./scripts/vars.js');
const {formImageLink, generateProgressBar, setResponse} = require('./scripts/helpers');
const Sng = require('./db/song');
const app = express();
const key = process.env.weatherKey;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 3000 || process.env.PORT;

const server = app.listen(PORT, () => {
	console.log(`Server on port: ${PORT || server.address().port}`);
});
app.use('/img', express.static('./img'));
app.post('/', (req, res) => {
	let city = req.body.text;
	// bot implementation.
	axios.get(`http://api.openweathermap.org/data/2.5/weather?appid=${key}&q=${city}&units=metric`).then(resp => {
		// console.log(data);
		let {data} = resp;
		let {name: city, main, wind} = data;
		let {temp, pressure, humidity} = main;
		let {speed, deg} = wind;
		let response = {
			response_type: 'in_channel',
			text: `> Weather for *${city}*
			> \`Temperature:\`  *${temp}°C*
			> \`Wind:\` *${speed}* _m/s_ ∠ *${deg}* 
			> \`Pressure:\`  ${humidity} _%_
			> \`Humidity:\`  ${pressure} _hPa_`
		};
		res.send(response);
	}).catch(err => {
		res.send(`Something went wrong ${err}`);
	});
});

app.post('/progress', (req, res) => {
	// Make songs name all lower case
	// remove extension
	// create song objects
	let contains = false;
	Sng.find({}).then(songs => {
		if (req.body.text) {
		const requestedSong = req.body.text;
		songs.forEach(song => {
			if (song.name === requestedSong) {
				contains = true;
			}
		});
	}
	if (contains) {
		const requestedSong = req.body.text;
		const mySong = songs.filter(song => {
			return song.name === requestedSong;
		});
		const response = setResponse(mySong[0], mySong[0].img);
		res.send(response);
	} else {
		let attachments = [];
		const tick = '✓';
		const x = 'X';
		attachments = songs.map(song => {
			return	{
				color: '#ded',
				author_name: 'With All Your Strength',
				author_link: 'https://www.facebook.com/WithAllYourStrength/?ref=br_rs',
				title: song.name.toUpperCase(),
				fields: [{
					title: 'Progress',
					value: `${song.progress}% ${song.progress_bar}`,
					short: true
				},
				{
					title: 'Instruments',
					value: `Kamil: [ ${song.tracked.guitar_k ? tick : x} ],
Andrzej: [ ${song.tracked.guitar_a ? tick : x} ], 
Mateusz: [ ${song.tracked.bass ? tick : x} ],
Adrian:  [ ${song.tracked.drums ? tick : x} ], 
Maciej:  [ ${song.tracked.vocal ? tick : x} ]`,
					short: true
				}
				],
				thumb_url: `${baseURL}/img/thumb/${song.name.toUpperCase()}_thumb.jpg`,
				footer: 'With All Your Strength - Dreams (EP)',
	          	footer_icon: footerIcon,
			};
		});
		const response = {
			response_type: 'in_channel',
			attachments: attachments
		};
		res.send(response);
	}
	})
});

app.post('/create', (req, res) => {
	let songs = fs.readdirSync('./img');
	songs = songs.filter(song => {
		return song.includes('.jpg');
	});
	songs = songs.map(song => {
		const lowerCaseSong = song.toLowerCase().substr(0, song.lastIndexOf('.'));
		return new Sng({name: lowerCaseSong, 
			img: formImageLink(song, null), 
			progress: 0, 
			img_thumb: formImageLink(null, lowerCaseSong.toUpperCase()),
			tracked: {
				guitar_k: false,
				guitar_a: false,
				drums: false,
				bass: false,
				vocal: false,
			}
		});
	});
	songs.forEach(song => {
		song.progress_bar = song.generateProgress(song.progress);
		song.save();
	});
	res.send(songs);
});


app.post('/progress/update/instrument', (req, res) => {
	const queries = req.body.text.split(' ');
	const options = { 
		name: queries[0],
		member: queries[1],
		isRecorded: queries[2]
	};
	const {name, member, isRecorded} = options;

	if (queries.length !== 3) {
		res.send(`You provided invalid argument or forogot one [ ${queries.join(' ')} { ? } ]`);
	}
	Sng.findOne({ name: name }, (err, song)=> {
		song.tracked[member] = JSON.parse(isRecorded);
		let counter = 0;
		const keys = Object.keys(song.tracked);
		keys.splice(0,7);
		keys.forEach(track => {
			console.log(song.tracked.track);
			if(song.tracked[track] === true) {
				counter++;
			}
		});
		song.progress = counter*20;
		const progress_bar = new Sng().generateProgress(counter*20);
		song.progress_bar = progress_bar;
		song.save();
		res.send(setResponse(song));
	});
});
app.post('/progress/update', (req, res) => {
	let query = req.body.text;
	const queries = query.split(' ');
	const requestedSong = queries[0];
	const progress = queries[1];
	const progress_bar = new Sng().generateProgress(progress);
	if (progress < 100 && progress > 0) {
		Sng.findOneAndUpdate({name: requestedSong},{ progress, progress_bar }, {upsert: true, new: true}, (err, song) => {
			if(err) {
				res.send({err, message: 'Probably wrong song name'});
			}
			res.send(setResponse(song, ''));
		});
	} else {
		if(progress > 100) {
			res.send('You can\'t do more than 100% silly');

		}else if (progress < 0) {
			res.send(`Try harder, ${progress} is not a good number`);
		}
	}
});

require('./db/db');
module.exports = app;
