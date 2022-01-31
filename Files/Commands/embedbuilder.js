const Discord = require('discord.js');

const testReg = /discord\.com\/channels\//gi;
const colorReg = /[0-9A-Fa-f]{6}/g;

module.exports = {
  name: 'embedbuilder',
  perm: 2048n,
  dm: false,
  takesFirstArg: false,
  aliases: ['eb'],
  async execute(msg) {
    const returned = await this.builder(msg);
    msg.m.reactions.removeAll().catch(() => {});

    if (!returned) return;

    const { embed, answer } = returned;
    if (embed) {
      replier({ msg, answer }, { embeds: [embed], components: [] });
    }
  },
  async builder(msg, answer, existingEmbed, page) {
    if (typeof page !== 'number') page = 1;

    msg.m?.reactions.cache.get(msg.client.constants.emotes.back)?.users.remove(msg.client.user.id);

    const lan = msg.language.commands.embedbuilder;

    const Objects = {
      edit: 'menu',
      category: null,
      embed: existingEmbed || new Discord.MessageEmbed(),
      page: page || 1,
    };

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(lan.chooseTheEdit)
      .setColor(msg.client.ch.colorSelector(msg.guild.me));

    await replier(
      { msg, answer },
      { embeds: [embed], components: getComponents(msg, { page, Objects }), files: [] },
      Objects,
    );

    const returned = await handleBuilderButtons({ msg, answer }, Objects, lan, embed);

    return returned;
  },
};

const replier = async ({ msg, answer }, { embeds, components, content, files }, Objects) => {
  let finishedEmbed;
  if (Objects) {
    if (
      !Objects.embed.title &&
      (!Objects.embed.author || !Objects.embed.author.name) &&
      !Objects.embed.description &&
      (!Objects.embed.thumbnail || !Objects.embed.thumbnail.url) &&
      !Objects.embed.fields.length &&
      (!Objects.embed.image || !Objects.embed.image.url) &&
      (!Objects.embed.footer || !Objects.embed.footer.text)
    ) {
      finishedEmbed = new Discord.MessageEmbed()
        .setDescription(msg.language.commands.embedbuilder.warns.noValue)
        .setColor('FF0000')
        .setThumbnail(msg.client.constants.commands.embedbuilder.error);

      const saveButton =
        components && components[components.length - 1] ? components[components.length - 1][0] : {};
      if (saveButton.customId === 'save') {
        saveButton.setDisabled(true);
      }
    } else {
      finishedEmbed = Objects.embed;
    }

    if (components) components = msg.client.ch.buttonRower(components);

    if (embeds?.length) embeds = [finishedEmbed, ...embeds];
    else embeds = [finishedEmbed];
  }

  if (answer && !answer.replied) {
    await answer.update({
      embeds,
      components,
      content,
      files,
    });
  } else if (msg.m) {
    await msg.m.edit({
      embeds,
      components,
      content,
      files,
    });
  } else {
    msg.m = await msg.client.ch.reply(msg, {
      embeds,
      components,
      content,
      files,
    });
  }
};

