const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, PermissionsBitField, ChannelType, AttachmentBuilder } = require('discord.js');

// --- AYARLAR ---
const TOKEN = "MTU1MzM0NTM0NDc1NzMwMTMyOA.GkSb9Z.LKdIbRCGJgORNcG8_jSbmZR5nVlcmB0SvNmfwU";
const CLIENT_ID = "1553345344757301328";
const ANA_LOG_KANAL_ID = "1553345029576335390";

const KURUCU_ID = "1437757019846082592";
let YETKILI_LISTE = [
    "1527991456164483124",
    "1437757019846082592",  // Sizin ID'niz (Kurucu)
    "1526168851430244494",
    "1384223744561643652", // Arkadaş 1
    "1009101353248890991",
    "1550658038757728318",
    "1534217822094491698",
    "1485664089345888428"  // Arkadaş 2
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences 
    ]
});

// --- KOMUTLAR ---
const commands = [
    { name: 'saldiri', description: 'Gelişmiş saldırı panelini açar.', integration_types: [0, 1], contexts: [0, 1, 2], options: [{ name: 'mesaj', type: 3, description: 'Saldırı metni', required: true }] },
    { name: 'yetki_ver', description: 'Sisteme yeni bir yetkili ekler.', options: [{ name: 'kullanici', type: 6, description: 'Yetki verilecek kişi', required: true }] },
    { name: 'yetki_al', description: 'Sistemden bir yetkiliyi çıkarır.', options: [{ name: 'kullanici', type: 6, description: 'Yetkisi alınacak kişi', required: true }] }
];

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`[SYSTEM] Bot Aktif: ${client.user.tag}`);
        
        const anaLog = client.channels.cache.get(ANA_LOG_KANAL_ID);
        if (anaLog) {
            const bootEmbed = new EmbedBuilder()
                .setAuthor({ name: ' LOGS System', iconURL: client.user.displayAvatarURL() })
                .setTitle('🚀 Sistem Yeniden Başlatıldı')
                .setDescription('Botun tüm fonksiyonları ve güvenlik protokolleri başarıyla yüklendi.')
                .addFields(
                    { name: '💠 Bot Durumu', value: '`Çevrimiçi / Aktif`', inline: true },
                    { name: '🛠 Versiyon', value: '`v4.0.2 (Private)`', inline: true },
                    { name: '🔑 Master ID', value: `\`${KURUCU_ID}\``, inline: false },
                    { name: '👥 Yetkili Sayısı', value: `\`${YETKILI_LISTE.length} kişi\``, inline: false }
                )
                .setColor(0x2b2d31)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'Sistem İzleniyor', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();
            anaLog.send({ embeds: [bootEmbed] });
        }
    } catch (error) { console.error(error); }
});

