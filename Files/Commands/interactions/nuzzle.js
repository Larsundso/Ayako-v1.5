const gifs = [
  'https://cdn.discordapp.com/attachments/760152457799401532/958830112885841970/anime-couples.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830113259126825/anime-hug-anime-nekopara.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830113703735326/anime-nuzzle.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830113993162782/anime-nose.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830114370625606/love-you-kiss.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830114945237042/anime-hug-nuzzle.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830115238858782/anime-cuddle.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830115486318662/anime-toyama-kasumi.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830115809288222/hugging-snuggle.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830116182556702/bffs-anime.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830144598990848/snuggles-hug.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830145320394752/kobayashisan-chi.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830145882427472/anime-priconne.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830146519969832/anime-nuzzle_1.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830146897469450/anime-cuddle_1.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830147514011698/nagisa-furukawa.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830148759740486/anime-cuddle_2.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958830149120434206/anime-kanna-anime.gif',
];

module.exports = {
  name: 'nuzzle',
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