const getComponents = (msg, { page, Objects }, editing) => {
  const components = [];
  const lan = msg.language.commands.embedbuilder.edit;
  const baseLan = msg.language.commands.embedbuilder;

  switch (page) {
    default: {
      break;
    }
    case 1: {
      let authorNameStyle = Objects.embed.author?.name ? 'SECONDARY' : 'PRIMARY';
      authorNameStyle = validate('author-name', Objects.embed, msg.client.constants)
        ? 'DANGER'
        : authorNameStyle;
      if (editing === 'author-name') authorNameStyle = 'SUCCESS';

      let titleStyle = Objects.embed.title ? 'SECONDARY' : 'PRIMARY';
      titleStyle = validate('title', Objects.embed, msg.client.constants) ? 'DANGER' : titleStyle;
      if (editing === 'title') titleStyle = 'SUCCESS';

      let descriptionStyle = Objects.embed.description ? 'SECONDARY' : 'PRIMARY';
      descriptionStyle = validate('description', Objects.embed, msg.client.constants)
        ? 'DANGER'
        : descriptionStyle;
      if (editing === 'description') descriptionStyle = 'SUCCESS';

      let footerTextStyle = Objects.embed.description ? 'SECONDARY' : 'PRIMARY';
      footerTextStyle = validate('footer-text', Objects.embed, msg.client.constants)
        ? 'DANGER'
        : footerTextStyle;
      if (editing === 'footer-text') footerTextStyle = 'SUCCESS';

      let authorIconUrlStyle = Objects.embed.author?.iconURL ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'author-iconURL') authorIconUrlStyle = 'SUCCESS';

      let authorUrlStyle = Objects.embed.author?.url ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'author-url') authorUrlStyle = 'SUCCESS';

      let urlStyle = Objects.embed.url ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'url') urlStyle = 'SUCCESS';

      let thumbnailStyle = Objects.embed.thumbnail?.url ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'thumbnail') thumbnailStyle = 'SUCCESS';

      let imageStyle = Objects.embed.image?.url ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'image') imageStyle = 'SUCCESS';

      let footerIconUrlStyle = Objects.embed.footer?.iconURL ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'footer-iconURL') footerIconUrlStyle = 'SUCCESS';

      let colorStyle = Objects.embed.color ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'color') colorStyle = 'SUCCESS';

      let timestampStyle = Objects.embed.timestamp ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'timestamp') timestampStyle = 'SUCCESS';

      components.push(
        [
          new Discord.MessageButton()
            .setCustomId('author-name')
            .setLabel(lan['author-name'].name)
            .setStyle(authorNameStyle),
          new Discord.MessageButton()
            .setCustomId('author-iconURL')
            .setLabel(lan['author-iconURL'].name)
            .setStyle(authorIconUrlStyle),
          new Discord.MessageButton()
            .setCustomId('author-url')
            .setLabel(lan['author-url'].name)
            .setStyle(authorUrlStyle),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('title')
            .setLabel(lan.title.name)
            .setStyle(titleStyle),
          new Discord.MessageButton().setCustomId('url').setLabel(lan.url.name).setStyle(urlStyle),
          new Discord.MessageButton()
            .setCustomId('description')
            .setLabel(lan.description.name)
            .setStyle(descriptionStyle),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('thumbnail')
            .setLabel(lan.thumbnail.name)
            .setStyle(thumbnailStyle),
          new Discord.MessageButton()
            .setCustomId('image')
            .setLabel(lan.image.name)
            .setStyle(imageStyle),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('footer-text')
            .setLabel(lan['footer-text'].name)
            .setStyle(footerTextStyle),
          new Discord.MessageButton()
            .setCustomId('footer-iconURL')
            .setLabel(lan['footer-iconURL'].name)
            .setStyle(footerIconUrlStyle),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('color')
            .setLabel(lan.color.name)
            .setStyle(colorStyle),
          new Discord.MessageButton()
            .setCustomId('timestamp')
            .setLabel(lan.timestamp.name)
            .setStyle(timestampStyle),
        ],
      );
      break;
    }
    case 2: {
      components.push(
        [
          new Discord.MessageSelectMenu()
            .setCustomId('field-select')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder(baseLan.fieldsPlaceholder)
            .setDisabled(!Objects.embed.fields.length)
            .addOptions(
              Objects.embed.fields.length
                ? Objects.embed.fields.map((field, i) => {
                    return {
                      label: field.name === '\u200b' ? msg.language.none : field.name.slice(0, 100),
                      description:
                        field.value === '\u200b' ? msg.language.none : field.value.slice(0, 100),
                      value: `${i}`,
                    };
                  })
                : { label: 'placeholder', value: 'placeholder' },
            ),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('add-field')
            .setLabel(baseLan.addField)
            .setStyle('SUCCESS')
            .setDisabled(Objects.embed.fields.length === 25),
        ],
      );
      break;
    }
    case 3: {
      components.push(
        [
          new Discord.MessageButton()
            .setCustomId('inheritCode')
            .setLabel(baseLan.inheritCode)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId('viewRaw')
            .setLabel(baseLan.viewRaw)
            .setStyle('PRIMARY'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('viewRawOtherMsg')
            .setLabel(baseLan.viewRawOtherMsg)
            .setStyle('SECONDARY'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('save')
            .setLabel(baseLan.save)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId('send')
            .setLabel(baseLan.send)
            .setStyle('PRIMARY')
            .setDisabled(msg.command.name !== module.exports.name),
        ],
      );
    }
  }

  return components;
};

