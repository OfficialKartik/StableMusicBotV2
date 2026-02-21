const player = require('../player/musicPlayer');

module.exports = {
  name: 'play',
  async execute(message, args) {
    if (!args[0]) {
      return message.reply('Provide a YouTube URL.');
    }

    await player.play(message, args[0]);
  }
};
