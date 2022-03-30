const gifs = [
  'https://cdn.discordapp.com/attachments/760152457799401532/958828511899041912/anime-anime-hug_1.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828512373010522/love-animecute.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828512821792808/cuddle-anime_2.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828513375436840/imouto-cuddle-imouto-sleeping.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828514130423898/strugglesnuggle-annoyed.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828515468410910/anime-hug-hug.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828516080758814/cuddle-anime_1.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828516445655080/cuddle-anime-hug-anime.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828516932190340/cuddle-anime.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828517259370546/goodnight-bed.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828552642494464/anime-anime-hug.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828553049366578/anime-couple-anime-blush.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828553535889479/snuggle-anime.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828553795944578/hug-anime.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828554332799076/anime-snuggle.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828554630619196/anime-cuddle.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958828554940977192/dragon-hug.gif',
];

module.exports = {
  name: 'snuggle',
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