const validate = (type, embed, constants) => {
  const { limits } = constants.customembeds;

  if (limits.totalOf.includes(type)) {
    let total = 0;

    limits.totalOf.forEach((limit) => {
      switch (limit) {
        default: {
          total += embed[type]?.length;
          break;
        }
        case 'field-names': {
          embed.fieldNames?.forEach((field) => {
            total += field.name.length;
            total += field.value.length;
          });
          break;
        }
        case 'footer-text': {
          total += embed.footer?.name?.length;
          break;
        }
        case 'author-name': {
          total += embed.author?.name?.length;
          break;
        }
      }
    });

    if (total > limits.total) return 'total_fail';
  }

  switch (type) {
    default: {
      return embed[type]?.length >= limits.fields[type];
    }
    case 'author-name': {
      return embed.author?.name?.length >= limits.fields[type];
    }
    case 'footer-text': {
      return embed.footer?.text?.length >= limits.fields[type];
    }
    case 'field-names' || 'field-values': {
      const failed = embed.fields
        ?.map((field, i) => {
          if (field.name.length >= limits.fields[type]) return i;
          if (field.name.length >= limits.fields[type]) return i;
          return undefined;
        })
        .filter((i) => i !== undefined);
      if (failed.lenght) return failed;
      return true;
    }
  }
};

const postCode = (Objects, msg, interaction, embed, noRemove) => {
  msg.m.reactions.removeAll().catch(() => {});
  if (noRemove) {
    return handleReactionsCollector({ msg }, null, Objects, {
      needsBack: true,
      needsPages: false,
    });
  }

  const rawCode = Objects.embed.toJSON();
  if (rawCode.length > 4000) {
    const attachment = msg.client.ch.txtFileWriter([rawCode]);

    replier({ msg, answer: interaction }, { files: [attachment], components: [], embeds: [embed] });
  } else {
    const embeds = [];
    if (embed) embeds.push(embed);
    embeds.push(
      new Discord.MessageEmbed()
        .setAuthor({
          name: msg.language.commands.embedbuilder.author,
          iconURL: msg.client.constants.commands.embedbuilder.author,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(msg.client.ch.makeCodeBlock(JSON.stringify(rawCode, null, 1)))
        .setColor('ffffff')
        .setTitle(msg.language.commands.embedbuilder.unsaved)
        .addField('\u200b', msg.language.commands.embedbuilder.unsavedFieldValue),
    );

    replier(
      { msg, answer: interaction },
      {
        embeds,
        components: [],
      },
    );
  }
  return null;
};

const handleSave = async (msg, answer, Objects) => {
  msg.m.reactions.removeAll().catch(() => {});

  const lan = msg.language.commands.embedbuilder;
  const save = new Discord.MessageButton()
    .setCustomId('save')
    .setLabel(lan.save)
    .setStyle('PRIMARY')
    .setDisabled(true);

  const embed = new Discord.MessageEmbed().setDescription(lan.giveName).setAuthor({
    name: msg.language.commands.embedbuilder.author,
    iconURL: msg.client.constants.commands.embedbuilder.author,
    url: msg.client.constants.standard.invite,
  });
  await replier({ msg, answer }, { embeds: [embed], components: [save] }, Objects);

  return new Promise((resolve) => {
    let name;
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });

    handleReactionsCollector(
      { msg, answer },
      messageCollector,
      Objects,
      {
        needsBack: true,
        needsPages: false,
      },
      resolve,
    );

    messageCollector.on('collect', async (message) => {
      if (message.author.id !== msg.author.id) return;

      name = message.content.slice(0, 1024);

      const newSave = new Discord.MessageButton()
        .setCustomId('save')
        .setLabel(lan.save)
        .setStyle('PRIMARY')
        .setDisabled(!name);

      embed.fields.length = 0;
      embed.addField(msg.language.name, `\u200b${message.content.slice(0, 1024)}`);
      message.delete().catch(() => {});

      await replier({ msg, answer }, { embeds: [embed], components: [newSave] }, Objects);
    });

    messageCollector.on('end', (collected, reason) => {
      if (reason !== 'time') {
        buttonsCollector.stop();
      }
    });

    buttonsCollector.on('collect', (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction, msg);
        return;
      }
      messageCollector.stop();
      buttonsCollector.stop();

      const emb = Objects.embed;
      msg.client.ch.query(
        `
      INSERT INTO customembeds 
      (color, title, url, authorname, authoriconurl, authorurl, description, thumbnail, fieldnames, fieldvalues, fieldinlines, image, timestamp, footertext, footericonurl, uniquetimestamp, guildid, name) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
      `,
        [
          emb.color,
          emb.title,
          emb.url,
          emb.author?.name,
          emb.author?.icon_url,
          emb.author?.url,
          emb.description,
          emb.thumbnail?.url,
          emb.fields?.map((f) => f.name),
          emb.fields?.map((f) => f.value),
          emb.fields?.map((f) => f.inline),
          emb.image?.url,
          emb.timestamp,
          emb.footer?.text,
          emb.footer?.icon_url,
          Date.now(),
          msg.guild.id,
          name,
        ],
      );

      resolve({ embed: emb, answer: interaction });
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        resolve(null);
        postCode(Objects, msg);
      }
    });
  });
};

