const {baseURL, footerIcon} = require('./vars.js');

module.exports = {
	formImageLink: (img, thumb) => {
		console.log(arguments[0], arguments[1]);
		if(img && !thumb) {
			return `${baseURL}/img/${img}`;
		} else if (thumb && !img) {
			return `${baseURL}/img/thumb/${thumb}_thumb.jpg`;
		}
		return ;
	},
	setResponse: (song) => {
		const tick = '✓';
		const x = 'X';
		return (
			{response_type: 'in_channel',
			attachments: [{
				// text: `We should finish this track due: _ ${new Date()} _`,
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
					value: `
Kamil: [ ${song.tracked.guitar_k ? tick : x} ],
Andrzej: [ ${song.tracked.guitar_a ? tick : x} ], 
Mateusz: [ ${song.tracked.bass ? tick : x} ],
Adrian: [ ${song.tracked.drums ? tick : x} ], 
Maciej: [ ${song.tracked.vocal ? tick : x} ]`,
					short: true
				}
				],
				image_url: song.img,
				thumb_url: `${baseURL}/img/thumb/${song.name.toUpperCase()}_thumb.jpg`,
				footer: 'With All Your Strength - Dreams (EP)',
	          	footer_icon: footerIcon,
			}]}
		)
	}
}