// --- İŞLEMLER ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
    const anaLog = client.channels.cache.get(ANA_LOG_KANAL_ID);

    // Yetki Kontrolü Logu
    if (!YETKILI_LISTE.includes(interaction.user.id)) {
        if (anaLog) {
            const unauthorizedEmbed = new EmbedBuilder()
                .setAuthor({ name: '⚠️ GÜVENLİK İHLALİ', iconURL: interaction.user.displayAvatarURL() })
                .setColor(0xff0000)
                .setTitle('Yetkisiz Erişim Engellendi')
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: '👤 Kullanıcı', value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true },
                    { name: '📂 Eylem', value: `\`/${interaction.commandName || 'Buton'}\``, inline: true },
                    { name: '📍 Konum', value: interaction.guild ? interaction.guild.name : 'DM / Private', inline: false }
                )
                .setFooter({ text: 'İzinsiz işlem kayda alındı.' })
                .setTimestamp();
            anaLog.send({ embeds: [unauthorizedEmbed] });
        }
        return interaction.reply({ content: "❌ **Bu sisteme erişim yetkiniz bulunmamaktadır.**", ephemeral: true });
    }

    // YETKİ VERME (Sadece Kurucu)
    if (interaction.commandName === 'yetki_ver') {
        if (interaction.user.id !== KURUCU_ID) {
            return interaction.reply({ content: "❌ Bu işlemi sadece **Kurucu** yapabilir.", ephemeral: true });
        }
        
        const targetUser = interaction.options.getUser('kullanici');
        
        // Kendine yetki vermeyi engelle
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({ content: "❌ **Kendine yetki veremezsin!**", ephemeral: true });
        }
        
        if (!YETKILI_LISTE.includes(targetUser.id)) {
            YETKILI_LISTE.push(targetUser.id);
            if (anaLog) {
                const addPermEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Yeni Yetkili Tanımlandı')
                    .setAuthor({ name: 'Yetki Güncellemesi', iconURL: targetUser.displayAvatarURL() })
                    .addFields(
                        { name: '👤 İşlemi Yapan', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '👤 Yetki Verilen', value: `<@${targetUser.id}>`, inline: true },
                        { name: '🆔 Kullanıcı ID', value: `\`${targetUser.id}\``, inline: false },
                        { name: '📊 Toplam Yetkili', value: `\`${YETKILI_LISTE.length} kişi\``, inline: false }
                    )
                    .setThumbnail(targetUser.displayAvatarURL())
                    .setColor(0x00FF00)
                    .setFooter({ text: 'Erişim listesi güncellendi.' })
                    .setTimestamp();
                anaLog.send({ embeds: [addPermEmbed] });
            }
            return interaction.reply({ content: `✅ **${targetUser.tag}** listeye eklendi.`, ephemeral: true });
        } else {
            return interaction.reply({ content: `⚠️ **${targetUser.tag}** zaten listede mevcut.`, ephemeral: true });
        }
    }

    // YETKİ ALMA (Sadece Kurucu)
    if (interaction.commandName === 'yetki_al') {
        if (interaction.user.id !== KURUCU_ID) {
            return interaction.reply({ content: "❌ Bu işlemi sadece **Kurucu** yapabilir.", ephemeral: true });
        }
        
        const targetUser = interaction.options.getUser('kullanici');
        
        // Kendini listeden çıkarmayı engelle
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({ content: "❌ **Kendini listeden çıkaramazsın!**", ephemeral: true });
        }
        
        if (YETKILI_LISTE.includes(targetUser.id)) {
            YETKILI_LISTE = YETKILI_LISTE.filter(id => id !== targetUser.id);
            if (anaLog) {
                const removePermEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Yetkili Çıkarıldı')
                    .setAuthor({ name: 'Yetki Güncellemesi', iconURL: targetUser.displayAvatarURL() })
                    .addFields(
                        { name: '👤 İşlemi Yapan', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '👤 Yetkisi Alınan', value: `<@${targetUser.id}>`, inline: true },
                        { name: '🆔 Kullanıcı ID', value: `\`${targetUser.id}\``, inline: false },
                        { name: '📊 Kalan Yetkili', value: `\`${YETKILI_LISTE.length} kişi\``, inline: false }
                    )
                    .setThumbnail(targetUser.displayAvatarURL())
                    .setColor(0xFF0000)
                    .setFooter({ text: 'Erişim listesi güncellendi.' })
                    .setTimestamp();
                anaLog.send({ embeds: [removePermEmbed] });
            }
            return interaction.reply({ content: `✅ **${targetUser.tag}** listeden çıkarıldı.`, ephemeral: true });
        } else {
            return interaction.reply({ content: `⚠️ **${targetUser.tag}** zaten listede değil.`, ephemeral: true });
        }
    }

    // SALDIRI PANELİ
    if (interaction.commandName === 'saldiri') {
        const msg = interaction.options.getString('mesaj');
        
        // Mesaj uzunluk kontrolü
        if (msg.length > 1900) {
            return interaction.reply({ 
                content: "❌ **Mesaj çok uzun!** Maksimum 1900 karakter olmalı.", 
                ephemeral: true 
            });
        }
        
        const mainPanelEmbed = new EmbedBuilder()
            .setAuthor({ name: '⚔️ SALDIRI PANELİ', iconURL: client.user.displayAvatarURL() })
            .setTitle('🎯 Atış Hazırlığı Tamamlandı')
            .setDescription(`Hedef metin sisteme yüklendi. Saldırıyı başlatmak için butonlardan birine tıkla.`)
            .addFields(
                { name: '📝 Yüklenen Mesaj', value: `\`\`\`${msg}\`\`\`` },
                { name: '📊 Mesaj Uzunluğu', value: `\`${msg.length} karakter\``, inline: true },
                { name: '👤 Yetkili', value: `<@${interaction.user.id}>`, inline: true }
            )
            .setThumbnail('https://i.imgur.com/8Nf9vXq.png')
            .setColor(0x2b2d31)
            .setFooter({ text: 'Görünmezlik Modu: Aktif', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`v_1_${msg}`)
                .setLabel('🟢 Düşük (x1)')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`v_5_${msg}`)
                .setLabel('🟡 Orta (x5)')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`v_10_${msg}`)
                .setLabel('🟠 Yüksek (x10)')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`v_20_${msg}`)
                .setLabel('🔴 Maksimum (x20)')
                .setStyle(ButtonStyle.Danger)
        );
        
        await interaction.reply({ embeds: [mainPanelEmbed], components: [row], ephemeral: true });
    }

    // BUTON VE SALDIRI LOGU
    if (interaction.isButton()) {
        await interaction.deferUpdate();
        const [, count, ...msgParts] = interaction.customId.split('_');
        const rawText = msgParts.join('_');
        
        // Log gönder
        if (anaLog) {
            const attackLogEmbed = new EmbedBuilder()
                .setAuthor({ name: '🔥 Saldırı Raporu', iconURL: interaction.user.displayAvatarURL() })
                .setTitle('⚡ Operasyon Gerçekleştirildi')
                .setColor(0xff4500)
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: '👤 Operatör', value: `${interaction.user.tag}`, inline: true },
                    { name: '📊 Güç (Kat)', value: `\`x${count}\``, inline: true },
                    { name: '📁 Toplam Gönderim', value: `\`${count} mesaj\``, inline: true },
                    { name: '💬 Mesaj İçeriği', value: `\`\`\`${rawText.substring(0, 500)}${rawText.length > 500 ? '...' : ''}\`\`\`` },
                    { name: '🌐 Sunucu', value: interaction.guild ? interaction.guild.name : 'Özel Mesaj', inline: true },
                    { name: '📁 Kanal', value: `<#${interaction.channelId}>`, inline: true }
                )
                .setFooter({ text: 'Log Kaydı Başarıyla Oluşturuldu', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();
            anaLog.send({ embeds: [attackLogEmbed] });
        }
        
        // Mesajları gönder
        let maxBuffer = "";
        const cleanText = rawText.replace(/@everyone/g, '@\u200beveryone').replace(/@here/g, '@\u200bhere');
        
        while ((maxBuffer.length + cleanText.length + 1) < 2000) {
            maxBuffer += cleanText + "\n";
        }
        
        // Son boş satırı temizle
        maxBuffer = maxBuffer.trimEnd();
        
        try {
            for (let i = 0; i < parseInt(count); i++) {
                await interaction.followUp({ content: maxBuffer });
                // Rate limit koruması için küçük bekleme
                if (i % 5 === 0 && i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
        }
    }
});

// Hata yakalama
client.on('error', console.error);
process.on('unhandledRejection', console.error);

client.login(TOKEN);