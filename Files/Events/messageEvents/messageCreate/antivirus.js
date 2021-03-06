const urlCheck = require('valid-url');
const request = require('request');
const fs = require('fs');
const Builders = require('@discordjs/builders');

const jobs = require('node-schedule');

const { Worker } = require('worker_threads');

const blocklists = require('../../../blocklist.json');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute(msg) {
    let check = false;

    if (!msg.content || msg.author.id === msg.client.user.id) {
      return;
    }

    if (msg.channel.type === 1) {
      check = true;
    }

    const language = await msg.client.ch.languageSelector(check ? null : msg.guild);
    const lan = language.antivirus;

    if (check) {
      await prepare(msg, lan, check, language);
      return;
    }

    const res = await msg.client.ch.query(
      'SELECT * FROM antivirus WHERE guildid = $1 AND active = true;',
      [msg.guild.id],
    );

    if (res && res.rowCount > 0) {
      await prepare(msg, lan, check, language, res.rows[0]);
    }
  },
};

const prepare = async (msg, lan, check, language, res) => {
  const { content } = msg;
  const args = content
    .replace(/\n/g, ' ')
    .replace(/https:\/\//g, ' https://')
    .replace(/http:\/\//, ' http://')
    .split(/ +/);

  const links = [];

  args.forEach((arg) => {
    let url;
    try {
      url = new URL(arg).hostname;
    } catch {
      // empty block statement
    }

    if (
      urlCheck.isUri(arg) &&
      arg.toLowerCase() !== 'http://' &&
      arg.toLowerCase() !== 'https://' &&
      url
    ) {
      links.push(arg);
    }
  });
  const blocklist = getBlocklist();
  const whitelist = getWhitelist();
  const blacklist = getBlacklist();
  const badLinks = getBadLinks();
  const whitelistCDN = getWhitelistCDN();

  const fullLinks = await makeFullLinks(links);

  let includedBadLink = false;
  let reaction;
  let exited = false;

  if (links.length && check) {
    reaction = await msg.react(msg.client.objectEmotes.loading.id).catch(() => {});
  }

  fullLinks.forEach((linkObject, i) => {
    const AVworker = new Worker('./Files/Events/messageEvents/messageCreate/antivirusWorker.js');

    AVworker.on('exit', () => {
      exited = true;
    });

    AVworker.on('message', (data) => {
      data.msg = msg;
      data.language = language;

      if (!data.check && data.type !== 'send') {
        includedBadLink = true;
      }

      if (includedBadLink || i === fullLinks.length - 1) {
        reaction?.users.remove().catch(() => {});
        AVworker.terminate();
      }

      switch (data.type) {
        case 'doesntExist': {
          doesntExist(data, res);
          break;
        }
        case 'blacklisted': {
          blacklisted(data, res);
          break;
        }
        case 'whitelisted': {
          whitelisted(data, res);
          break;
        }
        case 'newUrl': {
          newUrl(data, res);
          break;
        }
        case 'severeLink': {
          severeLink(data, res);
          break;
        }
        case 'ccscam': {
          ccscam(data, res);
          break;
        }
        case 'cloudFlare': {
          cloudFlare(data, res);
          break;
        }
        case 'send': {
          const channel = msg.client.channels.cache.get(data.channelid);
          msg.client.ch.send(channel, { content: data.content });
          break;
        }
        case 'VTfail': {
          VTfail(data, res);
          break;
        }
        default:
          break;
      }
    });

    AVworker.on('error', (error) => {
      throw error;
    });

    AVworker.postMessage({
      msgData: {
        channelid: msg.channel.id,
        msgid: msg.id,
      },
      linkObject,
      lan,
      includedBadLink,
      check,
      blacklist,
      whitelist,
      whitelistCDN,
      blocklist,
      badLinks,
    });

    jobs.scheduleJob(new Date(Date.now() + 180000), () => {
      if (!exited) {
        AVworker.terminate();
        // timedOut({ msg, lan, check, linkObject, language });
      }
    });
  });
};

const getBlocklist = () => {
  const blacklist = [...new Set(blocklists)];
  blacklist.forEach((entry, index) => {
    entry = entry.replace(/#{2}-{1}/g, '');

    if (entry.startsWith('#')) {
      blacklist.splice(index, 1);
    }
  });
  return blacklist;
};

const getWhitelist = () => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/whitelisted.txt', {
    encoding: 'utf8',
  });
  const whitelistRes = file ? file.split(/\n+/) : [];

  return whitelistRes.map((entry) => entry.replace(/\r/g, ''));
};

