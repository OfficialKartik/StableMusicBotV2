const player = require('../player/musicPlayer');

module.exports = {
  name: 'play',
  async execute(message, args) {
    if (!args.length) {
      return message.reply('Provide a YouTube URL or search query.');
    }

    const query = args.join(' ');
    await player.play(message, query);
  }
};
