import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (stage: Eris.StageInstance) => {
  const guild = client.guilds.get(stage.guild.id);
  if (!guild) return;

  const channels = (
    await client.ch
      .query('SELECT stageevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].stageevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);

  const lan = language.events.stageOpen;
  const con = client.constants.events.stageOpen;

  const audit = await getAudit(guild);

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/channels/${guild.id}/${stage.channel.id}`,
    },
    color: con.color,
    description: audit
      ? client.ch.stp(lan.descDetails, { user: audit.user, channel: stage.channel })
      : lan.desc,
    fields: [],
  });

  const embed = getEmbed();

  if (audit && audit.reason) {
    embed.fields?.push({ name: language.reason, value: audit.reason, inline: false });
  }

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};

const getAudit = async (guild: Eris.Guild) => {
  if (!guild?.members.get(client.user.id)?.permissions.has(128n)) return null;

  const audits = await guild.getAuditLog({ limit: 5, actionType: 83 });
  if (!audits || !audits.entries) return null;

  return audits.entries.sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
};