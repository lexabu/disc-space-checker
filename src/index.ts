import { NodeSSH } from 'node-ssh';
import { Client, Intents } from 'discord.js';
import { config } from 'dotenv';
import * as cron from 'cron';

config();

const {
  BIGTIME_IP_ADDRESS,
  BOOSH_DISCORD_USER_ID,
  DISC_CHECKER_PASSWORD,
  DISC_CHECKER_USERNAME,
  DISCORD_BOT_TOKEN,
  JP_DISCORD_USER_ID,
} = process.env;

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once('ready', async () => {
  const scheduledMessage = new cron.CronJob(
    '0 9 * * *',
    async () => {
      const ssh = new NodeSSH();

      await ssh.connect({
        host: BIGTIME_IP_ADDRESS,
        username: DISC_CHECKER_USERNAME,
        password: DISC_CHECKER_PASSWORD,
      });

      const { stdout } = await ssh.execCommand('df -h /dev/vda1');

      const split = stdout.split(' ');

      const percentUsage = split[split.length - 2];

      const booshUserId = await client.users.fetch(
        BOOSH_DISCORD_USER_ID as string,
      );
      const jpUserId = await client.users.fetch(JP_DISCORD_USER_ID as string);

      booshUserId.send(`BigTime validator disc usage is at ${percentUsage}.`);
      jpUserId.send(`BigTime validator disc usage is at ${percentUsage}.`);
    },
    null,
    true,
    'America/Chicago',
  );

  scheduledMessage.start();
});

client.login(DISCORD_BOT_TOKEN);
