module.exports = {
  async execute(msg) {
    const language = await msg.client.ch.languageSelector(msg.guild);
    msg.client.ch.send(msg.channel, `${msg.author} ${language.mod.warnAdd.antispam.description}`, {
      allowedMentions: { repliedUser: true },
    });
  },
};