const handleSend = async (msg, answer, Objects) => {
  const getButtons = (options) => {
    const next = new Discord.MessageButton()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(
        options.options.length > 25 && options.page === Math.ceil(options.options.length / 25),
      )
      .setStyle('SUCCESS');
    const prev = new Discord.MessageButton()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(options.page === 1)
      .setStyle('DANGER');
    const send = new Discord.MessageButton()
      .setCustomId('send')
      .setLabel(msg.language.commands.embedbuilder.send)
      .setStyle('PRIMARY');
    const channels = new Discord.MessageSelectMenu()
      .setCustomId('channels')
      .addOptions(options.take)
      .setPlaceholder(msg.language.select.channels.select)
      .setMaxValues(options.take.length)
      .setMinValues(1);

    return [[prev, next], channels, send];
  };

  const getEmbed = (options) => {
    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(
        `${msg.language.commands.embedbuilder.sendWhere}\n\n**${msg.language.selected}**:\n${
          options.selected.lenght
            ? options.selected.map((c) => `<#${c}>`).join(', ')
            : msg.language.none
        }`,
      )
      .addField(msg.language.page, `\`${options.page}/${Math.ceil(options.options.length / 25)}\``);

    return embed;
  };

  const options = {
    page: 1,
    options: msg.guild.channels.cache
      .filter((c) =>
        [
          'GUILD_TEXT',
          'GUILD_NEWS',
          'GUILD_NEWS_THREAD',
          'GUILD_PUBLIC_THEAD',
          'GUILD_PRIVATE_THREAD',
        ].includes(c.type),
      )
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .map((c) => {
        return { label: `${c.name}`, value: `${c.id}` };
      }),
    selected: [],
  };

  const getTake = () => {
    const neededIndex = options.page * 25 - 25;
    for (let j = neededIndex + 1; j < neededIndex + 26 && j < options.options.length; j += 1) {
      options.take.push(options.options[j]);
    }
  };

  options.take = options.options.filter((o, i) => i < 25);

  await replier(
    { msg, answer },
    { embeds: [getEmbed(options)], components: getButtons(options) },
    Objects,
  );

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction, msg);
      return;
    }
    buttonsCollector.resetTimer();

    switch (interaction.customId) {
      default: {
        interaction.values.forEach((v) => {
          if (options.selected.includes(v)) {
            const index = options.selected.indexOf(v);
            options.selected.splice(index, 1);
          } else {
            options.selected.push(v);
          }
        });
        break;
      }
      case 'next': {
        options.page += 1;
        options.take.length = 0;
        getTake();
        break;
      }
      case 'prev': {
        options.page -= 1;
        options.take.length = 0;
        getTake();
        break;
      }
      case 'send': {
        buttonsCollector.stop();

        const sendPromises = options.selected.map((c) =>
          msg.client.channels.cache
            .get(c)
            .send({ embeds: [Objects.embed] })
            .catch((e) => [c, e])
            .then(() => [c]),
        );

        const returns = await Promise.all(sendPromises);

        const errors = returns.filter((r) => r[1]);
        const successes = returns.filter((r) => !r[1]);

        const embed = new Discord.MessageEmbed()
          .setAuthor({
            name: msg.language.commands.embedbuilder.author,
            iconURL: msg.client.constants.commands.embedbuilder.author,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(
            `${
              (errors.length
                ? errors
                    .map(
                      (err) =>
                        `${msg.client.ch.stp(`${msg.language.commands.embedbuilder.sendError}`, {
                          channel: `<#${err[0]}>`,
                          error: err[1],
                        })}`,
                    )
                    .join('\n')
                : '',
              successes.map((c) => {
                return msg.client.ch.stp(`${msg.language.commands.embedbuilder.sendSuccess}`, {
                  channel: `<#${c[0]}>`,
                });
              }))
            }`,
          );

        await replier({ msg, answer: interaction }, { embeds: [embed], components: [] }, Objects);
        msg.m.reactions.removeAll().catch(() => {});
        return;
      }
    }

    await replier(
      { msg, answer: interaction },
      { embeds: [getEmbed(options)], components: getButtons(options) },
      Objects,
    );
  });
};

const handleOtherMsgRaw = async (msg, answer, Objects) => {
  msg.m.reactions.removeAll().catch(() => {});

  const noFound = () => {
    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(msg.language.commands.embedbuilder.noUrlFound);

    return replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);
  };

  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: msg.language.commands.embedbuilder.author,
      iconURL: msg.client.constants.commands.embedbuilder.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(msg.language.commands.embedbuilder.otherMsg)
    .addField(
      msg.language.Examples,
      msg.client.constants.discordMsgUrls.map((url) => `\`${url}\``).join('\n'),
    );

  await replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);

  const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
  return new Promise((resolve) => {
    handleReactionsCollector(
      { msg, answer },
      messageCollector,
      Objects,
      {
        needsBack: true,
        needsPages: false,
      },
      resolve,
    );

    messageCollector.on('collect', async (message) => {
      if (message.author.id !== msg.author.id) return;

      message.delete().catch(() => {});

      if (!testReg.test(message.content)) {
        noFound(msg);
      }

      const args = message.content.replace(/\n/g, ' ').split(/ +/);
      const messageUrls = [];

      args.forEach((arg) => {
        try {
          const url = new URL(arg);
          if (
            (url.hostname === 'discord.com' ||
              url.hostname === 'canary.discord.com' ||
              url.hostname === 'ptb.discord.com') &&
            url.pathname.startsWith('/channels/')
          ) {
            messageUrls.push(arg);
          }
        } catch {
          // empty
        }
      });

      const messagePromises = messageUrls.map(async (url) => {
        const path = url.replace(testReg, '');

        const ids = path.split(/\/+/);
        if (ids[0] === 'https:' || ids[0] === 'http:') ids.shift();

        if (Number.isNaN(+ids[0]) && ids[0] === '@me') {
          return (await msg.client.guilds.cache.channels.fetch(ids[1]).catch((e) => e))?.messages
            ?.fetch(ids[2])
            ?.catch((e) => e);
        }
        return msg.client.channels.cache
          .get(ids[1])
          .messages?.fetch(ids[2])
          .catch((e) => e);
      });

      const messages = await Promise.all(messagePromises);

      const messageEmbedJSONs = [];
      messages.forEach((m) => {
        m.embeds.forEach((membed) => {
          messageEmbedJSONs.push(`${m.url}\n${JSON.stringify(membed, null, 1)}`);
        });
      });

      const attachment = msg.client.ch.txtFileWriter(messageEmbedJSONs);

      await replier({ msg, answer }, { files: [attachment], embeds: [embed] });
    });
  });
};