const getBlacklist = () => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/blacklisted.txt', {
    encoding: 'utf8',
  });
  const blacklistRes = file ? file.split(/\n+/) : [];

  return blacklistRes.map((entry) => entry.replace(/\r/g, ''));
};

const getBadLinks = () => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/badLinks.txt', {
    encoding: 'utf8',
  });
  const badLinks = file ? file.split(/\n+/).filter((line) => !line.startsWith('//')) : [];

  return badLinks.map((entry) => entry.replace(/\r/g, '').replace(/https:\/\//g, ''));
};

const getWhitelistCDN = () => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/whitelistedCDN.txt', {
    encoding: 'utf8',
  });
  const whitelistCDNRes = file ? file.split(/\n+/) : [];

  return whitelistCDNRes.map((entry) => entry.replace(/\r/g, ''));
};

const makeFullLinks = async (links) => {
  const fullLinks = [];

  const makeAndPushLinkObj = async (link) => {
    const url = new URL(link);
    const [href, contentType] = await new Promise((resolve) => {
      request({ method: 'HEAD', url, followAllRedirects: true }, (error, response) => {
        if (response) {
          resolve([
            response?.request?.href,
            response?.headers ? response.headers['content-type'] : null,
          ]);
        } else {
          resolve([link, null]);
        }
      });
    });

    const object = {
      contentType,
      href,
      url: `${href || (url.href ? url.href : `${url.protocol}//${url.hostname}`)}`,
      hostname: url.hostname,
    };

    fullLinks.push(object);
  };

  const promises = links.map((link) => makeAndPushLinkObj(link));

  await Promise.all(promises);

  return fullLinks.map((linkObject) => {
    const urlParts = new URL(linkObject.url).hostname.split('.');
    const slicedURL = urlParts
      .slice(0)
      .slice(-(urlParts.length === 4 ? 3 : 2))
      .join('.');
    const newLink = `${new URL(linkObject.url).protocol}//${slicedURL}`;

    return {
      ...linkObject,
      baseURL: newLink,
      baseURLhostname: new URL(newLink).hostname,
    };
  });
};

const doesntExist = async ({ msg, lan, linkObject, check, language }, res) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      `**${language.result}**\n${client.ch.stp(lan.notexistent, {
        url: linkObject.baseURLhostname,
      })}`,
    )
    .setColor(msg.client.constants.colors.success);

  if (check) embed.addFields({ name: lan.checking, value: linkObject.href });

  client.ch.reply(msg, { embeds: [embed] });

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.success,
    linkObject,
    client.ch.stp(lan.notexistent, {
      url: linkObject.baseURLhostname,
    }),
    res,
  );
};

const blacklisted = async ({ msg, lan, linkObject, note, check, language }, res) => {
  if (note && note !== false) {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setDescription(
        `**${language.result}**\n${client.ch.stp(lan.malicious, {
          cross: client.textEmotes.cross,
        })}`,
      )
      .addFields({ name: language.attention, value: note.split(/\|+/)[1] })
      .setColor(msg.client.constants.colors.warning);

    if (check) embed.addFields(lan.checking, linkObject.href);

    msg.m = await client.ch.reply(msg, { embeds: [embed] });
  } else {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setDescription(
        `**${language.result}**\n${client.ch.stp(lan.malicious, {
          cross: client.textEmotes.cross,
        })}`,
      )
      .setColor(16711680);

    if (check) embed.addFields({ name: lan.checking, value: linkObject.href });

    msg.m = await client.ch.reply(msg, { embeds: [embed] });

    client.ch.send(client.channels.cache.get(client.constants.standard.trashLogChannel), {
      content: msg.url,
    });

    if (!check) {
      client.emit('antivirusHandler', msg, linkObject.baseURL, 'blacklist');
    }
  }

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.warning,
    linkObject,
    client.ch.stp(lan.malicious, {
      cross: client.textEmotes.cross,
    }),
    res,
  );
};

