const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const db = require('quick.db');
const useful = require('useful-tools');
client.ayar = db;
const covid = require("novelcovid");

client.htmll = require('cheerio');
client.useful = useful;
client.tags = require('html-tags');

let profil = JSON.parse(fs.readFileSync('./profil.json', 'utf8'))
client.profil = profil

client.ayarlar = {
  "prefix": "!", //prefix
  "sunucu" : "778613507708944385", // Sunucunuzun ID
  "token" : "NzY4Mzc5NDkxMzY5MzUzMjI2.X4_nKg.fNTA0dHIyk64njeAa1ap1bYujC4",//token
  "site" : "https://decisive-victorious-justice.glitch.me", // Siteninizin linki
  "oauthSecret": "yksvZxior8mWi1myMIvJVrAh9TNXo6PQ", //bot secreti
	"callbackURL": "https://decisive-victorious-justice.glitch.me/callback", //benim sitenin urlsini kendin ile değiş "/callback" kalacak!
	"kayıt": "785865219187671071", //onaylandı, reddedildi, başvuru yapıldı falan kayıtların gideceği kanalın ID'ini yazacaksın
  "oylog" : "786613481230303294", // oy verilince loga mesaj atcak log kanal id
  "renk": "RED" //embed renk
};
client.roles = {
  Geliştirici : "785918916962287617", // Botu Onaylanan kişiye Geliştirici rolü verilcek rol id gir
  otobot : "785865118306795531"//Destek sunucusuna bot gelince otorol vermesi için rol id gir
}

client.yetkililer = ["733757903139504148"] //tüm yetkililerin ıdleri gelcek array
client.webyetkililer = ["733757903139504148"] //web yetkililerin ıdleri gelcek array
client.sunucuyetkililer = ["733757903139504148"] //sunucu yetkililerin ıdleri gelcek array

//["id", "id2"]

client.on('ready', async () => {
   client.appInfo = await client.fetchApplication();
  setInterval( async () => {
    client.appInfo = await client.fetchApplication();
  }, 60000);
  
   require("./app.js")(client);
  
  client.user.setActivity(`Lrows`, { type:"WATCHING" })
  
  console.log("Bot Aktif!")
});




const chalk = require('chalk')

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
fs.readdir(`./komutlar/`, (err, files) => {
	let jsfiles = files.filter(f => f.split(".").pop() === "js")

	if(jsfiles.length <= 0) {
		console.log("Olamazz! Hiç komut dosyası bulamadım!")
	} else {
		if (err) {
			console.error("Hata! Bir komutun name veya aliases kısmı yok!")
		}
		console.log(`${jsfiles.length} komut yüklenecek.`)

		jsfiles.forEach(f => {
			let props = require(`./komutlar/${f}`)
			client.commands.set(props.help.name, props)
			props.conf.aliases.forEach(alias => {
				client.aliases.set(alias, props.help.name)
			})
			console.log(`Yüklenen komut: ${props.help.name}`)
		})
	}
});

client.on("guildMemberAdd", member => {
      if (member.user.bot === true) {
          member.addRole(member.guild.roles.find(r=>r.id==client.roles.otobot)) 
       } else {
       }
}); 





client.on("message", async message => {

	if (message.author.bot) return
	if (!message.content.startsWith('!')) return
	var command = message.content.split(' ')[0].slice('!'.length)
	var args = message.content.split(' ').slice(1)
	var cmd = ''

	if (client.commands.has(command)) {
		var cmd = client.commands.get(command)
	} else if (client.aliases.has(command)) {
		var cmd = client.commands.get(client.aliases.get(command))
	}

	if (cmd) {
    if (cmd.conf.permLevel === 'ozel') { //o komutu web yetkilileri kullanabsiln sadece diye yaptıgım bişe 
      if (client.yetkililer.includes(message.author.id) === false) {
        const embed = new Discord.RichEmbed()
					.setDescription(`Bu komutu kullanabilmek için website yetkilisi olmalısın !`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Yetersiz yetki !")
				return
      }
    }
    
		if (cmd.conf.permLevel === 1) {
			if (!message.member.hasPermission("MANAGE_MESSAGES")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Bu komutu kullanabilmek için mesajları yönet yetkisine sahip olmalısın !`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Yetersiz yetki !")
				return
			}
		}
		if (cmd.conf.permLevel === 2) {
			if (!message.member.hasPermission("KICK_MEMBERS")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Bu komutu kullanabilmek için üyeleri at yetkisine sahip olmalısın !`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Yetersiz yetki !")
				return
			}
		}
		if (cmd.conf.permLevel === 3) {
			if (!message.member.hasPermission("ADMINISTRATOR")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Bu komutu kullanabilmek için yönetici yetkisine sahip olmalısın !`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Yetersiz yetki !")
				return
			}
		}
		if (cmd.conf.permLevel === 4) {
			const x = await client.fetchApplication()
      var arr = [x.owner.id, '']
			if (!arr.includes(message.author.id)) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Yetersiz yetki !`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Yetersiz yetki !")
				return
			}
		}
		if (cmd.conf.enabled === false) {
			const embed = new Discord.RichEmbed()
				.setDescription(`Bu komut sunucuda devre dışı bırakılmış !`)
				.setColor(client.ayarlar.renk)
				.setTimestamp()
			message.channel.send("Bu komut devre dışı !")
			return
		}
		if(message.channel.type === "dm") {
			if (cmd.conf.guildOnly === true) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Bu komutu özel mesajlarda kullanamazsın !`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Bu komut özel mesajlarda kullanıma kapalı !")
				return
			}
		}
		cmd.run(client, message, args)
	}
});



client.login(client.ayarlar.token)

process.env = {}