const embedButtonsHandler = async (Objects, msg, answer, erroredPreviously) => {
  if (!erroredPreviously) msg.m.reactions.removeAll().catch(() => {});
  const editing = answer.customId;

  const messageHandler = async () => {
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
    const lan = msg.language.commands.embedbuilder.edit[editing];

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setTitle(lan.name)
      .setDescription(lan.answers);

    if (lan.recommended) {
      embed.addField('\u200b', lan.recommended);
    }

    await replier(
      { msg, answer },
      { embeds: [embed], components: getComponents(msg, { page: 1, Objects }, editing) },
      Objects,
    );

    const returned = await new Promise((resolve) => {
      handleReactionsCollector(
        { msg, answer },
        messageCollector,
        Objects,
        {
          needsBack: true,
          needsPages: false,
        },
        resolve,
      );

      messageCollector.on('collect', (message) => {
        if (message.author.id !== msg.author.id) return;

        resolve(message.content);
        message.delete().catch(() => {});
        messageCollector.stop();
      });

      messageCollector.on('end', (collected, reason) => {
        if (reason === 'time') {
          postCode(Objects, msg);
        }
        resolve(null);
      });
    });

    return returned;
  };

  const limits = msg.client.constants.customembeds.limits.fields;

  const errorVal = async (error, valid) => {
    const lan = msg.language.commands.embedbuilder;
    let lanError;

    switch (error) {
      default: {
        lanError = error;
        break;
      }
      case 'regFail': {
        lanError = lan.regFail;
        break;
      }
      case 'length': {
        lanError = msg.client.ch.stp(lan.lengthFail, { max: valid });
        break;
      }
      case 'noTimestamp': {
        lanError = lan.noTimestamp;
        break;
      }
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(msg.language.commands.embedbuilder.errorVal)
      .setColor('ff0000');
    if (error) embed.addField(msg.language.error, `${lanError}`);

    await replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);

    msg.m.reactions.cache.get(msg.client.constants.emotes.back).users.remove(msg.client.user);
    const reaction = await msg.m.react(msg.client.constants.emotes.timers[3]);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
        reaction.remove(msg.client.user.id).catch(() => {});
      }, 3000);
    });
  };

  const entered = await messageHandler();
  let errored = false;
  if (!entered) return null;

  switch (answer.customId) {
    default: {
      break;
    }
    case 'color': {
      const passesReg = colorReg.test(entered);

      let e;
      if (passesReg) {
        try {
          new Discord.MessageEmbed().setColor(entered);
        } catch (err) {
          e = err;
        }
      }

      if (!passesReg || e) {
        let valid;
        if (!passesReg) valid = 'regFail';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setColor(entered);
      break;
    }
    case 'title': {
      const passesLength = limits.title >= entered.length;

      let e;
      if (!passesLength) {
        try {
          new Discord.MessageEmbed().setTitle(entered);
        } catch (err) {
          e = err;
        }
      }

      if (e || !passesLength) {
        let valid;
        if (!passesLength) valid = 'length';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setTitle(entered);
      break;
    }
    case 'url': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setURL(entered);
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setURL(entered);
      break;
    }
    case 'author-name': {
      const passesLength = limits['author-name'] >= entered.length;

      let e;
      if (!passesLength) {
        try {
          new Discord.MessageEmbed().setAuthor({ name: entered });
        } catch (err) {
          e = err;
        }
      }

      if (e || !passesLength) {
        let valid;
        if (!passesLength) valid = 'length';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setAuthor({
        name: entered,
        url: Objects.embed.author?.url,
        iconURL: Objects.embed.author?.iconURL,
      });
      break;
    }
    case 'author-iconURL': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setAuthor({ iconURL: entered });
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setAuthor({
        name: Objects.embed.author?.name,
        url: Objects.embed.author?.url,
        iconURL: entered,
      });
      break;
    }
    case 'author-url': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setAuthor({ url: entered });
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setAuthor({
        name: Objects.embed.author?.name,
        url: entered,
        iconURL: Objects.embed.author?.iconURL,
      });
      break;
    }
    case 'description': {
      let e;
      try {
        new Discord.MessageEmbed().setDescription(entered);
      } catch (err) {
        e = err;
      }

      if (e) {
        errored = await errorVal(e);
        break;
      }

      Objects.embed.setDescription(entered);
      break;
    }
    case 'image': {
      let isUrl = false;
      try {
        // eslint-disable-next-line no-new
        new URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setImage(entered);
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setImage(entered);
      break;
    }
    case 'thumbnail': {
      let isUrl = false;
      try {
        // eslint-disable-next-line no-new
        new URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setThumbnail(entered);
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setThumbnail(entered);
      break;
    }

    case 'timestamp': {
      let isTimestamp = false;
      try {
        // eslint-disable-next-line no-new
        new Date(entered);
        isTimestamp = true;
      } catch (err) {
        isTimestamp = false;
      }

      let e;
      try {
        new Discord.MessageEmbed().setTimestamp(entered);
      } catch (err) {
        e = err;
      }

      if (e || !isTimestamp) {
        let valid;
        if (!isTimestamp) valid = 'noTimestamp';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setTimestamp(entered);
      break;
    }
    case 'footer-text': {
      let e;
      try {
        new Discord.MessageEmbed().setFooter({ text: entered });
      } catch (err) {
        e = err;
      }

      if (e) {
        errored = await errorVal(e);
        break;
      }

      Objects.embed.setFooter({ text: entered });
      break;
    }
    case 'footer-iconURL': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setFooter({ iconURL: entered });
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = await errorVal(e, valid);
        break;
      }

      Objects.embed.setFooter({ iconURL: entered });
      break;
    }
  }

  if (errored) return embedButtonsHandler(Objects, msg, answer, true);
  return module.exports.builder(msg, null, Objects.embed);
};