const severeLink = async ({ msg, lan, linkObject, check, language, hrefLogging }, res) => {
  saveToBadLink(linkObject, msg, hrefLogging);

  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      `**${language.result}**\n${client.ch.stp(lan.malicious, {
        cross: client.textEmotes.cross,
      })}`,
    )
    .setColor(msg.client.constants.colors.warning);

  if (check) embed.addFields({ name: lan.checking, value: linkObject.href });

  msg.m = await client.ch.reply(msg, { embeds: [embed] });

  client.ch.send(client.channels.cache.get(client.constants.standard.trashLogChannel), {
    content: msg.url,
  });
  if (!check) {
    client.emit('antivirusHandler', msg, linkObject.baseURL, 'virustotal');
  }

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.warning,
    linkObject,
    client.ch.stp(lan.malicious, {
      cross: client.textEmotes.cross,
    }),
    res,
  );
};

const ccscam = async ({ msg, lan, linkObject, check, language }, res) => {
  saveToBadLink(linkObject, msg);
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      `**${language.result}**\n${client.ch.stp(lan.ccscam, {
        cross: client.textEmotes.cross,
      })}`,
    )
    .setColor(msg.client.constants.colors.warning);

  if (check) embed.addFields({ name: lan.checking, value: linkObject.href });

  msg.m = await client.ch.reply(msg, { embeds: [embed] });
  client.ch.send(client.channels.cache.get(client.constants.standard.trashLogChannel), {
    content: msg.url,
  });
  if (!check) {
    client.emit('antivirusHandler', msg, linkObject.baseURL, 'selfscan');
  }

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.warning,
    linkObject,
    client.ch.stp(lan.ccscam, {
      cross: client.textEmotes.cross,
    }),
    res,
  );
};

const newUrl = async ({ msg, lan, linkObject, check, language }, res) => {
  saveToBadLink(linkObject, msg);

  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      `**${language.result}**\n${client.ch.stp(lan.newLink, {
        cross: client.textEmotes.cross,
      })}`,
    )
    .setColor(msg.client.constants.colors.warning);

  if (check) embed.addFields({ name: lan.checking, value: linkObject.href });

  msg.language = language;
  msg.m = await client.ch.reply(msg, { embeds: [embed] });

  client.ch.send(client.channels.cache.get(client.constants.standard.trashLogChannel), {
    content: msg.url,
  });

  if (!check) {
    client.emit('antivirusHandler', msg, linkObject.baseURL, 'newurl');
  }

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.warning,
    linkObject,
    client.ch.stp(lan.newLink, {
      cross: client.textEmotes.cross,
    }),
    res,
  );
  return true;
};

const saveToBadLink = async (linkObject, msg, hrefLogging) => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/badLinks.txt', {
    encoding: 'utf8',
  });
  const res = file ? file.split(/\n+/).map((entry) => entry.replace(/\r/g, '')) : [];

  if (!res.includes(linkObject.baseURL)) {
    client.channels.cache.get('726252103302905907').send(`
    contentType: ${linkObject.contentType}
    href: ${linkObject.href}
    url: ${linkObject.url}
    hostname: ${linkObject.hostname}
    baseURL: ${linkObject.baseURL}
    baseURLhostname: ${linkObject.baseURLhostname}
    `);

    const appended = hrefLogging ? linkObject.href : linkObject.baseURL;
    fs.appendFile('/root/Bots/Website/CDN/antivirus/badLinks.txt', `\n${appended}`, () => {});
  }
};

