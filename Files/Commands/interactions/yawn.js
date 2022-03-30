const gifs = [
  'https://c.tenor.com/ZTefiXlB014AAAAC/azusa-aizawa-azusa.gif',
  'https://c.tenor.com/Hd82RDOW6eQAAAAC/sleepy-princess-in-the-demon-castle-yawn.gif',
  'https://c.tenor.com/42weIHDogZAAAAAC/sleepy-yawn.gif',
  'https://c.tenor.com/4NJxOud5u6oAAAAC/anime-yawn.gif',
  'https://c.tenor.com/niGm9n9NZ0EAAAAC/yuudachi-yawn.gif',
  'https://c.tenor.com/K2KUkN5GPjUAAAAd/yawn-stretch.gif',
  'https://c.tenor.com/_IBaj604zp8AAAAC/tired-kon.gif',
  'https://c.tenor.com/DqkI-wUFAqcAAAAC/little-witch-academia-witch.gif',
  'https://c.tenor.com/_addNtAQwPoAAAAC/aaa.gif',
  'https://c.tenor.com/EnIzuqL-0ykAAAAC/anime-yawn.gif',
  'https://c.tenor.com/Pu42qpMGiusAAAAd/anime-girl.gif',
  'https://c.tenor.com/re6eeBTnXcsAAAAC/iruru-ilulu.gif',
  'https://c.tenor.com/jrXZjws5IVwAAAAC/azusa-aizawa-azusa.gif',
  'https://c.tenor.com/viXhLyvelpkAAAAC/tanaka-kun-sleepy.gif',
  'https://c.tenor.com/oKfXYxzcx6QAAAAC/rin-shelter.gif',
  'https://c.tenor.com/qMCuD1d-UmYAAAAC/jamie-anime.gif',
  'https://c.tenor.com/pXLDlms6KakAAAAd/anime-good-morning.gif',
  'https://c.tenor.com/ra1eKneb4gcAAAAC/sleepy-nichijou.gif',
  'https://c.tenor.com/jv-3NEyxpBwAAAAd/anime-yawning.gif',
  'https://c.tenor.com/fBOhx_wbz1kAAAAC/yawn-tired.gif',
  'https://c.tenor.com/YDV4jEpOF1oAAAAC/nadeshiko-yawn.gif',
  'https://c.tenor.com/1UjVG4tHsPQAAAAC/lucky-star-yawn.gif',
];

module.exports = {
  name: 'yawn',
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