const handleReactionsCollector = async (
  { msg, answer },
  collector,
  Objects,
  { needsBack, needsPages },
  parentResolve,
) => {
  const reactionsCollector = msg.m.createReactionCollector({ time: 120000 });

  if (needsBack) {
    if (
      !msg.m.reactions.cache
        .get(msg.client.constants.emotes.back)
        ?.users.cache.has(msg.client.user.id)
    ) {
      msg.m.react(msg.client.constants.emotes.back).catch(() => {});
    }
  }
  if (needsPages && needsPages.length) {
    needsPages.forEach((page, i) => {
      if (
        !msg.m.reactions.cache
          .get(msg.client.constants.emotes.numbers[page])
          ?.users.cache.has(msg.client.user.id)
      ) {
        setTimeout(() => {
          msg.m.react(msg.client.constants.emotes.numbers[page]).catch(() => {});
        }, i * 1000);
      }
    });
  }

  const returned = await new Promise((resolve) => {
    reactionsCollector.on('collect', async (reaction, user) => {
      if (user.id === msg.client.user.id) return;
      reaction.users.remove(user.id);
      if (user.id !== msg.author.id && user.id !== msg.client.user.id) {
        return;
      }

      if (collector) collector.stop();
      reactionsCollector.stop();

      resolve(
        await module.exports.builder(
          msg,
          answer,
          Objects.embed,
          Array.isArray(needsPages) && needsPages.includes(Number(reaction.emoji.name[0]))
            ? Number(reaction.emoji.name[0])
            : Objects.page,
        ),
      );
    });

    if (collector) {
      collector.on('end', () => {
        reactionsCollector.stop();
      });
    }
  });

  if (parentResolve) {
    parentResolve(returned);
  }
  return returned;
};

