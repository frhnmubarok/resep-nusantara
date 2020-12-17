async function handleHelp(context) {
	try {
		await context.sendText(
			"Berikut perintah bot : \n/kategori = Mencari resep berdasarkan kategori yang tersedia \n/artikel = Menampilkan artikel seputar masakan \n/cari = Mencari resep berdasarkan kata kunci, contoh : /cari nasi goreng"
		);
		const quickReply = {
			items: [
				{
					type: "action",
					action: {
						type: "message",
						label: "Kategori",
						text: "/kategori",
					},
				},
				{
					type: "action",
					action: {
						type: "message",
						label: "Artikel",
						text: "/artikel",
					},
				},
				{
					type: "action",
					action: {
						type: "postback",
						label: "Cari",
						data: "pb-cari",
					},
				},
			],
		};
		await context.send([
			{
				type: "text",
				text: "Atau bisa langsung menekan tombol dibawah ini",
				quickReply,
			},
		]);
	} catch (err) {
		console.log(err);
	}
}

async function handleFollow(context) {
	await context.sendText(
		`Hai!. Terima kasih telah follow akun ini ${String.fromCodePoint(
			0x100078
		)}. Kami menyediakan resep-resep masakan dari Indonesia. Kalian bisa cari resep berdasarkan kategori, atau berdasarkan kata kunci yang kalian inginkan (contoh: nasi goreng). Selamat memasak ${String.fromCodePoint(
			0x10008d
		)}`
	);
	await context.sendText(
		"Silahkan ketik /help untuk menampilkan perintah yang ada di bot ini"
	);
}

async function handlePostback(context) {
	try {
		if (context.event.postback.data === "pb-cari") {
			await context.sendText(
				"Silakan ketik /cari dilanjut dengan kata kunci. Contoh : /cari nasi goreng"
			);
		} else if (context.event.postback.data.split(" ").includes("kategori")) {
			let splitted = context.event.postback.data.split(" ").splice(0, 1);
			return withProps(categoryDetails, { resep: splitted[0] });
		} else if (context.event.postback.data.split(" ").includes("resep")) {
			let splitted = context.event.postback.data.split(" ").splice(0, 1);
			return withProps(recipeDetails, { resep: splitted[0] });
		}
		let splitted = context.event.postback.data.split(" ").splice(0, 1);
		console.log(splitted);
	} catch (err) {
		console.log(err);
	}
}


module.exports = { handleHelp };
