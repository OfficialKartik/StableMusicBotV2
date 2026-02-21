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
    this.currentProcess = null;
  }

  safeDestroy() {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGKILL');
      this.currentProcess = null;
    }

    if (this.connection && this.connection.state.status !== 'destroyed') {
      this.connection.destroy();
      this.connection = null;
    }
  }

  async play(message, query) {
    const channel = message.member.voice.channel;
    if (!channel) {
      return message.reply('Join VC first.');
    }

    // Stop any existing playback
    this.safeDestroy();

    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    this.player.removeAllListeners();

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.safeDestroy();
    });

    this.player.on('error', error => {
      console.error('Player error:', error.message);
      this.safeDestroy();
    });

    // Detect if input is URL or search query
    const isURL = query.startsWith('http://') || query.startsWith('https://');

    const ytArgs = [
      '-f', 'bestaudio[ext=webm]',
      '-o', '-'
    ];

    if (isURL) {
      ytArgs.push(query);
    } else {
      ytArgs.push(`ytsearch1:${query}`);
    }

    const yt = spawn('yt-dlp', ytArgs);

    this.currentProcess = yt;

    yt.stderr.on('data', data => {
      console.log(data.toString());
    });

    const resource = createAudioResource(yt.stdout, {
      inputType: StreamType.WebmOpus
    });

    this.player.play(resource);
    this.connection.subscribe(this.player);
  }
}

module.exports = new MusicPlayer();