const handleBuilderButtons = async ({ msg, answer }, Objects, lan, embed) => {
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 120000 });
  let ended = false;

  const returned = await new Promise((resolve) => {
    handleReactionsCollector(
      { msg, answer },
      buttonsCollector,
      Objects,
      {
        needsBack: false,
        needsPages: [1, 2, 3],
      },
      resolve,
    );

    buttonsCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction, msg);
        return;
      }

      buttonsCollector.stop();

      switch (interaction.customId) {
        default: {
          resolve(await embedButtonsHandler(Objects, msg, interaction));
          break;
        }
        case 'viewRaw': {
          resolve(await postCode(Objects, msg, interaction, null, true));
          break;
        }
        case 'inheritCode': {
          const inheritCodeEmbed = new Discord.MessageEmbed().setDescription(
            lan.inheritCodeDescription,
          );
          await replier(
            { msg, answer: interaction },
            { embeds: [inheritCodeEmbed], components: [] },
            Objects,
          );

          const messageCollector = msg.channel.createMessageCollector({ time: 900000 });
          messageCollector.on('collect', async (message) => {
            if (msg.author.id !== message.author.id) return;

            message.delete().catch(() => {});

            try {
              const code = JSON.parse(
                message.content ||
                  (await msg.client.ch.convertTxtFileLinkToString(message.attachments.first().url)),
              );

              Objects.embed = new Discord.MessageEmbed(code);
              messageCollector.stop();
              resolve(await module.exports.builder(msg, answer, Objects.embed));
            } catch (e) {
              msg.client.ch
                .reply(msg, {
                  content: `${e}\n${lan.warns.resolveAndRetry}`,
                })
                .then((m) => {
                  setTimeout(() => m.delete().catch(() => {}), 10000);
                });
            }
          });

          messageCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
              ended = true;
              postCode(Objects, msg);
            }
          });
          break;
        }
        case 'send': {
          resolve(await handleSend(msg, interaction, Objects));
          break;
        }
        case 'save': {
          const emb = await handleSave(msg, interaction, Objects);
          resolve(emb);
          break;
        }
        case 'viewRawOtherMsg': {
          resolve(await handleOtherMsgRaw(msg, interaction, Objects));
          break;
        }
        case 'add-field': {
          Objects.embed.addField('\u200b', '\u200b', false);

          await replier(
            { msg, answer: interaction },
            { embeds: [embed], components: getComponents(msg, { page: 2, Objects }) },
            Objects,
          );

          resolve(module.exports.builder(msg, interaction, Objects.embed, 2));
          break;
        }
        case 'field-select': {
          resolve(await fieldSelect(msg, interaction, Objects));
          break;
        }
      }
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time' && !ended) {
        ended = true;
        postCode(Objects, msg, null);
        resolve(null);
      }
    });
  });

  return returned;
};

