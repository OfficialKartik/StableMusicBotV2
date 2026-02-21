const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus
} = require('@discordjs/voice');

const { spawn } = require('child_process');

class MusicPlayer {
  constructor() {
    this.connection = null;
    this.player = createAudioPlayer();
  }

  async play(message, url) {
    const channel = message.member.voice.channel;
    if (!channel) {
      return message.reply('Join VC first.');
    }

    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.connection.destroy();
    });

    this.player.on('error', error => {
      console.error('Player error:', error.message);
      this.connection.destroy();
    });

    const yt = spawn('yt-dlp', [
      '-f', 'bestaudio[ext=webm]',
      '-o', '-',
      url
    ]);

    const resource = createAudioResource(yt.stdout, {
      inputType: StreamType.WebmOpus
    });

    this.player.play(resource);
    this.connection.subscribe(this.player);
  }
}

module.exports = new MusicPlayer();