const whitelisted = async ({ msg, lan, check, linkObject, language }, res) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      `**${language.result}**\n${client.ch.stp(lan.whitelisted, {
        tick: client.textEmotes.tick,
      })}`,
    )
    .setColor(msg.client.constants.colors.success);

  if (check) {
    embed.addFields({ name: lan.checking, value: linkObject.href });
    client.ch.reply(msg, { embeds: [embed] });
  }

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.success,
    linkObject,
    client.ch.stp(lan.whitelisted, {
      tick: client.textEmotes.tick,
    }),
    res,
  );
  return true;
};

const cloudFlare = async ({ msg, lan, linkObject, check, language }, res) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      `**${language.result}**\n${client.ch.stp(lan.cfProtected, {
        cross: client.textEmotes.cross,
      })}`,
    )
    .setColor(16776960);

  if (check) embed.addFields({ name: lan.checking, value: linkObject.href });

  client.ch.reply(msg, { embeds: [embed] });

  client.ch.send(client.channels.cache.get(client.constants.standard.trashLogChannel), {
    content: `${msg.url}\nis CloudFlare Protected\n${linkObject.href}`,
  });

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.loading,
    linkObject,
    client.ch.stp(lan.cfProtected, {
      cross: client.textEmotes.cross,
    }),
    res,
  );
  return true;
};

const VTfail = ({ msg, lan, check, linkObject, language }, res) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      `**${language.result}**\n${client.ch.stp(lan.VTfail, {
        cross: msg.client.textEmotes.cross,
      })}`,
    )
    .setColor(msg.client.constants.colors.loading);

  if (check) embed.addFields({ name: lan.checking, value: linkObject.href });

  msg.client.ch.reply(msg, { embeds: [embed] });

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.loading,
    linkObject,
    client.ch.stp(lan.VTfail, {
      cross: msg.client.textEmotes.cross,
    }),
    res,
  );
};

/*
const timedOut = ({ msg, lan, check, linkObject, language }, res) => {
  msg.client.ch.send(msg.client.channels.cache.get('726252103302905907'), {
    content: `${linkObject.href}\n${msg.url}\nTimed Out`,
  });
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      `**${language.result}**\n${client.ch.stp(lan.timedOut, {
        cross: msg.client.textEmotes.cross,
      })}`,
    )
    .setColor(16776960);

  if (check) embed.addFields({ name: lan.checking, value: linkObject.href });

  msg.client.ch.reply(msg, { embeds: [embed] });

  linkLog(
    msg,
    lan,
    msg.client.constants.colors.loading,
    linkObject,
    client.ch.stp(lan.timedOut, {
      cross: msg.client.textEmotes.cross,
    }),
    res,
  );
};
*/

const linkLog = (msg, lan, color, url, text, row) => {
  if (!row || !row.linklogging || !row.linklogchannels?.length) return;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: lan.log.author.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(
      msg.client.ch.stp(lan.log.value, {
        author: msg.author,
        channel: msg.channel,
      }),
    )
    .setColor(color)
    .addFields(
      { name: `\u200b`, value: text, inline: false },
      {
        name: lan.log.href,
        value: msg.client.ch.makeCodeBlock(url.href),
        inline: false,
      },
      {
        name: lan.log.url,
        value: msg.client.ch.makeCodeBlock(url.url),
        inline: false,
      },
      {
        name: lan.log.hostname,
        value: msg.client.ch.makeCodeBlock(url.hostname),
        inline: true,
      },
      {
        name: lan.log.baseURL,
        value: msg.client.ch.makeCodeBlock(url.baseURL),
        inline: false,
      },
      {
        name: lan.log.baseURLhostname,
        value: msg.client.ch.makeCodeBlock(url.baseURLhostname),
        inline: true,
      },
    );

  const channels = row.linklogchannels.map((c) => msg.client.channels.cache.get(c));
  msg.client.ch.send(channels, { embeds: [embed] });
};