const fieldSelect = async (msg, answer, Objects) => {
  msg.m.reactions.removeAll().catch(() => {});

  const baseLan = msg.language.commands.embedbuilder;

  const index = answer.values[0];
  const selected = Objects.embed.fields[index];
  let editing = 'name';

  const getFieldComponents = () => {
    return [
      [
        new Discord.MessageButton()
          .setCustomId('remove-field')
          .setLabel(baseLan.removeField)
          .setStyle('DANGER'),
      ],
      [
        new Discord.MessageButton()
          .setCustomId('name')
          .setLabel(baseLan.fieldName)
          .setStyle(editing === 'name' ? 'PRIMARY' : 'SECONDARY'),
        new Discord.MessageButton()
          .setCustomId('value')
          .setLabel(baseLan.fieldValue)
          .setStyle(editing === 'value' ? 'PRIMARY' : 'SECONDARY'),
        new Discord.MessageButton()
          .setCustomId('inline')
          .setLabel(baseLan.fieldInline)
          .setStyle(selected.inline ? 'SUCCESS' : 'SECONDARY'),
      ],
    ];
  };

  const getEmbed = () => {
    return new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(baseLan.chooseTheEdit);
  };

  await replier(
    { msg, answer },
    { embeds: [getEmbed()], components: getFieldComponents() },
    Objects,
  );

  return new Promise((resolve) => {
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });

    handleReactionsCollector(
      { msg, answer },
      buttonsCollector,
      Objects,
      { needsBack: true, needsPages: false },
      resolve,
    );

    buttonsCollector.on('end', (collected, reason) => {
      if (reason !== 'time') messageCollector.stop();
      else {
        resolve(null);
        postCode(Objects, msg, answer);
      }
    });

    messageCollector.on('collect', async (message) => {
      messageCollector.resetTimer();
      const collected = message.content;

      message.delete().catch(() => {});
      switch (editing) {
        default: {
          break;
        }
        case 'name': {
          try {
            new Discord.MessageEmbed().addField(collected, '\u200b');
            selected.name = collected;
          } catch (e) {
            msg.client.ch
              .reply(msg, {
                content: `${e}\n${baseLan.warns.resolveAndRetry}`,
              })
              .then((m) => setTimeout(() => m.delete().catch(() => {}), 10000));
          }
          break;
        }
        case 'value': {
          try {
            new Discord.MessageEmbed().addField('\u200b', collected);
            selected.value = collected;
          } catch (e) {
            msg.client.ch
              .reply(msg, {
                content: `${e}\n${baseLan.warns.resolveAndRetry}`,
              })
              .then((m) => setTimeout(() => m.delete().catch(() => {}), 10000));
          }
          break;
        }
      }

      await replier(
        { msg, answer },
        { embeds: [getEmbed()], components: getFieldComponents() },
        Objects,
      );
    });
    buttonsCollector.on('collect', async (interaction) => {
      buttonsCollector.resetTimer();

      switch (interaction.customId) {
        default: {
          break;
        }
        case 'inline': {
          selected.inline = !selected.inline;
          break;
        }
        case 'remove-field': {
          Objects.embed.fields.splice(index, 1);
          resolve(module.exports.builder(msg, interaction, Objects.embed, 2));
          return;
        }
        case 'name': {
          editing = 'name';
          break;
        }
        case 'value': {
          editing = 'value';
          break;
        }
      }

      await replier(
        { msg, answer: interaction },
        { embeds: [getEmbed()], components: getFieldComponents() },
        Objects,
      );
    });
  });
};
