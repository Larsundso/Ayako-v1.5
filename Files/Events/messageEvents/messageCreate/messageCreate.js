module.exports = {
  async execute(msg) {
    require('./ashes')(msg);
    if (msg.author.discriminator === '0000') return;

    e(msg);
    require('./commandHandler').execute(msg);
    require('./afk').execute(msg);
    require('./disboard').execute(msg);
    require('./leveling').execute(msg);
    require('./blacklist').execute(msg);
    require('./willis').execute(msg);
    require('./DMlog').execute(msg);
    require('./other').execute(msg);
    require('./shoob').execute(msg);
    require('./nadeko').execute(msg);
    require('./antivirus').execute(msg);
    require('./autothreading').execute(msg);
    // require('./cirlce')(msg);
    if (!msg.editedAt) {
      if (msg.client.uptime > 10000) {
        const res = await msg.client.ch.query('SELECT * FROM stats;');
        if (res?.rows[0]?.antispam === true) require('./antispam').execute(msg);
      }
    }
  },
};

const e = (msg) => {
  if (msg.author.id === '228182903140515841' && msg.mentions.users.has('318453143476371456')) {
    msg.channel.send({ content: '<@228182903140515841>' });
  }
  if (msg.author.id === '534783899331461123' && msg.mentions.users.has('318453143476371456')) {
    msg.channel.send({ content: '<@534783899331461123>' });
  }
  if (msg.author.id === '513413045251342336' && msg.mentions.users.has('318453143476371456')) {
    msg.channel.send({ content: '<@513413045251342336>' });
  }

  if (
    (msg.author.id === '965386473677402132' || msg.author.id === '878245342087376896') &&
    (msg.content?.toLowerCase().includes('https://') ||
      msg.content?.toLowerCase().includes('http://'))
  ) {
    msg.delete();
  }
};
