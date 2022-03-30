const gifs = [
  'https://cdn.discordapp.com/attachments/760152457799401532/776086273042546698/tenor_20.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776086274170814494/tenor_19.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776086273278214184/tenor_21.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776086277053218866/tenor_17.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776086276775477258/tenor_18.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776086279745437706/tenor_16.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776086282681581628/tenor_15.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776086283893080064/tenor_14.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776086287554969680/tenor_13.gif',
];

module.exports = {
  name: 'scream',
  aliases: null,
  execute: async (msg) => {
    const gif = await getGif(msg);
    const loneError = !msg.mentions.users.size && !msg.lan.lone[module.exports.name];

    if (loneError) return { loneError };
    return { gif, loneError };
  },
};

const getGif = async () => {
  const random = Math.floor(Math.random() * gifs.length);
  return gifs[random];
};
